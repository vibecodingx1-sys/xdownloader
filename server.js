// X (Twitter) downloader backend. Requires: Node 18+, yt-dlp and ffmpeg on PATH.
const express = require('express'), rateLimit = require('express-rate-limit');
const { spawn } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');

const https = require('https');

function findYtDlp() {
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    return process.env.YTDLP_PATH;
  }
  
  const isWin = process.platform === 'win32';
  const names = isWin ? ['yt-dlp.exe', 'yt-dlp'] : ['yt-dlp'];
  
  // 1. Check local project directory (+ bin/)
  for (const d of [__dirname, path.join(__dirname, 'bin')]) {
    for (const n of names) {
      const local = path.join(d, n);
      if (fs.existsSync(local)) return local;
    }
  }

  // 2. Check WinGet / AppData / System Locations
  const candidateDirs = [];
  if (isWin) {
    const userProfile = process.env.USERPROFILE || 'C:\\Users\\HP';
    const localAppData = process.env.LOCALAPPDATA || path.join(userProfile, 'AppData', 'Local');
    candidateDirs.push(
      path.join(localAppData, 'Microsoft', 'WinGet', 'Packages', 'yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe'),
      path.join(localAppData, 'Microsoft', 'WinGet', 'Links'),
      path.join(userProfile, 'AppData', 'Local', 'Programs', 'yt-dlp'),
      'C:\\Program Files\\yt-dlp',
      'C:\\yt-dlp'
    );
  } else {
    candidateDirs.push('/usr/local/bin', '/usr/bin', '/opt/homebrew/bin', '/usr/bin/local');
  }

  // 3. Check System PATH
  const envPath = process.env.PATH || '';
  const pathSep = isWin ? ';' : ':';
  candidateDirs.push(...envPath.split(pathSep));

  for (const dir of candidateDirs) {
    if (!dir) continue;
    for (const n of names) {
      const full = path.join(dir.trim(), n);
      try {
        if (fs.existsSync(full)) return full;
      } catch {}
    }
  }

  return 'yt-dlp';
}

// ---------- Binary discovery & auto-provisioning ----------
const IS_WIN = process.platform === 'win32';
const BIN_DIR = path.join(__dirname, 'bin');
const EXE = IS_WIN ? '.exe' : '';

function findFfmpeg() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  const names = IS_WIN ? ['ffmpeg.exe', 'ffmpeg'] : ['ffmpeg'];
  for (const n of names) { const p = path.join(BIN_DIR, n); if (fs.existsSync(p)) return p; }
  const dirs = (process.env.PATH || '').split(IS_WIN ? ';' : ':');
  if (IS_WIN) {
    const base = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
    try {
      for (const d of fs.readdirSync(base)) {
        if (!/ffmpeg/i.test(d)) continue;
        const sub = path.join(base, d);
        for (const s of (fs.readdirSync(sub) || [])) {
          const b = path.join(sub, s, 'bin');
          if (fs.existsSync(b)) dirs.push(b);
        }
      }
    } catch {}
  }
  for (const dir of dirs) {
    if (!dir) continue;
    for (const n of names) { const p = path.join(dir.trim(), n); try { if (fs.existsSync(p)) return p; } catch {} }
  }
  return '';
}

function verifyBin(bin, flag) {
  return new Promise(resolve => {
    if (!bin) return resolve(false);
    let settled = false, p;
    try { p = spawn(bin, [flag], { stdio: ['ignore', 'ignore', 'ignore'] }); }
    catch { return resolve(false); }
    const done = ok => { if (!settled) { settled = true; clearTimeout(to); resolve(ok); } };
    const to = setTimeout(() => { try { p.kill('SIGKILL'); } catch (e) {} done(false); }, 20000);
    p.on('error', () => done(false));
    p.on('close', c => done(c === 0));
  });
}

function downloadFile(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 12) return reject(new Error('too many redirects'));
    const req = https.get(url, { headers: { 'User-Agent': 'SnapX/1.0' } }, res => {
      const code = res.statusCode, loc = res.headers.location;
      if ([301, 302, 303, 307, 308].includes(code) && loc) {
        res.resume();
        return resolve(downloadFile(new URL(loc, url).href, dest, redirects + 1));
      }
      if (code !== 200) { res.resume(); return reject(new Error('HTTP ' + code)); }
      const tmp = dest + '.part';
      const w = fs.createWriteStream(tmp);
      res.pipe(w);
      w.on('finish', () => w.close(() => { try { fs.renameSync(tmp, dest); } catch (e) { return reject(e); } resolve(); }));
      w.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(240000, () => req.destroy(new Error('download timeout')));
  });
}

