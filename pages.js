// Page content. Configure with env vars: SITE_NAME, SITE_URL, CONTACT_EMAIL
const SITE = process.env.SITE_NAME || 'SnapX';
const SITE_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const EMAIL = process.env.CONTACT_EMAIL || 'contact@example.com';
const UPDATED = 'October 2026';

const DOWNLOADERS = {
  mp4: {
    rel: ["nwVideo", "mp3", "photo", "howto"],
    hero: 'Download X (Twitter) Videos',
    slug: 'Download-X-Video',
    path: ['/'],
    t: 'X Video Downloader – Save MP4 Without Watermark',
    d: 'Download X (Twitter) videos as MP4 without watermark when available. Free, fast, no app needed.',
    h: 'X (Twitter) MP4 Video Downloader',
    body: `<p>Save public X (Twitter) videos as MP4 files and choose from the qualities X (Twitter) makes available. Clean, watermark-free versions are used whenever the source offers them (<a href="/x-video-without-watermark">how it works</a>).</p>
<h3>How to download a X (Twitter) video</h3>
<ol><li>Open the video in X (Twitter) and tap <b>Share → Copy link</b>.</li><li>Paste the link into the box above and press <b>Next</b>.</li><li>Pick a quality and press <b>Download MP4</b>.</li></ol>
<h3>Good to know</h3>
<p>Only public videos work. Private, deleted or age-restricted posts cannot be downloaded. Available resolutions differ from video to video. Please download only content you own or have permission to save.</p>`,
  },
  photo: {
    rel: ["nwPhoto", "story", "mp4", "links"],
    hero: 'Download X GIFs & Images',
    path: ['/photo'],
    t: 'X GIF & Image Downloader – Save Photo Posts',
    d: 'Check and save X (Twitter) photo posts and slideshows where supported.',
    h: 'X GIF & Image Downloader',
    body: `<p>Paste the link of a X (Twitter) photo post or slideshow to check whether its images can be saved.</p>
<h3>Availability</h3>
<p>Photo-post support depends on the extractor installed on the server and on what X (Twitter) exposes publicly. If a post cannot be processed, you will see a clear "not supported" message instead of a fake result.</p>
<h3>How to use it</h3>
<ol><li>Copy the photo post link from X (Twitter).</li><li>Paste it above and press <b>Next</b>.</li><li>Download any available file.</li></ol>
<p>Looking for clean images? Read about <a href="/x-photo-without-watermark">photos without watermark</a>. If you only need the sound from a slideshow, try the <a href="/mp3">MP3 downloader</a>.</p>`,
  },
  story: {
    rel: ["photo", "mp4", "links", "faq"],
    hero: 'Download X Video HD',
    path: ['/story'],
    t: 'X Video HD Downloader – Public Stories',
    d: 'Download publicly accessible X (Twitter) stories where supported.',
    h: 'X Video HD Downloader',
    body: `<p>Paste the link of a public X (Twitter) story to see whether it can be downloaded.</p>
<h3>Limits</h3>
<p>Stories are often only visible to logged-in users and expire after 24 hours. This service never bypasses logins, privacy settings or access controls, so stories that require authentication cannot be downloaded. When a story is unsupported, you will see a clear message.</p>
<h3>How to use it</h3>
<ol><li>Copy the story link from X (Twitter).</li><li>Paste it above and press <b>Next</b>.</li><li>If it is supported, choose a format and download.</li></ol>`,
  },
  mp3: {
    rel: ["mp4", "nwVideo", "howto", "faq"],
    hero: 'Download X Audio (MP3)',
    path: ['/mp3'],
    t: 'X (Twitter) to MP3 – Extract Audio from X (Twitter) Videos',
    d: 'Convert X (Twitter) videos to MP3 audio online. Free and fast.',
    h: 'X MP3 Audio Downloader',
    body: `<p>Extract the audio track of a public X (Twitter) video and save it as an MP3 file.</p>
<h3>How to convert X (Twitter) to MP3</h3>
<ol><li>Copy the X (Twitter) video link.</li><li>Paste it above and press <b>Next</b>.</li><li>Press <b>Download MP3</b>. The audio is converted on the server and delivered when ready.</li></ol>
<h3>Good to know</h3>
<p>Music and sounds may be protected by copyright. Use downloaded audio for personal purposes only unless you have the rights holder's permission.</p>`,
  },
};

