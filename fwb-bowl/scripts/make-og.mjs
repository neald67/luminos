// Renders the social share image (public/og-image.jpg, 1200×630) with the
// real logo on a cosmic background. Run: node scripts/make-og.mjs
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const b64 = async (p) => (await readFile(path.join(root, p))).toString('base64');
const logo = await b64('src/assets/brand/fwb-bowl-logo.png');
const bungee = await b64('public/fonts/bungee-latin-400.woff2');
const atkinson = await b64('public/fonts/atkinson-hyperlegible-next-latin-var.woff2');
const colors = ['#EFAD63', '#6CB762', '#CC5247', '#4C72B3', '#A9CD6A', '#EDDA72', '#835BA1'];

const html = `<!doctype html><html><head><style>
@font-face{font-family:Bungee;src:url(data:font/woff2;base64,${bungee}) format('woff2')}
@font-face{font-family:Atkinson;src:url(data:font/woff2;base64,${atkinson}) format('woff2');font-weight:200 800}
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Atkinson,sans-serif;color:#fff7ec;
  background:radial-gradient(60% 70% at 12% 15%,rgb(118 54 255/.5),transparent 70%),
             radial-gradient(55% 65% at 92% 25%,rgb(24 12 242/.55),transparent 70%),
             radial-gradient(50% 50% at 60% 100%,rgb(42 197 253/.22),transparent 70%),#16061f;
  display:flex;flex-direction:column;justify-content:center;padding:0 80px 60px}
img{width:640px;filter:drop-shadow(0 0 30px rgb(237 218 114/.3)) drop-shadow(0 12px 24px rgb(0 0 0/.5))}
h1{font-family:Bungee;font-weight:400;font-size:64px;line-height:1.05;margin:26px 0 14px;color:#edda72}
p{margin:0;font-size:30px;font-weight:700}
.strip{position:absolute;left:0;right:0;bottom:0;height:44px;display:flex}
.strip span{flex:1;border:3px solid #08090b;margin:0 -1.5px}
</style></head><body>
<img src="data:image/png;base64,${logo}" alt="">
<h1>Where the balls keep rolling!</h1>
<p>Bowling · Leagues · Billiards · Parties · Fort Walton Beach, FL</p>
<div class="strip">${Array.from({ length: 21 }, (_, i) => `<span style="background:${colors[i % 7]}"></span>`).join('')}</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'public/og-image.jpg'), type: 'jpeg', quality: 88 });
await browser.close();
console.log('wrote public/og-image.jpg');
