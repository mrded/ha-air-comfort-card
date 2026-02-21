# Air Comfort Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A custom Home Assistant card that visualizes indoor air comfort using temperature and humidity sensors. The card combines both values into a single circular "comfort dial" with a moving dot indicator, showing whether a room feels cold, warm, dry, humid, or comfortable.

<img src="https://raw.githubusercontent.com/mrded/ha-air-comfort-card/main/screenshot.png" alt="Air Comfort Card Screenshot" width="400">

## Features

- 🎯 **Circular Comfort Dial**: Visual representation of comfort zones with color-coded regions
- 📍 **Moving Indicator**: Dynamic dot that shows current conditions on the dial
- 🌡️ **Temperature & Humidity Display**: Clear readings with customizable units
- 🟢 **Air Quality Status**: Overall air quality message (Good / Moderate / Poor) derived from all configured air quality sensors, based on WHO 2021 and ASHRAE guidelines
- 📊 **24-Hour History Charts**: Line graphs for temperature, humidity, CO2, NO2, PM 2.5, PM 10, and VOC
- 🎨 **Theme-Aware**: Automatically adapts to your Home Assistant theme
- ⚙️ **Configurable**: Customize visibility of different elements via YAML
- 🧹 **Clean & Intuitive**: Modern design inspired by thermostat apps
- 🔧 **TypeScript + Lit + Chart.js**: Built with modern web technologies

## Installation

### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=mrded&repository=ha-air-comfort-card&category=plugin)

1. Open HACS in your Home Assistant instance
2. Click on "Frontend"
3. Click the three dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/mrded/ha-air-comfort-card`
6. Select category "Lovelace"
7. Click "Add"
8. Find "Air Comfort Card" in the list and click "Install"
9. Restart Home Assistant

### Manual Installation

1. Download the `air-comfort-card.js` file from the [latest release](https://github.com/mrded/ha-air-comfort-card/releases)
2. Copy it to your `config/www` folder
3. Add the following to your `configuration.yaml`:

```yaml
lovelace:
  resources:
    - url: /local/air-comfort-card.js
      type: module
