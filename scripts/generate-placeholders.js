const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const verticals = [
  'services',
  'products',
  'auto',
  'realestate',
  'jobs',
  'avito',
];

async function generatePlaceholders() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Установим размер viewport
  await page.setViewport({ width: 800, height: 600 });

  for (const vertical of verticals) {
    const htmlPath = path.join(
      __dirname,
      '..',
      'public',
      'images',
      'verticals',
      `${vertical}.html`
    );
    const imagePath = path.join(
      __dirname,
      '..',
      'public',
      'images',
      'verticals',
      `${vertical}.jpg`
    );

    // Загружаем HTML файл
    const html = fs.readFileSync(htmlPath, 'utf8');
    await page.setContent(html);

    // Делаем скриншот
    await page.screenshot({
      path: imagePath,
      type: 'jpeg',
      quality: 90,
    });

    console.log(`Generated ${vertical}.jpg`);
  }

  await browser.close();
}

generatePlaceholders().catch(console.error);
