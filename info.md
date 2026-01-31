# Air Comfort Card

A custom Home Assistant card that visualizes indoor air comfort using temperature and humidity sensors.

![Air Comfort Card](screenshot.png)

## Features

- **Circular Comfort Dial**: Visual representation of comfort zones with color-coded regions
- **Moving Indicator**: Dynamic dot that shows current conditions on the dial
- **Temperature & Humidity Display**: Clear readings with customizable units
- **Theme-Aware**: Automatically adapts to your Home Assistant theme
- **Configurable**: Customize visibility of different elements via YAML

## Configuration

### Basic Example

```yaml
type: custom:air-comfort-card
temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
```

### Full Example

```yaml
type: custom:air-comfort-card
temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
name: Living Room Comfort
show_temperature: true
show_humidity: true
show_comfort_level: true
```

## How It Works

The card calculates comfort levels based on commonly accepted indoor comfort standards:

- **Ideal Zone**: 20-24°C (68-75°F) with 40-60% humidity
- **Color Zones**:
  - 🟢 **Green**: Perfect comfort
  - 🟡 **Yellow**: Acceptable/slightly uncomfortable
  - 🔴 **Red**: Uncomfortable conditions
  - 🔵 **Blue**: Very uncomfortable

The moving dot indicator shows your current conditions relative to these zones.

## Support

For issues, questions, or feature requests, please visit the [GitHub repository](https://github.com/mrded/ha-air-comfort-card).
