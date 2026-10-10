// Generates 40 HTML files (4 downloaders × 10 languages) + static pages. Run: npm run build
const fs = require('fs'), path = require('path');
const { T } = require('./translations');
const { DOWNLOADERS, LANDINGS, GUIDES, STATIC, SITE_URL } = require('./pages');

const tpl = fs.readFileSync(path.join(__dirname, 'src/template.html'), 'utf8');
const pubDir = path.join(__dirname, 'public');

const LANGS = Object.keys(T); // en, ar, fr, es, pt, id, hi, de, ja, zh
const MODES = [
  { key: 'mp4',   hi: 0, slug: 'Download-X-Video' },
  { key: 'photo', hi: 1, slug: 'Download-X-GIF' },
  { key: 'story', hi: 2, slug: 'Download-X-HD' },
  { key: 'mp3',   hi: 3, slug: 'Download-X-MP3' },
];

const LANG_NAMES = {};
LANGS.forEach(l => { LANG_NAMES[l] = T[l].langName; });

// ── Helpers ──
function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function out(f, c) {
  const fp = path.join(pubDir, f);
  ensureDir(path.dirname(fp));
  fs.writeFileSync(fp, c);
  console.log('built', f);
}

// Build language <option> list for a given lang + mode
function langOptions(currentLang, modeSlug) {
  return LANGS.map(l => {
    const href = `/${l}/${modeSlug}`;
    const sel = l === currentLang ? ' selected' : '';
    return `<option value="${l}" data-href="${href}"${sel}>${T[l].langName}</option>`;
  }).join('');
}

// Build lang map JSON for JS navigation
function langMapJson(modeSlug) {
  const map = {};
  LANGS.forEach(l => {
    map[l] = `/${l}/${modeSlug}`;
  });
  return JSON.stringify(map);
}

// Build error messages JSON for a language
function errorsJson(lang) {
  const t = T[lang];
  return JSON.stringify({
    INVALID: t.errInvalid,
    PRIVATE: t.errPrivate,
    GONE: t.errGone,
    RATE: t.errRate,
    BUSY: t.errBusy,
    UNSUPPORTED: t.errUnsupported,
    NO_BACKEND: t.errNoBackend,
    NETWORK: t.errNetwork,
  });
}

