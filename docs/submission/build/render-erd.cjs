const { chromium } = require(process.env.PWL);
const fs = require('fs');
const mmd = fs.readFileSync('/tmp/erd.mmd', 'utf8');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_EXE });
  const p = await b.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: 3 });
  await p.setContent(`<!doctype html><meta charset=utf-8>
    <style>body{background:#ffffff;margin:0;padding:24px;font-family:-apple-system,Helvetica,Arial,sans-serif}</style>
    <pre class="mermaid">${mmd.replace(/</g, '&lt;')}</pre>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
    <script>mermaid.initialize({startOnLoad:true,theme:'neutral',er:{fontSize:13}});</script>`,
    { waitUntil: 'networkidle' });
  await p.waitForSelector('pre.mermaid svg', { timeout: 60000 });
  await p.waitForTimeout(1500);
  const el = await p.$('pre.mermaid');
  const box = await el.boundingBox();
  console.log('diagram', Math.round(box.width), 'x', Math.round(box.height));
  await el.screenshot({ path: process.env.OUT });
  await b.close();
})();
