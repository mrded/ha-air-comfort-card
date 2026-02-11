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
  @state() private dialSize = 280;

  private resizeObserver?: ResizeObserver;

  static styles = cardStyles;

  static getStubConfig(): CardConfig {
    return {
      type: "custom:air-comfort-card",
      temperature_entity: "sensor.temperature",
      humidity_entity: "sensor.humidity",
      co2_entity: "",
      show_temperature_graph: true,
      show_humidity_graph: true,
      show_co2_graph: true,
      temp_min: 20,
      temp_max: 24,
      humidity_min: 40,
      humidity_max: 60,
      co2_min: 400,
      co2_max: 1000
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
      show_temperature_graph: true,
      show_humidity_graph: true,
      show_co2_graph: true,
      temp_min: 20,
      temp_max: 24,
      humidity_min: 40,
      humidity_max: 60,
      co2_min: 400,
      co2_max: 1000,
      ...config
    };
  }

  public getCardSize(): number {
    return Math.max(3, Math.round(this.dialSize / 90));
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        this.updateDialSize(entry.contentRect.width);
      });
      this.resizeObserver.observe(this);
    }
    this.updateDialSize(this.clientWidth);
  }

  disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    super.disconnectedCallback();
  }

  private updateDialSize(width: number): void {
    if (!width) {
      return;
    }
    const horizontalPadding = 48; // card-content left + right padding
    const maxDialSize = 320;
    const minPreferredDial = 220;
    const availableWidth = Math.max(0, width - horizontalPadding);
    if (!availableWidth) {
      return;
    }
    let newSize = Math.min(maxDialSize, availableWidth);
    if (availableWidth >= minPreferredDial) {
      newSize = Math.max(minPreferredDial, newSize);
    }
    if (Math.abs(newSize - this.dialSize) > 0.5) {
      this.dialSize = newSize;
    }
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
    } = calculateComfortZone(temperature, humidity, {
      tempMin: this.config.temp_min,
      tempMax: this.config.temp_max,
      humidityMin: this.config.humidity_min,
      humidityMax: this.config.humidity_max
    });

    // Calculate indicator position
    const innerRadius = this.dialSize * 0.2;
    const outerRadius = this.dialSize * 0.4;
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

        <div
          class="comfort-dial-container"
          style="--dial-size: ${this.dialSize}px;"
        >
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
          ${this.renderCo2Reading()}
        </div>

  </div>
`;
  }

  private renderCo2Reading() {
    if (!this.config?.co2_entity || !this.hass) {
      return null;
    }
    const co2State = this.hass.states[this.config.co2_entity];
    if (!co2State) {
      return null;
    }
    const co2 = parseFloat(co2State.state);
    if (isNaN(co2)) {
      return null;
    }
    const co2Unit = co2State.attributes.unit_of_measurement || "ppm";
    const co2Min = this.config.co2_min ?? 400;
    const co2Max = this.config.co2_max ?? 1000;
    const co2Warning = co2 < co2Min || co2 > co2Max;
    return html`
      <div class="reading">
        <div class="reading-label">CO₂</div>
        <div class="reading-value">
          ${co2Warning
            ? html`<span class="warning-icon">⚠</span>`
            : ""}
          ${co2.toFixed(0)}<span class="reading-unit">${co2Unit}</span>
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
