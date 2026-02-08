# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a custom Home Assistant Lovelace card that visualizes indoor air comfort using temperature and humidity sensors. It displays a circular "comfort dial" with a moving dot indicator showing whether conditions are cold, warm, dry, humid, or comfortable. The card also includes 24-hour history charts for both temperature and humidity using Chart.js.

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

- **`AirComfortCard`** - Main Lovelace card component (LitElement). Renders the comfort dial, indicator dot, temperature/humidity readings, and 24-hour history charts.
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
