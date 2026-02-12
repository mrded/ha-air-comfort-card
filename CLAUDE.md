# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom Home Assistant Lovelace card that visualizes indoor air comfort using temperature and humidity sensors. It displays a circular "comfort dial" with a moving dot indicator showing whether conditions are cold, warm, dry, humid, or comfortable. The card also includes 24-hour history charts for temperature, humidity, CO2, NO2, PM 2.5, PM 10, and VOC using Chart.js.

## Commands

```bash
# Install dependencies
bun install

# Build the card (output: dist/air-comfort-card.js)
bun run build

# Watch mode for development
bun run watch

# Lint TypeScript
bun run lint
```

## Architecture

The entire card is implemented in a single file: `src/air-comfort-card.ts`

### Key Components

- **`AirComfortCard`** - Main Lovelace card component (LitElement). Renders the comfort dial, indicator dot, temperature/humidity readings, and 24-hour history charts for temperature, humidity, and air quality sensors (CO2, NO2, PM 2.5, PM 10, VOC).
- **`AirComfortCardEditor`** - Visual editor component for configuring the card in Home Assistant UI.
- **`calculateComfortZone()`** - Core algorithm that computes:
  - Indicator angle (0-360°: top=warm, right=humid, bottom=cold, left=dry)
  - Radial distance from center based on deviation from comfort zone
  - Status text (e.g., "PLEASANT", "COLD & DRY", "WARM & HUMID")

### History Charts

The card fetches 24-hour history data from Home Assistant's history API and displays it using Chart.js line charts. Key features:
- Auto-refreshes every 5 minutes
- Uses `chartjs-adapter-date-fns` for time-based x-axis
- Smooth curved lines with area fill
- Tooltips showing time and value on hover

### Comfort Zone Parameters

- Temperature: 20-24°C is ideal
- Humidity: 40-60% is ideal
- Deviations are normalized: 10°C temp deviation = 40% humidity deviation in terms of radial distance

### Home Assistant Integration

The card registers itself via `customCards` array and implements the standard Lovelace card interface (`setConfig`, `getCardSize`, `getConfigElement`). It uses `ha-entity-picker` components in the editor for entity selection. History data is fetched via `hass.callApi()` using the Home Assistant history API.

## Checklist: Adding or Removing a Card Setting

When a configuration option (e.g. `show_temperature_graph`) is added, removed, or renamed, update **all** of these locations:

1. **`src/types.ts`** — `CardConfig` interface (add/remove the property)
2. **`src/air-comfort-card.ts`** — `getStubConfig()` default values and `setConfig()` defaults
3. **`src/air-comfort-card.ts`** — `render()` / `renderCharts()` (use the setting to conditionally show/hide UI)
4. **`src/air-comfort-card-editor.ts`** — editor checkbox / input in `render()` (add/remove the control)
5. **`public/index.html`** — `settings` object and the matching checkbox in the HTML controls
6. **`README.md`** — "Full Configuration" YAML example and "Configuration Options" table
7. **`info.md`** — "Full Example" YAML block
