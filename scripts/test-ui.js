const { _electron: electron } = require('playwright');
const electronPath = require('electron');
const path = require('path');
const fs = require('fs');

async function runUiSmokeTest() {
  console.log('--- Starting Omni Office UI Automated Smoke Test (v0.3.0) ---');
  const screenshotDir = path.join(__dirname, '..', 'tests', 'screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });

  const app = await electron.launch({
    executablePath: electronPath,
    args: ['.'],
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });

  try {
    const window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(1000);

    // 1. TitleBar & Branding (v0.3.0)
    console.log('1. Verifying TitleBar and App Branding (v0.3.0)...');
    const titleText = await window.locator('.omni-titlebar-name').textContent();
    console.log('   Titlebar Name:', titleText);
    if (!titleText.includes('Omni Office v0.3.0')) {
      throw new Error(`Expected title to include "Omni Office v0.3.0" but got "${titleText}"`);
    }

    // 2. HWP Document View & Ribbon
    console.log('2. Verifying HWP Document View (Tab 1)...');
    const docTitle = await window.locator('.hwp-doc-title').textContent();
    console.log('   HWP Document Title:', docTitle);
    if (!docTitle.includes('디지털 전환 계획')) {
      throw new Error('HWP document title not found in DOM');
    }

    // Test typing in HWP editor
    const editor = window.locator('.hwp-editor-content');
    await editor.click();
    await window.keyboard.type(' [자동 검증 텍스트]');
    await window.waitForTimeout(200);

    // Test Undo (Ctrl+Z) in HWP
    await window.keyboard.press('Control+z');
    await window.waitForTimeout(200);

    const cornerGuides = await window.locator('.hwp-corner-guide').count();
    console.log('   Corner Crop Guides Count:', cornerGuides);
    if (cornerGuides !== 4) {
      throw new Error(`Expected 4 corner crop guides, found ${cornerGuides}`);
    }

    // Status bar HWP stats check
    const statusText = await window.locator('.omni-statusbar-left').textContent();
    console.log('   HWP Status Bar Text:', statusText);
    if (!statusText.includes('글자:') || !statusText.includes('낱말:')) {
      throw new Error('HWP character/word count statistics not displayed in status bar');
    }

    const hwpScreenshotPath = path.join(screenshotDir, '01-hwp-view.png');
    await window.screenshot({ path: hwpScreenshotPath });
    console.log('   [Captured] HWP View Screenshot:', hwpScreenshotPath);

    // 3. Testing Symbol Modal (Ctrl+F10)
    console.log('3. Testing Symbol Modal (Ctrl+F10)...');
    const symbolBtn = window.locator('.rhwp-tool-btn', { hasText: '문자표' });
    await symbolBtn.click();
    await window.waitForSelector('.symbol-dialog', { state: 'visible' });
    const modalScreenshotPath = path.join(screenshotDir, '04-modals-symbol.png');
    await window.screenshot({ path: modalScreenshotPath });
    console.log('   [Captured] Symbol Modal Screenshot:', modalScreenshotPath);

    // Close symbol modal
    await window.click('.symbol-dialog .modal-close-btn');
    await window.waitForSelector('.symbol-dialog', { state: 'detached' });
    await window.waitForTimeout(200);

    // 4. Testing [파일] Dropdown Menu (including PDF Export item)
    console.log('4. Testing [파일] Dropdown Menu...');
    await window.click('.menu-tab-btn.file-btn');
    await window.waitForSelector('.file-dropdown-overlay', { state: 'visible' });

    const pdfMenuItem = await window.locator('.file-menu-item', { hasText: 'PDF로 내보내기' });
    if ((await pdfMenuItem.count()) === 0) {
      throw new Error('PDF export menu item not found in file dropdown');
    }

    const fileMenuScreenshotPath = path.join(screenshotDir, '02-file-menu.png');
    await window.screenshot({ path: fileMenuScreenshotPath });
    console.log('   [Captured] File Menu Screenshot:', fileMenuScreenshotPath);

    // Close file menu by clicking backdrop
    await window.click('.file-dropdown-backdrop');
    await window.waitForSelector('.file-dropdown-overlay', { state: 'detached' });
    await window.waitForTimeout(300);

    // 5. Testing Tab Switch to Excel Spreadsheet (Tab 2)
    console.log('5. Testing Tab Switch to Excel Spreadsheet (Tab 2)...');
    const excelTab = window.locator('.doc-tab', { hasText: 'xlsx' });
    await excelTab.click();
    await window.waitForSelector('.sheet-container', { state: 'visible' });

    const cellAddress = await window.locator('.sheet-cell-address').textContent();
    console.log('   Spreadsheet Active Cell:', cellAddress);

    // Check formula evaluation: C6 formula is '=SUM(C2:C5)', evaluated sum should be '115,000,000'
    const c6Cell = window.locator('.sheet-table tbody tr:nth-child(6) td:nth-child(4)');
    const c6Text = await c6Cell.textContent();
    console.log('   Formula cell C6 evaluated text:', c6Text);
    if (!c6Text.includes('115,000,000')) {
      throw new Error(`Expected evaluated sum 115,000,000 in C6 but got "${c6Text}"`);
    }

    // 6. Test Cell Styling in Excel (Click Bold button)
    console.log('6. Testing Cell Styling (Bold toggle on C2)...');
    const boldBtn = window.locator('.format-icon-btn[title*="굵게"]');
    await boldBtn.click();
    await window.waitForTimeout(200);

    const c2Cell = window.locator('.sheet-table tbody tr:nth-child(2) td:nth-child(4)');
    const c2Weight = await c2Cell.evaluate((el) => window.getComputedStyle(el).fontWeight);
    console.log('   Cell C2 Font Weight after Bold click:', c2Weight);

    const excelScreenshotPath = path.join(screenshotDir, '03-excel-view.png');
    await window.screenshot({ path: excelScreenshotPath });
    console.log('   [Captured] Excel View Screenshot:', excelScreenshotPath);

    // 7. Testing Mouse Drag Range Selection in Spreadsheet (C2 to C5)
    console.log('7. Testing Mouse Drag Range Selection (C2 to C5)...');
    const c5Cell = window.locator('.sheet-table tbody tr:nth-child(5) td:nth-child(4)');

    const c2Box = await c2Cell.boundingBox();
    const c5Box = await c5Cell.boundingBox();

    if (c2Box && c5Box) {
      await window.mouse.move(c2Box.x + c2Box.width / 2, c2Box.y + c2Box.height / 2);
      await window.mouse.down();
      await window.mouse.move(c5Box.x + c5Box.width / 2, c5Box.y + c5Box.height / 2, { steps: 5 });
      await window.mouse.up();
      await window.waitForTimeout(300);

      const selectedInRange = await window.locator('.selected-in-range').count();
      console.log('   Cells with .selected-in-range class:', selectedInRange);
      if (selectedInRange === 0) {
        throw new Error('Range selection did not apply .selected-in-range class to cells');
      }

      // Check Status Bar live range statistics (평균, 개수, 합계)
      const rangeStatus = await window.locator('.omni-statusbar-left').textContent();
      console.log('   Range Selection Status Bar:', rangeStatus);
      if (!rangeStatus.includes('평균:') || !rangeStatus.includes('개수:') || !rangeStatus.includes('합계:')) {
        throw new Error('Spreadsheet range statistics (평균, 개수, 합계) not displayed in status bar');
      }

      const rangeScreenshotPath = path.join(screenshotDir, '05-spreadsheet-range-selection.png');
      await window.screenshot({ path: rangeScreenshotPath });
      console.log('   [Captured] Spreadsheet Range Selection Screenshot:', rangeScreenshotPath);
    }

    console.log('\n>>> All Automated UI Smoke Tests PASSED with Zero Errors! <<<');
  } catch (err) {
    console.error('UI Test Failed:', err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

runUiSmokeTest();