const STATIC = {
  about: {
    path: '/about', t: `About Us – ${SITE}`, d: `Learn what ${SITE} is and how it works.`, h: 'About Us',
    body: `<p>${SITE} is a free online tool for saving public X (Twitter) content: MP4 videos, MP3 audio and, where technically possible, photo posts and stories.</p>
<h3>Our principles</h3>
<ul><li><b>Honest results.</b> We only show a download when a real file is ready, and we say clearly when something is unsupported.</li><li><b>Privacy first.</b> We do not store submitted links or personal data.</li><li><b>Respect for access controls.</b> We never bypass logins or privacy settings.</li><li><b>Respect for creators.</b> Please only download content you own or have permission to use.</li></ul>
<p>${SITE} is an independent service and is not affiliated with or endorsed by X (Twitter) or X Corp.</p>
<p>Questions? See our <a href="/contact">contact page</a>.</p>`,
  },
  contact: {
    path: '/contact', t: `Contact – ${SITE}`, d: `Contact ${SITE} for support, feedback or copyright requests.`, h: 'Contact',
    body: `<p>We read every message. Write to us at <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h3>Before you write</h3>
<ul><li>Check the <a href="/#faq">FAQ</a> for common problems.</li><li>Include the page you used and what error message you saw (please do not send private links).</li><li>For copyright removal requests, see our <a href="/copyright">Copyright page</a>.</li></ul>`,
  },
  privacy: {
    path: '/privacy', t: `Privacy Policy – ${SITE}`, d: `How ${SITE} handles your data.`, h: 'Privacy Policy',
    body: `<p><i>Last updated: ${UPDATED}</i></p>
<h3>What we process</h3><p>When you submit a X (Twitter) link, our server uses it only to fetch the content you requested. We do not store submitted links, and we do not ask for accounts or personal information.</p>
<h3>Temporary files</h3><p>Files created for a download are kept in a temporary folder and deleted immediately after delivery.</p>
<h3>Rate limiting and logs</h3><p>To prevent abuse, your IP address is used in memory for rate limiting. Your hosting provider may keep standard access logs; see their policy.</p>
<h3>Browser storage</h3><p>We save only your language and light/dark preference in your browser. We set no tracking cookies.</p>
<h3>Third parties</h3><p>Our server requests content from X (Twitter) on your behalf. X (Twitter)'s own privacy policy applies to that content.</p>
<h3>Contact</h3><p>Privacy questions: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`,
  },
  terms: {
    path: '/terms', t: `Terms of Service – ${SITE}`, d: `Terms for using ${SITE}.`, h: 'Terms of Service',
    body: `<p><i>Last updated: ${UPDATED}</i></p>
<h3>1. Use of the service</h3><p>${SITE} may be used only for personal, lawful purposes. You are responsible for making sure you have the right to download and use any content.</p>
<h3>2. Prohibited use</h3><p>Do not use the service to infringe copyright, harass others, access private content, overload the service, or attempt to bypass rate limits or security.</p>
<h3>3. Third-party content</h3><p>All videos, images and audio belong to their creators and rights holders. We do not host or claim ownership of any content.</p>
<h3>4. Availability</h3><p>The service depends on third-party platforms and may stop working or change at any time. It is provided "as is", without warranties.</p>
<h3>5. Liability</h3><p>To the extent permitted by law, we are not liable for damages resulting from use of the service.</p>
<h3>6. Changes</h3><p>We may update these terms; continued use means you accept the changes.</p>
<p>Contact: <a href="mailto:${EMAIL}">${EMAIL}</a></p>`,
  },
  copyright: {
    path: '/copyright', t: `Copyright & DMCA – ${SITE}`, d: `Copyright notice and takedown requests for ${SITE}.`, h: 'Copyright & DMCA',
    body: `<p>© ${new Date().getFullYear()} ${SITE}. The site's design and code are protected. X (Twitter) and all related marks belong to their respective owners.</p>
<h3>Content ownership</h3><p>${SITE} does not host any videos, images or audio. Content belongs to its creators.</p>
<h3>Takedown requests</h3><p>If you believe the service is being used to infringe your rights, email <a href="mailto:${EMAIL}">${EMAIL}</a> with: the URL of the content, proof that you are the rights holder (or authorized agent), your contact details, and a statement that the information is accurate. We will review requests promptly.</p>`,
  },
};


const CTA = '<p><a class="card" style="display:inline-block" href="/en/Download-X-Video"><b>Open the Video Downloader →</b></a></p>';

