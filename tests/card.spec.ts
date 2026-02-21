import { test, expect, Page } from '@playwright/test';

// Sets a range slider value and fires the `input` event the card listens to.
async function setSlider(page: Page, id: string, value: string) {
  await page.evaluate(({ id, value }) => {
    const el = document.getElementById(id) as HTMLInputElement;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, { id, value });
}

// The card under test — full-width so all elements are always visible.
const card = (page: Page) => page.locator('#card-wide');

// Opens the "Show 24-hour history" collapsible section inside the card.
async function expandHistory(page: Page) {
  await card(page).locator('.history-toggle').click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Wait until the card has rendered its first status badge.
  await expect(card(page).locator('.status-badge')).toBeVisible();
});

// ---------------------------------------------------------------------------
// 1. Comfort status — driven by slider values against default thresholds
//    (temp 20–24 °C, humidity 40–60 %)
// ---------------------------------------------------------------------------
test.describe('comfort status', () => {
  test('shows PLEASANT when temp and humidity are in range', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.status-badge')).toHaveText('PLEASANT');
  });

  test('shows COLD when temperature is below the minimum threshold', async ({ page }) => {
    await setSlider(page, 'temperature', '10');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.status-badge')).toHaveText('COLD');
  });

  test('shows WARM when temperature is above the maximum threshold', async ({ page }) => {
    await setSlider(page, 'temperature', '30');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.status-badge')).toHaveText('WARM');
  });

  test('shows DRY when humidity is below the minimum threshold', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '20');
    await expect(card(page).locator('.status-badge')).toHaveText('DRY');
  });

  test('shows HUMID when humidity is above the maximum threshold', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '80');
    await expect(card(page).locator('.status-badge')).toHaveText('HUMID');
  });
});

// ---------------------------------------------------------------------------
// 2. Custom thresholds — changing the comfort range in the editor changes
//    which status is shown for the same sensor values
// ---------------------------------------------------------------------------
test.describe('custom thresholds via editor', () => {
  const editor = (page: Page) => page.locator('#card-editor');

  test('temperature threshold change: raising temp_c_min makes a previously-pleasant reading show COLD', async ({ page }) => {
    // 23 °C is inside the default 20–24 range → PLEASANT
    await setSlider(page, 'temperature', '23');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.status-badge')).toHaveText('PLEASANT');

    // Raise the minimum to 25 °C — now 23 °C is below the threshold
    await editor(page).locator('#temp_c_min').fill('25');
    await editor(page).locator('#temp_c_min').dispatchEvent('input');
    await expect(card(page).locator('.status-badge')).toHaveText('COLD');
  });

  test('humidity threshold change: raising humidity_min makes a previously-pleasant reading show DRY', async ({ page }) => {
    // 45 % is inside the default 40–60 range → PLEASANT
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '45');
    await expect(card(page).locator('.status-badge')).toHaveText('PLEASANT');

    // Raise the minimum humidity to 50 % — now 45 % is below the threshold
    await editor(page).locator('#humidity_min').fill('50');
    await editor(page).locator('#humidity_min').dispatchEvent('input');
    await expect(card(page).locator('.status-badge')).toHaveText('DRY');
  });
});

// ---------------------------------------------------------------------------
// 3. Temperature unit display (°C / °F)
// ---------------------------------------------------------------------------
test.describe('temperature unit display', () => {
  const editor = (page: Page) => page.locator('#card-editor');
  const tempReading = (page: Page) => card(page).locator('.reading').first().locator('.reading-value');

  test('shows °C by default', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await expect(tempReading(page)).toContainText('22.0');
    await expect(tempReading(page).locator('.reading-unit')).toHaveText('°C');
  });

  test('shows °F when display unit is switched to Fahrenheit in the editor', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await editor(page).locator('#temperature_unit').selectOption('F');
    // 22 °C → 71.6 °F
    await expect(tempReading(page)).toContainText('71.6');
    await expect(tempReading(page).locator('.reading-unit')).toHaveText('°F');
  });

  test('converts correctly when the sensor itself reports °F', async ({ page }) => {
    // The slider-panel unit selector changes what unit the mock sensor reports.
    // Switching to °F converts the slider value from 22 °C to ≈ 71.6 °F.
    await setSlider(page, 'temperature', '22');
    await page.locator('#sensor-temp-unit').selectOption('°F');
    // Display preference is still °C → card should convert back to 22.0 °C
    await expect(tempReading(page)).toContainText('22.0');
    await expect(tempReading(page).locator('.reading-unit')).toHaveText('°C');
  });
});

// ---------------------------------------------------------------------------
// 4. Graph visibility — show/hide individual charts via editor checkboxes
// ---------------------------------------------------------------------------
test.describe('graph visibility', () => {
  const editor = (page: Page) => page.locator('#card-editor');

  test('temperature graph is visible by default', async ({ page }) => {
    await expandHistory(page);
    await expect(card(page).locator('.chart-label', { hasText: 'Temperature (24h)' })).toBeVisible();
  });

  test('temperature graph disappears when disabled in the editor', async ({ page }) => {
    await editor(page).locator('#show_temperature_graph').uncheck();
    await expandHistory(page);
    await expect(card(page).locator('.chart-label', { hasText: 'Temperature (24h)' })).toHaveCount(0);
  });

  test('humidity graph can be toggled off and back on', async ({ page }) => {
    await expandHistory(page);
    await expect(card(page).locator('.chart-label', { hasText: 'Humidity (24h)' })).toBeVisible();

    await editor(page).locator('#show_humidity_graph').uncheck();
    await expect(card(page).locator('.chart-label', { hasText: 'Humidity (24h)' })).toHaveCount(0);

    await editor(page).locator('#show_humidity_graph').check();
    await expect(card(page).locator('.chart-label', { hasText: 'Humidity (24h)' })).toBeVisible();
  });
});