function findInDir(dir, name) {
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { const r = findInDir(p, name); if (r) return r; }
      else if (e.name === name) return p;
    }
  } catch {}
  return '';
}

function runTool(cmd, args) {
  return new Promise((resolve, reject) => {
    let p;
    try { p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'ignore'] }); } catch (e) { return reject(e); }
    const to = setTimeout(() => { try { p.kill('SIGKILL'); } catch (e) {} }, 240000);
    p.on('error', reject);
    p.on('close', c => { clearTimeout(to); c === 0 ? resolve() : reject(new Error(cmd + ' exited ' + c)); });
  });
}

// Download a standalone yt-dlp binary if none can be launched.
async function ensureYtDlp() {
  if (await verifyBin(YT, '--version')) return;
  fs.mkdirSync(BIN_DIR, { recursive: true });
  const dest = path.join(BIN_DIR, 'yt-dlp' + EXE);
  if (fs.existsSync(dest) && await verifyBin(dest, '--version')) { YT = dest; return; }
  const url = IS_WIN
    ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
    : process.platform === 'darwin'
      ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos'
      : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';
  try {
    console.log('[SnapX] yt-dlp not runnable — downloading ' + url);
    await downloadFile(url, dest);
    if (!IS_WIN) fs.chmodSync(dest, 0o755);
    if (await verifyBin(dest, '--version')) { YT = dest; console.log('[SnapX] yt-dlp installed: ' + dest); }
    else console.error('[SnapX] downloaded yt-dlp did not run');
  } catch (e) { console.error('[SnapX] yt-dlp auto-install failed: ' + e.message); }
}

// Download a static ffmpeg build if none can be launched.
async function ensureFfmpeg() {
  if (await verifyBin(FF, '-version')) return;
  fs.mkdirSync(BIN_DIR, { recursive: true });
  const name = 'ffmpeg' + EXE;
  try {
    if (IS_WIN) {
      const url = 'https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip';
      const zip = path.join(BIN_DIR, 'ffmpeg.zip');
      console.log('[SnapX] ffmpeg not found — downloading ' + url);
      await downloadFile(url, zip);
      try { await runTool('tar', ['-xf', zip, '-C', BIN_DIR]); }
      catch { await runTool('powershell', ['-NoProfile', '-NonInteractive', '-Command', "Expand-Archive -LiteralPath '" + zip + "' -DestinationPath '" + BIN_DIR + "' -Force"]); }
      try { fs.rmSync(zip, { force: true }); } catch {}
    } else if (process.platform === 'linux') {
      const url = 'https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz';
      const tar = path.join(BIN_DIR, 'ffmpeg.tar.xz');
      console.log('[SnapX] ffmpeg not found — downloading ' + url);
      await downloadFile(url, tar);
      await runTool('tar', ['-xJf', tar, '-C', BIN_DIR]);
      try { fs.rmSync(tar, { force: true }); } catch {}
    } else {
      return; // no static build for this platform
    }
    const found = findInDir(BIN_DIR, name);
    if (found) {
      const dst = path.join(BIN_DIR, name);
      if (found !== dst) { try { fs.copyFileSync(found, dst); } catch {} }
      if (!IS_WIN) { try { fs.chmodSync(dst, 0o755); } catch {} }
      FF = fs.existsSync(dst) ? dst : found;
      console.log('[SnapX] ffmpeg installed: ' + FF);
    }
  } catch (e) { console.error('[SnapX] ffmpeg auto-install failed: ' + e.message); }
}

let YT = findYtDlp();
let FF = findFfmpeg();
console.log('[SnapX] yt-dlp binary:', YT);
console.log('[SnapX] ffmpeg binary:', FF || '(none found — will try to install)');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '2kb' }));
app.use((q, s, n) => {
  s.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  });
  n();
});

// Clean URLs: /x.html -> /x, legacy redirects
app.use((q, s, n) => {
  if (q.path === '/mp4' || q.path === '/mp4.html') return s.redirect(301, '/en/Download-X-Video');
  if (q.path === '/gif' || q.path === '/gif.html') return s.redirect(301, '/en/Download-X-GIF');
  if (q.path === '/mp3' || q.path === '/mp3.html') return s.redirect(301, '/en/Download-X-MP3');
  if (q.path === '/index.html') return s.redirect(301, '/en/Download-X-Video');
  if (/^\/([\w-]+)\/([\w-]+)\.html$/.test(q.path)) return s.redirect(301, q.path.slice(0, -5));
  n();
});

