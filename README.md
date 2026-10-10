# SnapX — X (Twitter) Downloader

Self-hosted downloader for X (Twitter) videos, photos, stories and MP3.
Backend: Node.js + Express, powered by **yt-dlp** and **ffmpeg**.

## Quick start

```bash
npm install
npm start        # builds the pages, then starts the server
```

Then open <http://localhost:3005>.

## yt-dlp & ffmpeg are installed automatically

You do **not** need to install yt-dlp or ffmpeg by hand. On startup the server
looks for them and, if it cannot run one, downloads a standalone build into the
local `bin/` folder (from the official GitHub releases):

- yt-dlp — Windows / Linux / macOS standalone binary
- ffmpeg — static build (Windows / Linux)

This needs outbound internet access on first run. Later starts reuse `bin/`.
If your server has no internet access, install them yourself and point the
server at them with the environment variables below.

## Configuration (environment variables)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3005` | HTTP port |
| `YTDLP_PATH` | auto | Absolute path to a specific `yt-dlp` binary |
| `FFMPEG_PATH` | auto | Absolute path to a specific `ffmpeg` binary |
| `FRAGMENTS` | `16` | Concurrent HLS fragments (`yt-dlp -N`); raise for faster downloads |
| `MAX_JOBS` | `4` | Max concurrent download jobs |

## API

- `POST /api/resolve` — `{ url, type }` → title, author, thumbnail, format list
- `POST /api/download` — `{ url, type, fid }` → the media file

## Editing the UI

Page markup, styles and client script live in `src/template.html`.
Text strings live in `translations.js`. After changing either, rebuild with:

```bash
node build.js
```
