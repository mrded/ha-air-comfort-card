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
  // Reset all sliders to known-good defaults. mock.json loads a CO2 history
  // whose latest value (1242 ppm) exceeds the hardcoded CO2 warning threshold
  // (1200 ppm), which would otherwise bleed "Poor air" into every test that
  // doesn't set CO2 explicitly.
  await setSlider(page, 'temperature', '22');
  await setSlider(page, 'humidity', '50');
  await setSlider(page, 'co2', '450');
  await setSlider(page, 'no2', '30');
  await setSlider(page, 'pm25', '10');
  await setSlider(page, 'pm10', '20');
  await setSlider(page, 'voc', '100');
});

// ---------------------------------------------------------------------------
// 1. Comfort status — driven by slider values against comfort thresholds
//    Thermal: temp 20–24 °C, humidity 40–60 % (configurable)
//    AQ: CO2 800/1200 ppm, NO2 50/150 µg/m³, PM2.5 15/35 µg/m³,
//        PM10 45/100 µg/m³ (WHO 2021 / ASHRAE 62.1), VOC 150/250
//        (hardcoded, based on a common IAQ guideline)
// The test harness has all AQ sensors at good defaults (CO2=450, NO2=30,
// PM2.5=10, PM10=20, VOC=100), so thermal status is always dominant.
// The status badge contains a dot element + text; use toContainText to
// match the label without asserting on the dot's rendered content.
test.describe('comfort status', () => {
  test('shows Comfortable when temp and humidity are in range', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.status-badge')).toContainText('Comfortable');
  });

  test('shows Cold when temperature is below the minimum threshold', async ({ page }) => {
    await setSlider(page, 'temperature', '10');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.status-badge')).toContainText('Cold');
  });

  test('shows Hot when temperature is above the maximum threshold', async ({ page }) => {
    await setSlider(page, 'temperature', '30');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.status-badge')).toContainText('Hot');
  });

  test('shows Dry when humidity is below the minimum threshold', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '20');
    await expect(card(page).locator('.status-badge')).toContainText('Dry');
  });

  test('shows Humid when humidity is above the maximum threshold', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '80');
    await expect(card(page).locator('.status-badge')).toContainText('Humid');
  });

  test('shows Poor air when CO2 exceeds the warning threshold (1200 ppm)', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '50');
    await setSlider(page, 'co2', '1500');
    await expect(card(page).locator('.status-badge')).toContainText('Poor air');
  });

  test('AQ overrides comfortable thermal when AQ is poor', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '50');
    await setSlider(page, 'co2', '1500');
    // Thermal is comfortable but AQ is poor — AQ should win
    await expect(card(page).locator('.status-badge')).not.toContainText('Comfortable');
    await expect(card(page).locator('.status-badge')).toContainText('Poor air');
  });

  test('shows Moderate air when CO2 is between good and warning thresholds (800–1200 ppm)', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '50');
    await setSlider(page, 'co2', '1000');
    await expect(card(page).locator('.status-badge')).toContainText('Moderate air');
  });

  test('shows combined Hot & dry when both temperature and humidity are out of range', async ({ page }) => {
    await setSlider(page, 'temperature', '30');
    await setSlider(page, 'humidity', '20');
    await expect(card(page).locator('.status-badge')).toContainText('Hot & dry');
  });

  test('shows combined Cold & humid when both temperature and humidity are out of range', async ({ page }) => {
    await setSlider(page, 'temperature', '10');
    await setSlider(page, 'humidity', '80');
    await expect(card(page).locator('.status-badge')).toContainText('Cold & humid');
  });

  test('shows combined Hot & humid when both temperature and humidity are out of range', async ({ page }) => {
    await setSlider(page, 'temperature', '30');
    await setSlider(page, 'humidity', '80');
    await expect(card(page).locator('.status-badge')).toContainText('Hot & humid');
  });

  test('shows combined Cold & dry when both temperature and humidity are out of range', async ({ page }) => {
    await setSlider(page, 'temperature', '10');
    await setSlider(page, 'humidity', '20');
    await expect(card(page).locator('.status-badge')).toContainText('Cold & dry');
  });

  test('thermal wins over AQ moderate when thermal severity is higher', async ({ page }) => {
    await setSlider(page, 'temperature', '10');
    await setSlider(page, 'humidity', '20');
    await setSlider(page, 'co2', '1000'); // moderate AQ
    // Cold & dry is severity 2, moderate AQ is severity 1 — thermal should win
    await expect(card(page).locator('.status-badge')).toContainText('Cold & dry');
    await expect(card(page).locator('.status-badge')).not.toContainText('Moderate air');
  });
});