// Tool pages with their own SEO angle (mode = which tool behaviour to use)
const LANDINGS = {
  nwVideo: {
    mode: 'mp4', hi: 4, slug: 'x-video-without-watermark', path: ['/x-video-without-watermark', '/tiktok-video-without-watermark'],
    hero: 'Download X (Twitter) Videos Without Watermark', rel: ['mp4', 'nwPhoto', 'mp3', 'howto'],
    t: 'X Video Without Watermark – Free MP4 Downloader',
    d: 'Save X (Twitter) videos without the moving watermark when X (Twitter) provides a clean version.',
    h: 'X Video Downloader Without Watermark',
    body: `<p>Videos saved inside the X (Twitter) app carry a moving logo and username. ${SITE} asks for the clean video source instead, so you get an MP4 without the overlay whenever X (Twitter) offers one.</p>
<h3>How it works</h3>
<ol><li>Paste a public X (Twitter) video link above and press <b>Next</b>.</li><li>We list only the clean (non-watermarked) qualities that are available.</li><li>Choose one and press <b>Download MP4</b>.</li></ol>
<h3>Honest limits</h3>
<p>We never edit or "remove" a logo from a video. If X (Twitter) provides no clean version for a post, it cannot be offered. Private or deleted videos are not available. Always respect the creator: keep credit when you share, and ask permission for reuse.</p>
<p>See the <a href="/how-to-download-x-videos">step-by-step guide</a> or the <a href="/faq">FAQ</a>.</p>`,
  },
  nwPhoto: {
    mode: 'photo', hi: 5, slug: 'x-photo-without-watermark', path: ['/x-photo-without-watermark', '/tiktok-photo-without-watermark'],
    hero: 'Download X GIFs & Images Without Watermark', rel: ['photo', 'nwVideo', 'story', 'faq'],
    t: 'X GIF & Image Without Watermark – Photo Post Downloader',
    d: 'Check and save X (Twitter) photo posts without watermark where the source and server support it.',
    h: 'X GIF & Image Downloader Without Watermark',
    body: `<p>Paste a X (Twitter) photo-post or slideshow link to see whether its images can be saved in their original, clean form.</p>
<h3>What to expect</h3>
<p>Photo-post support depends on what X (Twitter) exposes publicly and on the extractor installed on the server. When a post is not supported, you will see a clear message, never a fake download. We do not crop, edit or erase logos.</p>
<h3>Steps</h3>
<ol><li>Copy the photo post link in X (Twitter).</li><li>Paste it above and press <b>Next</b>.</li><li>Download any file that is offered.</li></ol>
<p>Need the video instead? Try the <a href="/x-video-without-watermark">video without watermark</a> page, or read our <a href="/faq">FAQ</a>.</p>`,
  },
};

