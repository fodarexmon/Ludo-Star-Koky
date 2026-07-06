const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log("Navigating to http://localhost:5173/play/offline ...");
  await page.goto('http://localhost:5173/play/offline', { waitUntil: 'networkidle2' });
  
  console.log("Page loaded. Clicking input...");
  
  // Click the input field
  try {
    await page.click('input');
    console.log("Clicked successfully!");
  } catch(e) {
    console.log("Click failed:", e.message);
  }

  console.log("Waiting 2 seconds...");
  await new Promise(r => setTimeout(r, 2000));
  
  const isFrozen = await page.evaluate(() => {
    return new Promise(resolve => {
      let lastTime = Date.now();
      let stuck = false;
      setTimeout(() => {
        if (Date.now() - lastTime > 100) {
           stuck = true;
        }
        resolve(stuck);
      }, 50);
    });
  });

  console.log("Is frozen?", isFrozen);
  await browser.close();
})();