// ---------------------------------------------------------------------------
// 2. Custom thermal thresholds — temperature and humidity comfort ranges are
//    configurable in the editor; AQ thresholds are hardcoded (WHO 2021 /
//    ASHRAE 62.1) and not exposed in the editor.
// ---------------------------------------------------------------------------
test.describe('custom thresholds via editor', () => {
  const editor = (page: Page) => page.locator('#card-editor');

  test('temperature threshold change: raising temp_c_min makes a previously-pleasant reading show Cold', async ({ page }) => {
    // 23 °C is inside the default 20–24 range → Comfortable
    await setSlider(page, 'temperature', '23');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.status-badge')).toContainText('Comfortable');

    // Raise the minimum to 25 °C — now 23 °C is below the threshold
    await editor(page).locator('#temp_c_min').fill('25');
    await editor(page).locator('#temp_c_min').dispatchEvent('input');
    await expect(card(page).locator('.status-badge')).toContainText('Cold');
  });

  test('humidity threshold change: raising humidity_min makes a previously-pleasant reading show Dry', async ({ page }) => {
    // 45 % is inside the default 40–60 range → Comfortable
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '45');
    await expect(card(page).locator('.status-badge')).toContainText('Comfortable');

    // Raise the minimum humidity to 50 % — now 45 % is below the threshold
    await editor(page).locator('#humidity_min').fill('50');
    await editor(page).locator('#humidity_min').dispatchEvent('input');
    await expect(card(page).locator('.status-badge')).toContainText('Dry');
  });

  test('temperature threshold change: lowering temp_c_max makes a previously-pleasant reading show Hot', async ({ page }) => {
    // 23 °C is inside the default 20–24 range → Comfortable
    await setSlider(page, 'temperature', '23');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.status-badge')).toContainText('Comfortable');

    // Lower the maximum to 22 °C — now 23 °C is above the threshold
    await editor(page).locator('#temp_c_max').fill('22');
    await editor(page).locator('#temp_c_max').dispatchEvent('input');
    await expect(card(page).locator('.status-badge')).toContainText('Hot');
  });
});

// ---------------------------------------------------------------------------
// 3. Severity dot — colour reflects the dominant status level
// ---------------------------------------------------------------------------
test.describe('severity dot', () => {
  test('dot has severity-0 (green) when comfortable and AQ is clean', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.severity-dot')).toHaveClass(/severity-0/);
  });

  test('dot has severity-1 (orange) when thermally uncomfortable', async ({ page }) => {
    await setSlider(page, 'temperature', '10');
    await setSlider(page, 'humidity', '50');
    await expect(card(page).locator('.severity-dot')).toHaveClass(/severity-1/);
  });

  test('dot has severity-1 (orange) when AQ is moderate', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '50');
    await setSlider(page, 'co2', '1000');
    await expect(card(page).locator('.severity-dot')).toHaveClass(/severity-1/);
  });

  test('dot has severity-2 (red) when AQ is poor', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await setSlider(page, 'humidity', '50');
    await setSlider(page, 'co2', '1500');
    await expect(card(page).locator('.severity-dot')).toHaveClass(/severity-2/);
  });

  test('dot has severity-2 (red) when thermally combined', async ({ page }) => {
    await setSlider(page, 'temperature', '10');
    await setSlider(page, 'humidity', '20');
    await expect(card(page).locator('.severity-dot')).toHaveClass(/severity-2/);
  });
});

// ---------------------------------------------------------------------------
// 4. Temperature unit display (°C / °F)
// ---------------------------------------------------------------------------
test.describe('temperature unit display', () => {
  const editor = (page: Page) => page.locator('#card-editor');
  const tempReading = (page: Page) => card(page).locator('.reading').first().locator('.reading-value');

  test('shows °C by default', async ({ page }) => {
    await setSlider(page, 'temperature', '22');
    await expect(tempReading(page)).toContainText('22.0');
    await expect(tempReading(page).locator('.reading-unit')).toHaveText('°C');
    await expect(card(page).locator('.status-badge')).toContainText('Comfortable');
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
// 5. Graph visibility — graphs appear when an entity is configured,
//    disappear when the entity is removed. Temperature and humidity are
//    always shown (required entities). AQ sensor graphs are optional.
// ---------------------------------------------------------------------------
test.describe('graph visibility', () => {
  const editor = (page: Page) => page.locator('#card-editor');

  test('all graphs visible when all entities are configured', async ({ page }) => {
    await expandHistory(page);
    await expect(card(page).locator('.chart-label', { hasText: 'Temperature (24h)' })).toBeVisible();
    await expect(card(page).locator('.chart-label', { hasText: 'Humidity (24h)' })).toBeVisible();
    await expect(card(page).locator('.chart-label', { hasText: 'CO₂ (24h)' })).toBeVisible();
    await expect(card(page).locator('.chart-label', { hasText: 'NO₂ (24h)' })).toBeVisible();
    await expect(card(page).locator('.chart-label', { hasText: 'PM 2.5 (24h)' })).toBeVisible();
    await expect(card(page).locator('.chart-label', { hasText: 'PM 10 (24h)' })).toBeVisible();
    await expect(card(page).locator('.chart-label', { hasText: 'VOC (24h)' })).toBeVisible();
  });

  test('CO2 graph disappears when CO2 entity is removed', async ({ page }) => {
    await expandHistory(page);
    await expect(card(page).locator('.chart-label', { hasText: 'CO₂ (24h)' })).toBeVisible();

    await editor(page).locator('#co2_entity').fill('');
    await editor(page).locator('#co2_entity').dispatchEvent('input');
    await expect(card(page).locator('.chart-label', { hasText: 'CO₂ (24h)' })).toHaveCount(0);
  });

  test('NO2 graph disappears when NO2 entity is removed', async ({ page }) => {
    await expandHistory(page);
    await editor(page).locator('#no2_entity').fill('');
    await editor(page).locator('#no2_entity').dispatchEvent('input');
    await expect(card(page).locator('.chart-label', { hasText: 'NO₂ (24h)' })).toHaveCount(0);
  });
});
