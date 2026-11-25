const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/rec';
fs.mkdirSync(OUT, { recursive: true });
const CSS = `
  main { padding: 16px !important; max-width: none !important; }
  main > header { display: none !important; }
  main > div > div > div.mt-3 { display: none !important; }
  .grid { gap: 12px !important; }
  .grid > div > div.relative { height: 520px !important; }
  aside { height: 340px !important; }
  [class*="top-[150px]"] { display: none !important; }
  aside button { display: none !important; }
  html, body { background: #0c0a09 !important; overflow: hidden; }
`;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 720, height: 900 }, deviceScaleFactor: 1.5 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: CSS });
  await p.waitForTimeout(1500);
  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  cdp.on('Page.screencastFrame', (f) => {
    const i = frames.length;
    fs.writeFileSync(`${OUT}/f${String(i).padStart(5, '0')}.jpg`, Buffer.from(f.data, 'base64'));
    frames.push(f.metadata.timestamp);
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  const marks = {};
  const mark = (k) => (marks[k] = Date.now() / 1000);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: 1080, maxHeight: 1350, everyNthFrame: 1 });
  const sp = () => p.keyboard.press('Space');
  mark('title'); await p.waitForTimeout(2000);
  for (const k of ['b1', 'b2', 'b3']) { mark(k); await sp(); await p.waitForTimeout(2600); }
  for (let i = 4; i <= 11; i++) { await sp(); await p.waitForTimeout(350); }
  await p.waitForTimeout(2500);
  mark('b12'); await sp(); await p.waitForTimeout(2800);
  for (let i = 13; i <= 17; i++) { await sp(); await p.waitForTimeout(350); }
  await p.waitForTimeout(2500);
  mark('b18'); await sp(); await p.waitForTimeout(6500);
  mark('end');
  await cdp.send('Page.stopScreencast');
  await p.waitForTimeout(300);
  fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({ frames, marks }));
  await b.close();
})();
