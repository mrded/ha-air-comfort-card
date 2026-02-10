# Air Comfort Card

A custom Home Assistant card that visualizes indoor air comfort using temperature and humidity sensors.

![Air Comfort Card](screenshot.png)

## Features

- **Circular Comfort Dial**: Visual representation of comfort zones with color-coded regions
- **Moving Indicator**: Dynamic dot that shows current conditions on the dial
- **Temperature & Humidity Display**: Clear readings with customizable units
- **24-Hour History Charts**: Line graphs showing temperature and humidity trends over the last 24 hours
- **Theme-Aware**: Automatically adapts to your Home Assistant theme
- **Visual Editor**: Easy configuration through the Home Assistant UI
- **Configurable**: Customize card title and visibility of different elements

## Configuration

You can configure the card using the **visual editor** (recommended) or manually via YAML.

### Using Visual Editor

1. Add a new card to your dashboard
2. Search for "Air Comfort Card"
3. Select your temperature and humidity sensors
4. Customize the card title (default: "Air Comfort") and display options
5. Save the card

### Basic Example (YAML)

```yaml
type: custom:air-comfort-card
temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
```

### Full Example (YAML)

```yaml
type: custom:air-comfort-card
temperature_entity: sensor.living_room_temperature
humidity_entity: sensor.living_room_humidity
co2_entity: sensor.living_room_co2
name: Living Room Comfort
show_temperature_graph: true
show_humidity_graph: true
show_co2_graph: true
```

**Note**: The card title (`name`) can now be easily edited through the visual editor in the Home Assistant UI.

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