const GUIDES = {
  directWay: {
    slug: 'direct-download-shortcut', path: ['/direct-download-shortcut', '/snapx-direct-way', '/twittersnapper-direct-way'], rel: ['howto', 'mp4', 'nwVideo', 'faq'],
    t: `Direct URL Shortcut (snapx.com & twittersnapper.com) – Download X (Twitter) Videos Instantly | ${SITE}`,
    d: `Learn how to download any X (Twitter) video instantly using snapx.com or twittersnapper.com directly in your browser address bar.`,
    h: `Direct URL Shortcut (snapx.com & twittersnapper.com)`,
    body: `<p>The fastest way to download any X (Twitter) video directly while browsing on your phone or desktop—no copy-pasting required!</p>

<div class="card" style="background:#eff6ff; border-color:#93c5fd; padding:20px; margin:20px 0;">
  <b style="color:#1d4ed8; font-size:16px;">⚡ Method 1: The snapx.com Shortcut</b>
  <p style="margin-top:8px; font-size:14px;">While watching any video on X (Twitter) in your address bar, replace <b>x.com</b> with <b>snapx.com</b>:</p>
  <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; margin:10px 0; font-family:monospace; font-size:13px; word-break:break-all;">
    <span style="color:#94a3b8;">Original:</span> https://<b style="color:#dc2626;">x.com</b>/username/status/1234567890<br>
    <span style="color:#94a3b8;">Shortcut:</span> https://<b style="color:#16a34a; font-size:15px;">snapx.com</b>/username/status/1234567890
  </div>
  <p style="font-size:13px; color:#475569; margin:0;">Press Enter and you will instantly arrive at the download page with automatic download!</p>
</div>

<div class="card" style="background:#f0fdf4; border-color:#86efac; padding:20px; margin:20px 0;">
  <b style="color:#15803d; font-size:16px;">⚡ Method 2: The twittersnapper.com Shortcut</b>
  <p style="margin-top:8px; font-size:14px;">If you are browsing on <b>twitter.com</b>, simply change <b>twitter.com</b> to <b>twittersnapper.com</b>:</p>
  <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; margin:10px 0; font-family:monospace; font-size:13px; word-break:break-all;">
    <span style="color:#94a3b8;">Original:</span> https://<b style="color:#dc2626;">twitter.com</b>/username/status/1234567890<br>
    <span style="color:#94a3b8;">Shortcut:</span> https://<b style="color:#16a34a; font-size:15px;">twittersnapper.com</b>/username/status/1234567890
  </div>
</div>

<h3>Why use the Direct URL Shortcut?</h3>
<ul>
  <li><b>No Copy &amp; Paste Needed:</b> Simply edit the link right in your browser bar.</li>
  <li><b>Automatic Resolution:</b> Auto-fills the URL input and launches processing immediately.</li>
  <li><b>High Definition Quality:</b> Downloads 1080p / HD MP4 videos and GIFs cleanly.</li>
  <li><b>Cross-Platform:</b> Works on Chrome, Safari, Edge, Firefox, iOS, and Android.</li>
</ul>

<h3>Supported Link Formats</h3>
<ul>
  <li><code>https://snapx.com/username/status/1234567890</code></li>
  <li><code>https://twittersnapper.com/username/status/1234567890</code></li>
  <li><code>https://snapx.com/i/status/1234567890</code></li>
</ul>

${CTA}`,
  },
  howto: {
    slug: 'how-to-download-x-videos', path: ['/how-to-download-x-videos', '/how-to-download-twitter-videos'], rel: ['mp4', 'nwVideo', 'mp3', 'links', 'faq'],
    t: `How to Download X (Twitter) Videos – Step-by-Step Guide | ${SITE}`,
    d: 'Learn how to save X (Twitter) videos on iPhone, Android and computer in three steps or via snapx.com / twittersnapper.com shortcuts.',
    h: 'How to Download X (Twitter) Videos',
    body: `<p>Downloading X (Twitter) videos is simple and fast using either method below.</p>
<h3>Method 1: Direct URL Shortcut (snapx.com / twittersnapper.com)</h3>
<p>While viewing any video on X or Twitter (e.g. <code>https://x.com/username/status/1234567890</code>), simply type <b>snapx.com</b> or <b>twittersnapper.com</b> in place of <b>x.com</b> / <b>twitter.com</b> in your browser address bar: <code>https://snapx.com/username/status/1234567890</code>. You will instantly arrive at the download page and the download will trigger automatically!</p>
<h3>Method 2: Copy &amp; Paste Link</h3>
<ol><li>Open the video on X (Twitter) and tap <b>Share → Copy link</b>.</li><li>Open ${SITE} in your browser and paste the link into the box above.</li><li>Press <b>Next</b>, choose a quality and download.</li></ol>
<h3>Tips</h3>
<ul><li>Only public videos work. See <a href="/supported-links">supported links</a>.</li><li>Want a clean video? Read about <a href="/x-video-without-watermark">no-watermark downloads</a>.</li></ul>${CTA}`,
  },
  links: {
    slug: 'supported-links', path: ['/supported-links'], rel: ['howto', 'faq', 'mp4', 'photo'],
    t: `Supported X (Twitter) Links & Troubleshooting | ${SITE}`,
    d: 'Which X (Twitter) links work, and what to do when a link fails.',
    h: 'Supported X (Twitter) Links',
    body: `<h3>Links that work</h3>
<ul><li><code>https://www.x.com/@user/video/…</code> – public videos</li><li><code>https://vm.x.com/…</code> and <code>https://vt.x.com/…</code> – short share links</li><li><code>https://www.x.com/@user/photo/…</code> – photo posts (support varies)</li></ul>
<h3>Why a link may fail</h3>
<ul><li><b>Private or login-only content</b> – never bypassed.</li><li><b>Deleted or unavailable post</b>.</li><li><b>Not a x.com link</b> or missing https.</li><li><b>Too many requests</b> – wait a minute and retry.</li></ul>
<p>Next steps: <a href="/how-to-download-x-videos">download guide</a> · <a href="/faq">FAQ</a></p>${CTA}`,
  },
  faq: {
    slug: 'faq', path: ['/faq'], rel: ['howto', 'links', 'nwVideo', 'mp3'],
    t: `X (Twitter) Downloader FAQ | ${SITE}`,
    d: 'Answers about formats, watermarks, privacy and troubleshooting.',
    h: 'Frequently Asked Questions',
    body: `<details><summary>Is ${SITE} free?</summary><p>Yes, using the downloader costs nothing.</p></details>
<details><summary>Will my video have a watermark?</summary><p>We offer clean versions whenever X (Twitter) provides them. Otherwise none is offered. See <a href="/x-video-without-watermark">video without watermark</a>.</p></details>
<details><summary>Can I download photos and stories?</summary><p>Only when the server's extractor supports them and the content is public. See <a href="/x-photo-without-watermark">photos</a> and <a href="/story">stories</a>.</p></details>
<details><summary>Can I get just the audio?</summary><p>Yes, use the <a href="/mp3">MP3 downloader</a>.</p></details>
<details><summary>Do you store my links?</summary><p>No. Read the <a href="/privacy">Privacy Policy</a>.</p></details>
<details><summary>A download failed. What now?</summary><p>Check the <a href="/supported-links">supported links</a> page, then retry in a minute.</p></details>
<details><summary>Is it legal?</summary><p>Download only content you own or have permission to use. See our <a href="/terms">Terms</a> and <a href="/copyright">Copyright</a> page.</p></details>${CTA}`,
  },
};

module.exports = { DOWNLOADERS, LANDINGS, GUIDES, STATIC, SITE_URL };
