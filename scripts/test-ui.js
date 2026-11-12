const { _electron: electron } = require('playwright');
const electronPath = require('electron');
const path = require('path');
const fs = require('fs');

async function runUiSmokeTest() {
  console.log('--- Starting Omni Office UI Automated Smoke Test ---');
  const screenshotDir = path.join(__dirname, '..', 'tests', 'screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });

  const app = await electron.launch({
    executablePath: electronPath,
    args: ['.'],
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  try {
    const window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(1000);

    console.log('1. Verifying TitleBar and App Branding...');
    const titleText = await window.locator('.omni-titlebar-name').textContent();
    console.log('   Titlebar Name:', titleText);
    if (!titleText.includes('Omni Office v0.2.0')) {
      throw new Error(`Expected title to include "Omni Office v0.2.0" but got "${titleText}"`);
    }

    console.log('2. Verifying HWP Document View (Tab 1)...');
    const docTitle = await window.locator('.hwp-doc-title').textContent();
    console.log('   HWP Document Title:', docTitle);
    if (!docTitle.includes('디지털 전환 계획')) {
      throw new Error('HWP document title not found in DOM');
    }

    const cornerGuides = await window.locator('.hwp-corner-guide').count();
    console.log('   Corner Crop Guides Count:', cornerGuides);
    if (cornerGuides !== 4) {
      throw new Error(`Expected 4 corner crop guides, found ${cornerGuides}`);
    }

    const ribbonBtns = await window.locator('.rhwp-tool-btn').count();
    console.log('   Ribbon Tools Count:', ribbonBtns);
    if (ribbonBtns < 10) {
      throw new Error(`Too few ribbon tool buttons: ${ribbonBtns}`);
    }

    const hwpScreenshotPath = path.join(screenshotDir, '01-hwp-view.png');
    await window.screenshot({ path: hwpScreenshotPath });
    console.log('   [Captured] HWP View Screenshot:', hwpScreenshotPath);

    console.log('3. Testing [파일] Dropdown Menu...');
    await window.click('.menu-tab-btn.file-btn');
    await window.waitForSelector('.file-dropdown-overlay', { state: 'visible' });
    const fileMenuScreenshotPath = path.join(screenshotDir, '02-file-menu.png');
    await window.screenshot({ path: fileMenuScreenshotPath });
    console.log('   [Captured] File Menu Screenshot:', fileMenuScreenshotPath);

    // Close file menu by clicking backdrop
    await window.click('.file-dropdown-backdrop');
    await window.waitForSelector('.file-dropdown-overlay', { state: 'detached' });
    await window.waitForTimeout(300);

    console.log('4. Testing Tab Switch to Excel Spreadsheet (Tab 2)...');
    const excelTab = window.locator('.doc-tab', { hasText: 'xlsx' });
    await excelTab.click();
    await window.waitForSelector('.sheet-container', { state: 'visible' });

    const cellAddress = await window.locator('.sheet-cell-address').textContent();
    console.log('   Spreadsheet Active Cell:', cellAddress);

    const tableRows = await window.locator('.sheet-table tbody tr').count();
    console.log('   Spreadsheet Rows Count:', tableRows);
    if (tableRows < 20) {
      throw new Error(`Expected at least 20 rows, got ${tableRows}`);
    }

    const excelScreenshotPath = path.join(screenshotDir, '03-excel-view.png');
    await window.screenshot({ path: excelScreenshotPath });
    console.log('   [Captured] Excel View Screenshot:', excelScreenshotPath);

    console.log('\n>>> All Automated UI Smoke Tests PASSED with Zero Errors! <<<');
  } catch (err) {
    console.error('UI Test Failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

runUiSmokeTest();
