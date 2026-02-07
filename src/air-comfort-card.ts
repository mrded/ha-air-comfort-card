import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CardConfig, HomeAssistant, LovelaceCard } from "./types";
import { cardStyles } from "./styles";
import { calculateComfortZone } from "./comfort-zone";
import "./air-comfort-card-editor";

@customElement("air-comfort-card")
export class AirComfortCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: CardConfig;

  static styles = cardStyles;

  static getStubConfig(): CardConfig {
    return {
      type: "custom:air-comfort-card",
      temperature_entity: "sensor.temperature",
      humidity_entity: "sensor.humidity",
      show_temperature: true,
      show_humidity: true,
      show_comfort_level: true
    };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement("air-comfort-card-editor");
  }

  public setConfig(config: CardConfig): void {
    if (!config.temperature_entity) {
      throw new Error("You need to define a temperature_entity");
    }
    if (!config.humidity_entity) {
      throw new Error("You need to define a humidity_entity");
    }
    this.config = {
      show_temperature: true,
      show_humidity: true,
      show_comfort_level: true,
      ...config
    };
  }

  public getCardSize(): number {
    return 4;
  }

  protected render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const tempState = this.hass.states[this.config.temperature_entity];
    const humidityState = this.hass.states[this.config.humidity_entity];

    if (!tempState || !humidityState) {
      return html`
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">Air Comfort</div>
          </div>
          <div>Entity not found</div>
        </div>
      `;
    }

    const temperature = parseFloat(tempState.state);
    const humidity = parseFloat(humidityState.state);
    const tempUnit = tempState.attributes.unit_of_measurement || "°C";
    const humidityUnit = humidityState.attributes.unit_of_measurement || "%";

    if (isNaN(temperature) || isNaN(humidity)) {
      return html`
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">Air Comfort</div>
          </div>
          <div>Invalid sensor values</div>
        </div>
      `;
    }

    const {
      angle,
      radialDistance,
      isInComfortZone,
      statusText
    } = calculateComfortZone(temperature, humidity);

    // Calculate indicator position
    const innerRadius = 60;
    const outerRadius = 120;
    const MAX_RADIAL_DISTANCE_SCALE = 1.5;
    const COMFORT_ZONE_VARIATION = 0.3;

    let actualRadius;
    if (isInComfortZone) {
      actualRadius = radialDistance * innerRadius * COMFORT_ZONE_VARIATION;
    } else {
      actualRadius =
        innerRadius +
        (radialDistance * (outerRadius - innerRadius)) /
          MAX_RADIAL_DISTANCE_SCALE;
      actualRadius = Math.min(actualRadius, outerRadius);
    }

    const indicatorAngle = (angle - 90) * (Math.PI / 180);
    const indicatorX = actualRadius * Math.cos(indicatorAngle);
    const indicatorY = actualRadius * Math.sin(indicatorAngle);

    const showWarning = !isInComfortZone;

    return html`
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">${this.config.name || "Air Comfort"}</div>
          <div class="status-badge">${statusText}</div>
        </div>

        <div class="comfort-dial-container">
          <div class="comfort-dial">
            <div class="dial-outer-ring"></div>
            <div class="dial-comfort-zone"></div>
            <div
              class="comfort-indicator"
              style="transform: translate(-50%, -50%) translate(${indicatorX}px, ${indicatorY}px);"
            ></div>

            <div class="dial-label label-top">WARM</div>
            <div class="dial-label label-right">HUMID</div>
            <div class="dial-label label-bottom">COLD</div>
            <div class="dial-label label-left">DRY</div>
          </div>
        </div>

        <div class="readings">
          <div class="reading">
            <div class="reading-label">Temperature</div>
            <div class="reading-value">
              ${showWarning
                ? html`
                    <span class="warning-icon">⚠</span>
                  `
                : ""}
              ${temperature.toFixed(1)}<span class="reading-unit"
                >${tempUnit}</span
              >
            </div>
          </div>

          <div class="reading">
            <div class="reading-label">Humidity</div>
            <div class="reading-value">
              ${humidity.toFixed(0)}<span class="reading-unit"
                >${humidityUnit}</span
              >
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Register the card with Home Assistant
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "custom:air-comfort-card",
  name: "Air Comfort Card",
  description:
    "A card that visualizes indoor air comfort using temperature and humidity",
  preview: false,
  documentationURL: "https://github.com/mrded/ha-air-comfort-card"
});

declare global {
  interface HTMLElementTagNameMap {
    "air-comfort-card": AirComfortCard;
  }
}
