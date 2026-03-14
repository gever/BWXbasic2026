const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // The server is already running on port 8000
    await page.goto('http://localhost:8000/bwxBASIC.html');
    
    // Wait for engine to boot
    await page.waitForTimeout(1000);
    
    // Insert a line
    await page.keyboard.type('10 PRINT "ORIGINAL"');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    // Open Editor
    await page.keyboard.type('EDIT');
    await page.keyboard.press('Enter');
    
    // Wait for editor
    await page.waitForSelector('#editor-content');
    await page.waitForTimeout(500);

    // Change text using keyboard
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('L"');
    await page.waitForTimeout(100);
    
    // Get text before close
    const beforeClose = await page.innerText('#editor-content');

    // Click Close Without Save
    await page.click('#editor-cancel');
    await page.waitForTimeout(500);

    // Verify it is closed
    const overlayDisplay = await page.$eval('#editor-overlay', el => window.getComputedStyle(el).display);

    // List program to verify it is NOT "MODIFIED"
    await page.keyboard.type('LIST');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Get canvas log via some hook, or let's use the JS console if we can't easily read canvas
    const listOutput = await page.evaluate(() => {
        return window.SYS.program.map(l => l.line + " " + l.src).join("\\n");
    });

    console.log("Overlay Display After Cancel:", overlayDisplay);
    console.log("Program After Cancel:", listOutput);

    if (overlayDisplay === 'none' && listOutput === '10 PRINT "ORIGINAL"') {
        console.log("✅ test_editor PASSED");
    } else {
        console.log("❌ test_editor FAILED");
    }

    await browser.close();
})();