// ---------- Auto-download: catch X (Twitter) post paths (/user/status/ID) ----------
app.use((q, s, n) => {
  const isXPath = /^\/[\w.-]+\/status\/\d+/i.test(q.path) ||
                  /^\/status\/\d+/i.test(q.path) ||
                  /^\/i\/(?:web\/)?status\/\d+/i.test(q.path);
  if (isXPath) {
    // Reconstruct the original X / Twitter URL
    const xUrl = 'https://x.com' + q.path + (q.originalUrl.includes('?') ? '?' + q.originalUrl.split('?')[1] : '');
    return s.redirect(302, '/en/Download-X-Video?url=' + encodeURIComponent(xUrl));
  }
  n();
});

// ---------- Static pages (generated by build.js into /public) ----------
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  maxAge: 0,
  setHeaders: (s) => s.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
}));

// ---------- Helpers ----------
function validUrl(u) {
  if (!u || typeof u !== 'string' || u.length > 1000) return null;
  let str = u.trim();
  const match = str.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:x\.com|twitter\.com|t\.co|fixupx\.com|vxtwitter\.com|fxtwitter\.com)\/[^\s<>"']+/i);
  if (match) {
    str = match[0];
  } else {
    const noSchemeMatch = str.match(/(?:[a-zA-Z0-9-]+\.)*(?:x\.com|twitter\.com|fixupx\.com|vxtwitter\.com|fxtwitter\.com)\/[^\s<>"']+/i);
    if (noSchemeMatch) {
      str = 'https://' + noSchemeMatch[0];
    }
  }
  str = str.replace(/[.,;!?)]+$/, '');
  try {
    str = str.replace(/:\/\/(?:www\.|m\.)?(?:mx\.com|mtwitter\.com|mobile\.twitter\.com|fixupx\.com|vxtwitter\.com|fxtwitter\.com|fx\.com)/i, '://x.com');
    const x = new URL(str);
    const h = x.hostname.toLowerCase();
    if (x.username || x.password) return null;
    if (!(h === 'x.com' || h.endsWith('.x.com') || h === 'twitter.com' || h.endsWith('.twitter.com') || h === 't.co' || h.endsWith('.t.co'))) return null;
    return x.href;
  } catch { return null; }
}
function run(args, timeout = 60000) {
  return new Promise((res, rej) => {
    const p = spawn(YT, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '', e = '';
    const to = setTimeout(() => p.kill('SIGKILL'), timeout);
    p.stdout.on('data', d => { o += d; if (o.length > 5e6) p.kill('SIGKILL'); });
    p.stderr.on('data', d => { e += d; });
    p.on('error', (err) => { clearTimeout(to); rej({ code: 'NO_BACKEND', err: err && err.message }); });
    p.on('close', c => { clearTimeout(to); c === 0 ? res(o) : rej({ code: 'FAIL', err: e || o }); });
  });
}
function mapErr(e) {
  if (!e) return 'NETWORK';
  if (e.code === 'NO_BACKEND') return 'NO_BACKEND';
  const m = String(e.err || e.message || e || '').toLowerCase();
  
  if (/private|log ?in|age-restricted|authenticat|protected/i.test(m)) return 'PRIVATE';
  if (/unavailable|removed|not found|404|deleted|does not exist/i.test(m)) return 'GONE';
  if (/429|rate.?limit|too many/i.test(m)) return 'RATE';
  if (/unsupported|no video|no format|could be found|no media|does not contain/i.test(m)) return 'UNSUPPORTED';
  return 'NETWORK';
}
const limiter = rateLimit({ windowMs: 60000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'RATE' } });
let active = 0;
const MAX_ACTIVE = Number(process.env.MAX_JOBS || 4);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ---------- Extraction cache ----------
// Reuse the yt-dlp metadata extracted by /api/resolve so /api/download can skip
// re-extracting the post (the slow part) and start transferring immediately.
const infoCache = new Map(); // url -> { raw, body, ts }
const INFO_TTL = 10 * 60 * 1000;
function getInfo(url) {
  const e = infoCache.get(url);
  if (!e) return null;
  if (Date.now() - e.ts > INFO_TTL) { infoCache.delete(url); return null; }
  return e;
}
function setInfo(url, raw, body) {
  infoCache.set(url, { raw, body, ts: Date.now() });
  if (infoCache.size > 50) infoCache.delete(infoCache.keys().next().value);
}
const FRAGMENTS = String(process.env.FRAGMENTS || 16); // concurrent HLS fragments

// ---------- API ----------
app.post('/api/resolve', limiter, async (q, s) => {
  const u = validUrl(q.body && q.body.url);
  if (!u) return s.status(400).json({ error: 'INVALID' });
  if (active >= MAX_ACTIVE) return s.status(503).json({ error: 'BUSY' });
  active++;
  try {
    const hit = getInfo(u);
    if (hit) return s.json(hit.body); // served from cache — instant
    let raw;
    try {
      raw = await run(['-J', '--no-playlist', '--no-warnings', '--user-agent', UA, '--', u], 45000);
    } catch (err1) {
      raw = await run(['-J', '--no-playlist', '--no-warnings', '--extractor-args', 'twitter:api=syndication', '--', u], 45000);
    }
    const info = JSON.parse(raw);
    if (info.entries) return s.status(422).json({ error: 'UNSUPPORTED' });
    const seen = new Set(), formats = [];
    (info.formats || [])
      .filter(f => f.vcodec && f.vcodec !== 'none' && f.format_id !== 'download' && !/watermark/i.test(f.format_note || ''))
      .sort((a, b) => (b.height || 0) - (a.height || 0))
      .forEach(f => { const k = f.height || f.format_id; if (!seen.has(k)) { seen.add(k); formats.push({ id: f.format_id, label: f.height ? f.height + 'p' : f.format_id }); } });
    if (!formats.length) return s.status(422).json({ error: 'UNSUPPORTED' });
    const body = { title: String(info.title || 'X Video').slice(0, 140), author: info.uploader || info.uploader_id || '', thumbnail: info.thumbnail || '', duration: info.duration || 0, formats, mp3: true };
    setInfo(u, raw, body);
    s.json(body);
  } catch (e) { s.status(502).json({ error: mapErr(e) }); }
  finally { active--; }
});

app.get('/api/download', limiter, async (q, s) => {
  const u = validUrl(q.query.url), kind = q.query.kind, fid = String(q.query.fmt || '');
  if (!u || !['mp4', 'mp3'].includes(kind) || (fid && !/^[\w.-]{1,40}$/.test(fid))) return s.status(400).json({ error: 'INVALID' });
  if (active >= MAX_ACTIVE) return s.status(503).json({ error: 'BUSY' });
  active++;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'x-'));
  const clean = () => fs.rmSync(dir, { recursive: true, force: true });
  try {
    const hit = getInfo(u);
    const a = ['--no-playlist', '--no-warnings', '--user-agent', UA, '--max-filesize', '200M', '-N', FRAGMENTS, '-o', path.join(dir, 'f.%(ext)s')];
    if (FF) a.push('--ffmpeg-location', FF);
    if (kind === 'mp3') a.push('-x', '--audio-format', 'mp3');
    else a.push('-f', fid ? `${fid}+ba/${fid}` : 'b[format_id!=download]/bv*+ba/b', '--merge-output-format', 'mp4');
    if (hit && hit.raw) {
      // Reuse the cached extraction: no network re-check of the post, just transfer.
      const infoFile = path.join(dir, 'info.json');
      fs.writeFileSync(infoFile, hit.raw);
      try {
        await run([...a, '--load-info-json', infoFile], 120000);
      } catch (err1) {
        await run([...a, '--extractor-args', 'twitter:api=syndication', '--', u], 120000);
      }
    } else {
      try {
        await run([...a, '--', u], 120000);
      } catch (err1) {
        await run([...a, '--extractor-args', 'twitter:api=syndication', '--', u], 120000);
      }
    }
    const files = fs.readdirSync(dir);
    if (!files.length) throw { code: 'FAIL', err: 'no file downloaded' };
    // Pick the media file (ignore the temp info.json used for --load-info-json)
    const media = files.find(f => !/\.json$/i.test(f)) || files[0];
    s.download(path.join(dir, media), 'snapx.' + kind, clean);
  } catch (e) { clean(); s.status(502).json({ error: mapErr(e) }); }
  finally { active--; }
});

// ---------- 404 ----------
app.use((q, s) => {
  if (q.path.startsWith('/api/')) return s.status(404).json({ error: 'NOT_FOUND' });
  s.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

(async () => {
  await ensureYtDlp();
  await ensureFfmpeg();
  app.listen(process.env.PORT || 3005, () => console.log('Running on port ' + (process.env.PORT || 3005)));
})();