// Fill template with all translation placeholders
function fillTemplate(lang, mode) {
  const t = T[lang];
  const m = mode; // { key, hi, slug }
  const prefix = `/${lang}`;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Page-specific title & description
  const dlInfo = DOWNLOADERS[m.key];
  const title = t.heroTitles[m.hi] + ' — SnapX';
  const desc = t.sub;

  let html = tpl;

  // All replacements
  const replacements = {
    '{{LANG}}': lang,
    '{{DIR}}': dir,
    '{{TITLE}}': title,
    '{{DESC}}': desc,
    '{{MODE}}': m.key,
    '{{HI}}': String(m.hi),
    '{{LANG_PREFIX}}': prefix,
    '{{LANG_OPTIONS}}': langOptions(lang, m.slug),
    '{{LANG_MAP_JSON}}': langMapJson(m.slug),
    '{{ERRORS_JSON}}': errorsJson(lang),

    // Nav
    '{{NAV_0}}': t.nav[0],
    '{{NAV_1}}': t.nav[1],
    '{{NAV_2}}': t.nav[2],
    '{{NAV_3}}': t.nav[3],

    // Hero
    '{{BADGE}}': t.badge,
    '{{HERO}}': t.heroTitles[m.hi],
    '{{SUB}}': t.sub,

    // Download card
    '{{DL_LABEL}}': t.dlLabel,
    '{{DL_TITLE}}': t.dlTitle,
    '{{DL_FIELD_LABEL}}': t.dlFieldLabel,
    '{{PLACEHOLDER}}': t.ph,
    '{{BTN_PASTE}}': t.paste,
    '{{BTN_NEXT}}': t.next,
    '{{BTN_DL}}': t.dl,
    '{{DL_NOTE}}': t.dlNote,

    // Hero features
    '{{HF_FAST_TITLE}}': t.hfFastTitle,
    '{{HF_FAST_DESC}}': t.hfFastDesc,
    '{{HF_NOWM_TITLE}}': t.hfNoWmTitle,
    '{{HF_NOWM_DESC}}': t.hfNoWmDesc,

    // How It Works
    '{{HOW_TITLE}}': t.howTitle,
    '{{STEP1_TITLE}}': t.step1Title,
    '{{STEP1_DESC}}': t.step1Desc,
    '{{STEP2_TITLE}}': t.step2Title,
    '{{STEP2_DESC}}': t.step2Desc,
    '{{STEP3_TITLE}}': t.step3Title,
    '{{STEP3_DESC}}': t.step3Desc,

    // Features
    '{{FEAT_TITLE}}': t.featTitle,
    '{{FEAT1_TITLE}}': t.feat1Title,
    '{{FEAT1_DESC}}': t.feat1Desc,
    '{{FEAT2_TITLE}}': t.feat2Title,
    '{{FEAT2_DESC}}': t.feat2Desc,
    '{{FEAT3_TITLE}}': t.feat3Title,
    '{{FEAT3_DESC}}': t.feat3Desc,
    '{{FEAT4_TITLE}}': t.feat4Title,
    '{{FEAT4_DESC}}': t.feat4Desc,

    // FAQ
    '{{FAQ_TITLE}}': t.faqTitle,
    '{{FAQ1_Q}}': t.faq1Q,
    '{{FAQ1_A}}': t.faq1A,
    '{{FAQ2_Q}}': t.faq2Q,
    '{{FAQ2_A}}': t.faq2A,
    '{{FAQ3_Q}}': t.faq3Q,
    '{{FAQ3_A}}': t.faq3A,
    '{{FAQ4_Q}}': t.faq4Q,
    '{{FAQ4_A}}': t.faq4A,

    // Footer
    '{{FOOTER_DESC}}': t.footerDesc,
    '{{FOOTER_DOWNLOADERS}}': t.footerDownloaders,
    '{{FOOTER_RESOURCES}}': t.footerResources,
    '{{FOOTER_COMPANY}}': t.footerCompany,
    '{{FOOT_VIDEO}}': t.footVideoDownloader,
    '{{FOOT_PHOTO}}': t.footPhotoDownloader,
    '{{FOOT_STORY}}': t.footStoryDownloader,
    '{{FOOT_MP3}}': t.footMp3Downloader,
    '{{FOOT_ABOUT}}': t.footAbout,
    '{{FOOT_CONTACT}}': t.footContact,
    '{{FOOTER_COPY}}': t.footerCopy,
    '{{FOOT_PRIVACY}}': t.footPrivacy,
    '{{FOOT_TERMS}}': t.footTerms,
    '{{FOOT_COPYRIGHT}}': t.footCopyright,

    // Modal
    '{{MODAL_TITLE}}': t.modalTitle,
    '{{MODAL_BODY}}': t.modalBody,
    '{{MODAL_CLOSING}}': t.modalClosing,
    '{{MODAL_CLOSE}}': t.modalClose,

    // Countdown overlay (falls back to English when not translated)
    '{{CD_TITLE}}': t.cdTitle || 'Preparing your download',
    '{{CD_SUB}}': t.cdSub || 'Your download will start automatically…',
    '{{CD_CANCEL}}': t.cdCancel || 'Cancel',
  };

  for (const [key, val] of Object.entries(replacements)) {
    html = html.split(key).join(val);
  }

  return html;
}

// ══════════════════════════════════════════════════════════
// BUILD: 40 downloader pages (10 langs × 4 modes)
// ══════════════════════════════════════════════════════════
let count = 0;
for (const lang of LANGS) {
  for (const mode of MODES) {
    const html = fillTemplate(lang, mode);
    out(`${lang}/${mode.slug}.html`, html);
    if (mode.key === 'mp4') {
      out(`${lang}/index.html`, html);
    }
    count++;
  }
}

// ══════════════════════════════════════════════════════════
// ROOT: redirect to /en/Download-X-Video
// ══════════════════════════════════════════════════════════
out('index.html', `<!doctype html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-KRDRCMCE4Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-KRDRCMCE4Q');
</script>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=/en/Download-X-Video">
<title>Redirecting…</title>
<script>window.location.replace('/en/Download-X-Video')<\/script>
</head>
<body><p>Redirecting to <a href="/en/Download-X-Video">/en/Download-X-Video</a>…</p></body>
</html>`);

// ══════════════════════════════════════════════════════════
// STATIC PAGES: about, contact, privacy, terms, copyright
// (Keep existing static pages at root, using template header/footer from English)
// ══════════════════════════════════════════════════════════
const staticTpl = fs.readFileSync(path.join(__dirname, 'src/template.html'), 'utf8');

