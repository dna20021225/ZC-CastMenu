const puppeteer = require('puppeteer');

async function takeScreenshot() {
  const url = process.argv[2] || 'http://localhost:3000';
  const outputPath = process.argv[3] || 'screenshot.png';

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    // 追加の待機時間
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Screenshot saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
}

takeScreenshot();