```

4. Restart Home Assistant

## Configuration

The card can be configured either through the **visual editor** (recommended) or manually via YAML.

### Visual Editor

1. Add a new card to your dashboard
2. Search for "Air Comfort Card"
3. Select your temperature and humidity sensors
4. Customize the card title and display options
5. Save the card

### Basic Configuration (YAML)

```yaml
type: custom:air-comfort-card
temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
```

### Full Configuration (YAML)

```yaml
type: custom:air-comfort-card
temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
co2_entity: sensor.living_room_co2
no2_entity: sensor.living_room_no2
pm25_entity: sensor.living_room_pm25
pm10_entity: sensor.living_room_pm10
voc_entity: sensor.living_room_voc
name: Living Room Comfort
temperature_unit: C
show_temperature_graph: true
show_humidity_graph: true
show_co2_graph: true
show_no2_graph: true
show_pm25_graph: true
show_pm10_graph: true
show_voc_graph: true
temp_c_min: 20
temp_c_max: 24
temp_f_min: 68
temp_f_max: 75
humidity_min: 40
humidity_max: 60
co2_good: 800
co2_warning: 1200
co2_poor: 1500
no2_good: 50
no2_warning: 150
no2_poor: 250
pm25_good: 15
pm25_warning: 35
pm25_poor: 75
pm10_good: 45
pm10_warning: 100
pm10_poor: 150
voc_good: 150
voc_warning: 250
voc_poor: 400
```

### Configuration Options

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | string | **Yes** | - | Must be `custom:air-comfort-card` |
| `temperature_entity` | string | **Yes** | - | Entity ID of your temperature sensor |
| `humidity_entity` | string | **Yes** | - | Entity ID of your humidity sensor |
| `co2_entity` | string | No | - | Entity ID of your CO2 sensor |
| `no2_entity` | string | No | - | Entity ID of your NO2 (Nitrogen Dioxide) sensor |
| `pm25_entity` | string | No | - | Entity ID of your PM 2.5 sensor |
| `pm10_entity` | string | No | - | Entity ID of your PM 10 sensor |
| `voc_entity` | string | No | - | Entity ID of your VOC (Volatile Organic Compounds) sensor |
| `name` | string | No | `Air Comfort` | Custom title for the card (editable via visual editor) |
| `temperature_unit` | string | No | `C` | Temperature display unit: `C` for Celsius or `F` for Fahrenheit |
| `show_temperature_graph` | boolean | No | `true` | Show/hide the 24-hour temperature graph |
| `show_humidity_graph` | boolean | No | `true` | Show/hide the 24-hour humidity graph |
| `show_co2_graph` | boolean | No | `true` | Show/hide the 24-hour CO2 graph |
| `show_no2_graph` | boolean | No | `true` | Show/hide the 24-hour NO2 graph |
| `show_pm25_graph` | boolean | No | `true` | Show/hide the 24-hour PM 2.5 graph |
| `show_pm10_graph` | boolean | No | `true` | Show/hide the 24-hour PM 10 graph |
| `show_voc_graph` | boolean | No | `true` | Show/hide the 24-hour VOC graph |
| `temp_c_min` | number | No | `20` | Lower bound of comfortable temperature in Celsius |
| `temp_c_max` | number | No | `24` | Upper bound of comfortable temperature in Celsius |
| `temp_f_min` | number | No | `68` | Lower bound of comfortable temperature in Fahrenheit |
| `temp_f_max` | number | No | `75` | Upper bound of comfortable temperature in Fahrenheit |
| `humidity_min` | number | No | `40` | Lower bound of comfortable humidity (%) |
| `humidity_max` | number | No | `60` | Upper bound of comfortable humidity (%) |
| `co2_good` | number | No | `800` | CO2 threshold for good indoor air (ppm) |
| `co2_warning` | number | No | `1200` | CO2 threshold for stuffy air, ventilation needed (ppm) |
| `co2_poor` | number | No | `1500` | CO2 threshold for poor air quality (ppm) |
| `no2_good` | number | No | `50` | NO2 threshold for good air quality |
| `no2_warning` | number | No | `150` | NO2 threshold for warning level |
| `no2_poor` | number | No | `250` | NO2 threshold for poor air quality |
| `pm25_good` | number | No | `15` | PM 2.5 threshold for good air quality (µg/m³) |
| `pm25_warning` | number | No | `35` | PM 2.5 threshold for warning level (µg/m³) |
| `pm25_poor` | number | No | `75` | PM 2.5 threshold for poor air quality (µg/m³) |
| `pm10_good` | number | No | `45` | PM 10 threshold for good air quality (µg/m³) |
| `pm10_warning` | number | No | `100` | PM 10 threshold for warning level (µg/m³) |
| `pm10_poor` | number | No | `150` | PM 10 threshold for poor air quality (µg/m³) |
| `voc_good` | number | No | `150` | VOC threshold for good air quality |
| `voc_warning` | number | No | `250` | VOC threshold for warning level |
| `voc_poor` | number | No | `400` | VOC threshold for poor air quality |

## How It Works

### Thermal Comfort Dial

The card calculates comfort levels based on commonly accepted indoor comfort standards (ASHRAE 55):

- **Ideal Zone**: 20-24°C (68-75°F) with 40-60% humidity
- **Color Zones**:
  - 🟢 **Green**: Perfect comfort
  - 🟡 **Yellow**: Acceptable/slightly uncomfortable
  - 🔴 **Red**: Uncomfortable conditions
  - 🔵 **Blue**: Very uncomfortable

The moving dot indicator shows your current conditions relative to these zones, making it easy to see at a glance whether your indoor environment needs adjustment.

### Air Quality Status

When one or more air quality sensors are configured (CO2, NO2, PM 2.5, PM 10, VOC), the card displays an overall **Air quality** message below the temperature and humidity readings.

The status reflects the worst sensor reading across all configured sensors:

| Status | Indicator | Meaning |
|--------|-----------|---------|
| **Good** | 🟢 | All sensors within their `*_good` threshold |
| **Moderate** | 🟠 | At least one sensor above `*_good`, none above `*_warning` |
| **Poor** | 🔴 | At least one sensor above `*_warning` |

Default thresholds are aligned with **WHO 2021 air quality guidelines** and **ASHRAE 62.1**:

| Sensor | Good | Moderate | Poor |
|--------|------|----------|------|
| CO2 | ≤ 800 ppm | ≤ 1200 ppm | > 1200 ppm |
| NO2 | ≤ 50 µg/m³ | ≤ 150 µg/m³ | > 150 µg/m³ |
| PM 2.5 | ≤ 15 µg/m³ | ≤ 35 µg/m³ | > 35 µg/m³ |
| PM 10 | ≤ 45 µg/m³ | ≤ 100 µg/m³ | > 100 µg/m³ |
| VOC | ≤ 150 | ≤ 250 | > 250 |

All thresholds are fully configurable. The `*_poor` values only affect the chart reference lines and do not affect the status message.

## Development

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js 16+ with npm)

### Building from Source

```bash
# Clone the repository
git clone https://github.com/mrded/ha-air-comfort-card.git
cd ha-air-comfort-card

# Install dependencies
bun install

# Build the card
bun run build

# Watch for changes (development)
bun run watch
```

The compiled file will be in the `dist` folder.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have questions or issues:

1. Check the [documentation](https://github.com/mrded/ha-air-comfort-card)
2. Search existing [issues](https://github.com/mrded/ha-air-comfort-card/issues)
3. Create a new issue if needed

## Credits

Inspired by modern thermostat interfaces and the need for better indoor air quality monitoring in Home Assistant.