function buildStaticPage(P, slug) {
  const t = T['en'];
  const prefix = '/en';

  // Build a minimal page using the template header/footer structure
  let html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-KRDRCMCE4Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-KRDRCMCE4Q');
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${P.t}</title>
<meta name="description" content="${P.d}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%231d4ed8'/><path d='M16 7v12m0 0l-5-5m5 5l5-5M9 24h14' stroke='%23FFFFFF' stroke-width='3' fill='none' stroke-linecap='round'/></svg>">
<style>
:root {
  --bg: #fafafa; --surface: #ffffff; --text: #0a0a0a; --text-secondary: #525252;
  --text-muted: #a3a3a3; --blue: #1d4ed8; --blue-dark: #1e3a8a; --blue-light: #3b82f6;
  --ring: rgba(0,0,0,0.08); --ring-hover: rgba(0,0,0,0.18);
  --font-main: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Inter', system-ui, sans-serif;
  --r-3xl: 24px; --r-2xl: 16px; --r-xl: 12px; --r-lg: 10px;
}
* { box-sizing: border-box; margin: 0 }
body { font: 15px/1.7 var(--font-main); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased }
a { color: var(--blue) }
header { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid var(--ring) }
.bar { max-width: 1280px; margin: auto; padding: 14px 24px; display: flex; align-items: center; gap: 12px }
.logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 21px; text-decoration: none; margin-inline-end: auto; letter-spacing: -0.5px; color: var(--blue) }
.logo:hover { opacity: 0.7 }
nav { display: flex; gap: 2px }
nav a { padding: 7px 14px; border-radius: var(--r-lg); text-decoration: none; font-size: 13px; font-weight: 600; color: var(--text-secondary); transition: all 0.2s }
nav a:hover { color: var(--blue); background: rgba(29,78,216,0.06) }
.ic { background: var(--surface); border: 1px solid var(--ring); border-radius: var(--r-lg); padding: 7px 11px; cursor: pointer; font-size: 14px; color: var(--text-secondary) }
.ic:hover { border-color: var(--blue); color: var(--blue) }
#burger { display: none }
@media(max-width:900px) {
  #burger { display: block }
  nav { position: absolute; top: 100%; inset-inline: 0; background: rgba(255,255,255,0.98); backdrop-filter: blur(20px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); flex-direction: column; padding: 0 20px; border-bottom: 1px solid var(--ring); max-height: 0; overflow: hidden; opacity: 0; transition: all 0.35s cubic-bezier(0.4,0,0.2,1) }
  nav.open { max-height: 320px; opacity: 1; padding-block: 12px }
  nav a { font-size: 15px; padding: 10px 14px }
}
section { max-width: 1000px; margin: auto; padding: 56px 20px }
h1 { font-size: 32px; font-weight: 700; margin: 0 0 20px; color: var(--blue-dark); letter-spacing: -0.5px }
h3 { margin: 20px 0 8px; color: var(--blue-dark) }
p, ul, ol { margin-bottom: 12px }
li { margin-bottom: 4px }
details { background: var(--surface); border: 1px solid var(--ring); border-radius: var(--r-xl); padding: 14px 18px; margin-bottom: 10px }
summary { cursor: pointer; font-weight: 600; color: var(--blue-dark) }
footer { position: relative; padding: 0; color: #fff; font-size: 14px; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); overflow: hidden }
footer::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa, #1d4ed8) }
.footer-inner { max-width: 1280px; margin: auto; position: relative; z-index: 1 }
.footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; padding: 60px 24px 40px; border-bottom: 1px solid rgba(255,255,255,0.06) }
@media(max-width:768px) { .footer-top { grid-template-columns: 1fr 1fr; gap: 30px; padding: 40px 20px 30px } }
@media(max-width:480px) { .footer-top { grid-template-columns: 1fr; gap: 24px } }
.footer-brand-col { display: flex; flex-direction: column; gap: 14px }
.footer-brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 21px; color: #fff }
.footer-desc { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.45); max-width: 300px }
.footer-col h4 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #60a5fa; margin-bottom: 16px }
.footer-col a { display: block; padding: 4px 0; text-decoration: none; font-size: 13px; color: rgba(255,255,255,0.5); transition: color 0.2s }
.footer-col a:hover { color: #fff }
.footer-bottom { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px }
.footer-copy { font-size: 11px; color: rgba(255,255,255,0.3) }
.footer-legal { display: flex; gap: 20px }
.footer-legal a { font-size: 11px; text-decoration: none; color: rgba(255,255,255,0.3) }
.footer-legal a:hover { color: #fff }
</style>
</head>
<body>
<header>
  <div class="bar">
    <a class="logo" href="/en/">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#60a5fa"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#lg)"/><path d="M16 7v12m0 0l-5-5m5 5l5-5M9 24h14" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/></svg>
      SnapX
    </a>
    <nav id="nav" aria-label="Main">
      <a href="/en/Download-X-Video">Download X Video</a>
      <a href="/en/Download-X-GIF">Download X GIF</a>
      <a href="/en/Download-X-HD">Download X HD</a>
      <a href="/en/Download-X-MP3">Download X MP3</a>
    </nav>
    <select id="lang" class="ic" aria-label="Language">${LANGS.map(l => `<option value="${l}"${l==='en'?' selected':''}>${T[l].langName}</option>`).join('')}</select>
    <button id="burger" class="ic" aria-label="Menu" aria-expanded="false">☰</button>
  </div>
</header>
<main>
<section><h1>${P.h}</h1>${P.body}</section>
</main>
<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand-col">
        <div class="footer-brand">
          <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.12)"/><path d="M16 7v12m0 0l-5-5m5 5l5-5M9 24h14" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/></svg>
          SnapX
        </div>
        <p class="footer-desc">${t.footerDesc}</p>
      </div>
      <div class="footer-col">
        <h4>${t.footerDownloaders}</h4>
        <a href="/en/Download-X-Video">${t.footVideoDownloader}</a>
        <a href="/en/Download-X-GIF">${t.footPhotoDownloader}</a>
        <a href="/en/Download-X-HD">${t.footStoryDownloader}</a>
        <a href="/en/Download-X-MP3">${t.footMp3Downloader}</a>
      </div>
      <div class="footer-col">
        <h4>${t.footerResources}</h4>
        <a href="/direct-download-shortcut">Direct URL Shortcut (m)</a>
        <a href="/how-to-download-x-videos">How-To Guide</a>
        <a href="/supported-links">Supported Links</a>
        <a href="/faq">FAQ</a>
      </div>
      <div class="footer-col">
        <h4>${t.footerCompany}</h4>
        <a href="/about">${t.footAbout}</a>
        <a href="/contact">${t.footContact}</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-copy">© ${new Date().getFullYear()} ${t.footerCopy}</p>
      <div class="footer-legal">
        <a href="/privacy">${t.footPrivacy}</a>
        <a href="/terms">${t.footTerms}</a>
        <a href="/copyright">${t.footCopyright}</a>
      </div>
    </div>
  </div>
</footer>
<script>
document.getElementById('lang').onchange = e => { window.location.href = '/'+e.target.value+'/Download-X-Video' + window.location.search };
document.getElementById('burger').onclick = () => { const o=document.getElementById('nav').classList.toggle('open'); document.getElementById('burger').setAttribute('aria-expanded',o) };
</script>
</body>
</html>`;
  return html;
}

// Build static pages
for (const [key, P] of Object.entries(STATIC)) {
  out(key + '.html', buildStaticPage(P, key));
}

// Build guide pages (these use the static template too)
for (const [key, P] of Object.entries(GUIDES)) {
  out(P.slug + '.html', buildStaticPage(P, P.slug));
}

// Build landing pages (these use the downloader template with English)
for (const P of Object.values(LANDINGS)) {
  const langEn = T['en'];
  const mode = { key: P.mode, hi: P.hi, slug: P.slug };
  // Use the main template but with custom hero title
  let html = fillTemplate('en', mode);
  // Override the hero title and page title with the landing-specific text
  html = html.replace(`<h1>${langEn.heroTitles[P.hi]}</h1>`, `<h1>${P.hero}</h1>`);
  html = html.replace(`<title>${langEn.heroTitles[P.hi]} — SnapX</title>`, `<title>${P.t}</title>`);
  out(P.slug + '.html', html);
}

// 404 page
out('404.html', buildStaticPage({
  t: 'Page not found — SnapX',
  d: 'Page not found.',
  h: '404 — Page not found',
  body: '<p>The page you are looking for does not exist.</p><p><a href="/en/">Back to the home page</a></p>'
}, '404'));

// Sitemap
const urls = ['/'];
LANGS.forEach(l => {
  urls.push(`/${l}/`);
  MODES.forEach(m => { if (m.slug) urls.push(`/${l}/${m.slug}`); });
});
Object.values(STATIC).forEach(P => urls.push(P.path));
Object.values(GUIDES).forEach(P => [].concat(P.path).forEach(p => urls.push(p)));
Object.values(LANDINGS).forEach(P => [].concat(P.path).forEach(p => urls.push(p)));

out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(urls)].map(u => `<url><loc>${SITE_URL}${u}</loc></url>`).join('')}</urlset>`);
out('robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`\n✅ Built ${count} downloader pages across ${LANGS.length} languages`);
console.log(`✅ Plus static, guide, landing, and utility pages`);
