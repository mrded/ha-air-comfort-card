import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CardConfig, HomeAssistant, HistoryState, LovelaceCard, stripDeprecatedKeys } from "./types";
import { cardStyles } from "./styles";
import { calculateComfortZone, celsiusToFahrenheit, fahrenheitToCelsius } from "./comfort-zone";
import { calculateAirQuality, AQ_THRESHOLDS, SensorReading } from "./air-quality";
import { dominantStatus } from "./status";
import { getTranslations } from "./translations";
import "./air-comfort-card-editor";
import { SvgChartPoint, SvgChartThreshold } from "./svg-chart";
import "./svg-chart";

@customElement("air-comfort-card")
export class AirComfortCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: CardConfig;
  @state() private dialSize = 280;
  @state() private temperatureHistory: SvgChartPoint[] = [];
  @state() private humidityHistory: SvgChartPoint[] = [];
  @state() private co2History: SvgChartPoint[] = [];
  @state() private no2History: SvgChartPoint[] = [];
  @state() private pm1History: SvgChartPoint[] = [];
  @state() private pm25History: SvgChartPoint[] = [];
  @state() private pm10History: SvgChartPoint[] = [];
  @state() private radonHistory: SvgChartPoint[] = [];
  @state() private vocHistory: SvgChartPoint[] = [];
  @state() private historyExpanded = false;

  private resizeObserver?: ResizeObserver;
  private historyFetchInterval?: number;
  private lastHistoryFetch = 0;

  static styles = cardStyles;

  static getStubConfig(): CardConfig {
    return {
      type: "custom:air-comfort-card",
      temperature_entity: "sensor.temperature",
      humidity_entity: "sensor.humidity",
      co2_entity: "",
      no2_entity: "",
      pm1_entity: "",
      pm25_entity: "",
      pm10_entity: "",
      radon_entity: "",
      voc_entity: "",
      temperature_unit: "C",
      temp_c_min: 20,
      temp_c_max: 24,
      temp_f_min: 68,
      temp_f_max: 75,
      humidity_min: 40,
      humidity_max: 60,
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
      temperature_unit: "C",
      temp_c_min: 20,
      temp_c_max: 24,
      temp_f_min: 68,
      temp_f_max: 75,
      humidity_min: 40,
      humidity_max: 60,
      ...stripDeprecatedKeys(config)
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
    this.fetchHistory();
    this.historyFetchInterval = window.setInterval(() => {
      this.fetchHistory();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
  }

  disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    if (this.historyFetchInterval) {
      clearInterval(this.historyFetchInterval);
    }
    super.disconnectedCallback();
  }

  private async fetchHistory(): Promise<void> {
    if (!this.hass || !this.config) {
      return;
    }

    // Debounce: don't fetch more than once per minute
    const now = Date.now();
    if (now - this.lastHistoryFetch < 60000) {
      return;
    }
    this.lastHistoryFetch = now;

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    try {
      const entityIds = [this.config.temperature_entity, this.config.humidity_entity];
      if (this.config.co2_entity) {
        entityIds.push(this.config.co2_entity);
      }
      if (this.config.no2_entity) {
        entityIds.push(this.config.no2_entity);
      }
      if (this.config.pm1_entity) {
        entityIds.push(this.config.pm1_entity);
      }
      if (this.config.pm25_entity) {
        entityIds.push(this.config.pm25_entity);
      }
      if (this.config.pm10_entity) {
        entityIds.push(this.config.pm10_entity);
      }
      if (this.config.radon_entity) {
        entityIds.push(this.config.radon_entity);
      }
      if (this.config.voc_entity) {
        entityIds.push(this.config.voc_entity);
      }

      const history = await this.hass.callApi<HistoryState[][]>(
        "GET",
        `history/period/${startTime.toISOString()}?filter_entity_id=${entityIds.join(",")}&end_time=${endTime.toISOString()}&minimal_response&no_attributes`
      );

      if (!history || history.length === 0) {
        return;
      }

      for (const entityHistory of history) {
        if (entityHistory.length === 0) continue;

        const points: SvgChartPoint[] = entityHistory
          .filter(s => !isNaN(parseFloat(s.state)))
          .map(s => ({
            time: new Date(s.last_changed),
            value: parseFloat(s.state)
          }));

        // Determine which entity this is by checking the entity_id in the first record
        const firstRecord = entityHistory[0] as any;
        if (firstRecord.entity_id === this.config.temperature_entity) {
          this.temperatureHistory = points;
        } else if (firstRecord.entity_id === this.config.humidity_entity) {
          this.humidityHistory = points;
        } else if (firstRecord.entity_id === this.config.co2_entity) {
          this.co2History = points;
        } else if (firstRecord.entity_id === this.config.no2_entity) {
          this.no2History = points;
        } else if (firstRecord.entity_id === this.config.pm1_entity) {
          this.pm1History = points;
        } else if (firstRecord.entity_id === this.config.pm25_entity) {
          this.pm25History = points;
        } else if (firstRecord.entity_id === this.config.pm10_entity) {
          this.pm10History = points;
        } else if (firstRecord.entity_id === this.config.radon_entity) {
          this.radonHistory = points;
        } else if (firstRecord.entity_id === this.config.voc_entity) {
          this.vocHistory = points;
        }
      }
    } catch (e) {
      console.error("Error fetching history:", e);
    }
  }

  private getSensorDefs() {
    const config = this.config;
    if (!config) return [];

    const tr = getTranslations(this.hass?.language);

    const thresh = (value: number | undefined, color: string, label: string): SvgChartThreshold | null =>
      value != null ? { value, color, label } : null;
    const collect = (...items: (SvgChartThreshold | null)[]): SvgChartThreshold[] =>
      items.filter((t): t is SvgChartThreshold => t !== null);

    const entityUnit = (entityKey: keyof CardConfig, fallback: string): string => {
      const id = config[entityKey] as string | undefined;
      return (id && this.hass?.states[id]?.attributes.unit_of_measurement) || fallback;
    };

    const preferredUnit = config.temperature_unit || "C";
    const tempEntityUnit = entityUnit("temperature_entity", "°C");
    const sensorIsF = tempEntityUnit === "°F" || tempEntityUnit === "F";
    const userWantsF = preferredUnit === "F";
    const displayTempUnit = userWantsF ? "°F" : "°C";
    const tempHistory = (userWantsF && !sensorIsF)
      ? this.temperatureHistory.map(p => ({ ...p, value: celsiusToFahrenheit(p.value) }))
      : (!userWantsF && sensorIsF)
      ? this.temperatureHistory.map(p => ({ ...p, value: fahrenheitToCelsius(p.value) }))
      : this.temperatureHistory;
    const tempMin = userWantsF ? config.temp_f_min : config.temp_c_min;
    const tempMax = userWantsF ? config.temp_f_max : config.temp_c_max;

    return [
      {
        id: "temperature",
        label: tr.sensors.temperature, color: "#ff6b6b",
        unit: displayTempUnit, history: tempHistory,
        show: true,
        thresholds: collect(
          thresh(tempMin, "rgba(100,150,255,0.5)", tr.thresholds.cold),
          thresh(tempMax, "rgba(255,100,80,0.5)", tr.thresholds.hot),
        ),
      },
      {
        id: "humidity",
        label: tr.sensors.humidity, color: "#4dabf7",
        unit: entityUnit("humidity_entity", "%"), history: this.humidityHistory,
        show: true,
        thresholds: collect(
          thresh(config.humidity_min, "rgba(255,180,50,0.5)", tr.thresholds.dry),
          thresh(config.humidity_max, "rgba(80,160,255,0.5)", tr.thresholds.wet),
        ),
      },
      {
        id: "co2",
        label: tr.sensors.co2, color: "#a9e34b",
        unit: entityUnit("co2_entity", "ppm"), history: this.co2History,
        show: !!config.co2_entity,
        thresholds: collect(
          thresh(AQ_THRESHOLDS.co2.good, "rgba(100,220,100,0.5)", tr.thresholds.good),
          thresh(AQ_THRESHOLDS.co2.warning, "rgba(255,180,50,0.5)", tr.thresholds.stuffy),
          thresh(AQ_THRESHOLDS.co2.poor, "rgba(255,80,80,0.5)", tr.thresholds.poor),
        ),
      },
      {
        id: "no2",
        label: tr.sensors.no2, color: "#ffa94d",
        unit: entityUnit("no2_entity", ""), history: this.no2History,
        show: !!config.no2_entity,
        thresholds: collect(
          thresh(AQ_THRESHOLDS.no2.good, "rgba(100,220,100,0.5)", tr.thresholds.good),
          thresh(AQ_THRESHOLDS.no2.warning, "rgba(255,180,50,0.5)", tr.thresholds.warning),
          thresh(AQ_THRESHOLDS.no2.poor, "rgba(255,80,80,0.5)", tr.thresholds.poor),
        ),
      },
      {
        id: "pm1",
        label: tr.sensors.pm1, color: "#e599f7",
        unit: entityUnit("pm1_entity", "µg/m³"), history: this.pm1History,
        show: !!config.pm1_entity,
        thresholds: collect(
          thresh(AQ_THRESHOLDS.pm1.good, "rgba(100,220,100,0.5)", tr.thresholds.good),
          thresh(AQ_THRESHOLDS.pm1.warning, "rgba(255,180,50,0.5)", tr.thresholds.warning),
          thresh(AQ_THRESHOLDS.pm1.poor, "rgba(255,80,80,0.5)", tr.thresholds.poor),
        ),
      },
      {
        id: "pm25",
        label: tr.sensors.pm25, color: "#da77f2",
        unit: entityUnit("pm25_entity", "µg/m³"), history: this.pm25History,
        show: !!config.pm25_entity,
        thresholds: collect(
          thresh(AQ_THRESHOLDS.pm25.good, "rgba(100,220,100,0.5)", tr.thresholds.good),
          thresh(AQ_THRESHOLDS.pm25.warning, "rgba(255,180,50,0.5)", tr.thresholds.warning),
          thresh(AQ_THRESHOLDS.pm25.poor, "rgba(255,80,80,0.5)", tr.thresholds.poor),
        ),
      },
      {
        id: "pm10",
        label: tr.sensors.pm10, color: "#74c0fc",
        unit: entityUnit("pm10_entity", "µg/m³"), history: this.pm10History,
        show: !!config.pm10_entity,
        thresholds: collect(
          thresh(AQ_THRESHOLDS.pm10.good, "rgba(100,220,100,0.5)", tr.thresholds.good),
          thresh(AQ_THRESHOLDS.pm10.warning, "rgba(255,180,50,0.5)", tr.thresholds.warning),
          thresh(AQ_THRESHOLDS.pm10.poor, "rgba(255,80,80,0.5)", tr.thresholds.poor),
        ),
      },
      {
        id: "radon",
        label: tr.sensors.radon, color: "#63e6be",
        unit: entityUnit("radon_entity", "Bq/m³"), history: this.radonHistory,
        show: !!config.radon_entity,
        thresholds: collect(
          thresh(AQ_THRESHOLDS.radon.good, "rgba(100,220,100,0.5)", tr.thresholds.good),
          thresh(AQ_THRESHOLDS.radon.warning, "rgba(255,180,50,0.5)", tr.thresholds.warning),
          thresh(AQ_THRESHOLDS.radon.poor, "rgba(255,80,80,0.5)", tr.thresholds.poor),
        ),
      },
      {
        id: "voc",
        label: tr.sensors.voc, color: "#20c997",
        unit: entityUnit("voc_entity", ""), history: this.vocHistory,
        show: !!config.voc_entity,
        thresholds: collect(
          thresh(AQ_THRESHOLDS.voc.good, "rgba(100,220,100,0.5)", tr.thresholds.good),
          thresh(AQ_THRESHOLDS.voc.warning, "rgba(255,180,50,0.5)", tr.thresholds.warning),
          thresh(AQ_THRESHOLDS.voc.poor, "rgba(255,80,80,0.5)", tr.thresholds.poor),
        ),
      },
    ];
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

    const t = getTranslations(this.hass.language);

    const tempState = this.hass.states[this.config.temperature_entity];
    const humidityState = this.hass.states[this.config.humidity_entity];

    if (!tempState || !humidityState) {
      return html`
        <div class="card-content">
          <div class="card-header">
            <div class="card-title">${t.card.title}</div>
          </div>
          <div>${t.card.entityNotFound}</div>
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
            <div class="card-title">${t.card.title}</div>
          </div>
          <div>${t.card.invalidSensorValues}</div>
        </div>
      `;
    }

    // Convert temperature to Celsius for comfort zone calculation
    // We detect the sensor's unit from its unit_of_measurement attribute
    const sensorIsF = tempUnit === "°F" || tempUnit === "F";
    const temperatureInCelsius = sensorIsF ? fahrenheitToCelsius(temperature) : temperature;

    // Determine display values based on user preference
    const preferredUnit = this.config.temperature_unit || "C";
    let displayTemperature: number;
    let displayUnit: string;

    // Calculate display temperature based on user preference and sensor unit
    if (preferredUnit === "F") {
      displayTemperature = sensorIsF ? temperature : celsiusToFahrenheit(temperature);
      displayUnit = "°F";
    } else {
      displayTemperature = sensorIsF ? fahrenheitToCelsius(temperature) : temperature;
      displayUnit = "°C";
    }

    // Select the appropriate temperature range based on the preferred unit
    // If using Fahrenheit ranges, convert them to Celsius for the comfort zone calculation
    let tempMinInCelsius: number;
    let tempMaxInCelsius: number;
    
    if (preferredUnit === "F") {
      // Use Fahrenheit ranges and convert to Celsius for calculation
      tempMinInCelsius = fahrenheitToCelsius(this.config.temp_f_min ?? 68);
      tempMaxInCelsius = fahrenheitToCelsius(this.config.temp_f_max ?? 75);
    } else {
      // Use Celsius ranges directly
      tempMinInCelsius = this.config.temp_c_min ?? 20;
      tempMaxInCelsius = this.config.temp_c_max ?? 24;
    }

    const {
      angle,
      radialDistance,
      isInComfortZone,
      statusText
    } = calculateComfortZone(temperatureInCelsius, humidity, {
      tempMin: tempMinInCelsius,
      tempMax: tempMaxInCelsius,
      humidityMin: this.config.humidity_min,
      humidityMax: this.config.humidity_max
    });

    // Calculate indicator position
    const innerRadius = this.dialSize * 0.2;
    const outerRadius = this.dialSize * 0.35;
    const MAX_RADIAL_DISTANCE_SCALE = 1.5;

    // Continuous distance from comfort zone center (0=center, 1=at zone boundary, >1=outside)
    // Uses Chebyshev (box) distance so the boundary is exactly 1.0 at all zone edges.
    const tempMidC = (tempMinInCelsius + tempMaxInCelsius) / 2;
    const humidityMidVal = ((this.config.humidity_min ?? 40) + (this.config.humidity_max ?? 60)) / 2;
    const halfTempW = Math.max(0.5, (tempMaxInCelsius - tempMinInCelsius) / 2);
    const halfHumW = Math.max(1, ((this.config.humidity_max ?? 60) - (this.config.humidity_min ?? 40)) / 2);
    const tRel = (temperatureInCelsius - tempMidC) / halfTempW;
    const hRel = (humidity - humidityMidVal) / halfHumW;
    const boxDistance = Math.max(Math.abs(tRel), Math.abs(hRel));

    let actualRadius;
    if (boxDistance <= 1) {
      // Inside comfort zone: moves smoothly from center (0) to zone boundary (innerRadius)
      actualRadius = boxDistance * innerRadius;
    } else {
      // Outside comfort zone: continues from innerRadius outward
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
    const aqStatus = this.calculateAirQuality();
    const { label: statusLabel, severity } = dominantStatus(statusText, aqStatus, t);

    return html`
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">${this.config.name || t.card.title}</div>
          <div class="status-badge">
            <span class="severity-dot severity-${severity}"></span>
            ${statusLabel}
          </div>
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

            <div class="dial-label label-top">${t.dial.hot}</div>
            <div class="dial-label label-right">${t.dial.humid}</div>
            <div class="dial-label label-bottom">${t.dial.cold}</div>
            <div class="dial-label label-left">${t.dial.dry}</div>
          </div>
        </div>

        <div class="readings">
          <div class="reading">
            <div class="reading-label">${t.readings.temperature}</div>
            <div class="reading-value">
              ${showWarning
                ? html`
                    <span class="warning-icon">⚠</span>
                  `
                : ""}
              ${displayTemperature.toFixed(1)}<span class="reading-unit"
                >${displayUnit}</span
              >
            </div>
          </div>

          <div class="reading">
            <div class="reading-label">${t.readings.humidity}</div>
            <div class="reading-value">
              ${humidity.toFixed(0)}<span class="reading-unit"
                >${humidityUnit}</span
              >
            </div>
          </div>
        </div>

    ${this.renderCharts()}
  </div>
`;
  }

  private toggleHistory(): void {
    this.historyExpanded = !this.historyExpanded;
  }

  private calculateAirQuality() {
    if (!this.config || !this.hass) return null;

    const sensors: { entity: string | undefined; thresholds: { good: number; warning: number } }[] = [
      { entity: this.config.co2_entity,   thresholds: AQ_THRESHOLDS.co2   },
      { entity: this.config.no2_entity,   thresholds: AQ_THRESHOLDS.no2   },
      { entity: this.config.pm1_entity,   thresholds: AQ_THRESHOLDS.pm1   },
      { entity: this.config.pm25_entity,  thresholds: AQ_THRESHOLDS.pm25  },
      { entity: this.config.pm10_entity,  thresholds: AQ_THRESHOLDS.pm10  },
      { entity: this.config.radon_entity, thresholds: AQ_THRESHOLDS.radon },
      { entity: this.config.voc_entity,   thresholds: AQ_THRESHOLDS.voc   },
    ];

    const readings: SensorReading[] = [];
    for (const { entity, thresholds } of sensors) {
      if (!entity) continue;
      const state = this.hass.states[entity];
      if (!state) continue;
      const value = parseFloat(state.state);
      if (isNaN(value)) continue;
      readings.push({ value, good: thresholds.good, warning: thresholds.warning });
    }

    return calculateAirQuality(readings);
  }

  private handleHistoryToggleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.toggleHistory();
    }
  }

  private renderCharts() {
    const visibleDefs = this.getSensorDefs().filter(d => d.show);
    if (visibleDefs.length === 0) return null;

    const t = getTranslations(this.hass?.language);

    return html`
      <div class="history-section">
        <div
          class="history-toggle"
          role="button"
          tabindex="0"
          aria-expanded="${this.historyExpanded}"
          @click=${this.toggleHistory}
          @keydown=${this.handleHistoryToggleKeyDown}
        >
          <span>
            ${this.historyExpanded ? t.history.hide : t.history.show}
          </span>
          <svg
            class="history-toggle-icon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </div>
        ${this.historyExpanded
          ? html`
              <div class="charts-container">
                ${visibleDefs.map(def => html`
                  <div class="chart-wrapper">
                    <div class="chart-label">${def.label} ${t.history.chartSuffix}</div>
                    <svg-line-chart
                      .data=${def.history}
                      .color=${def.color}
                      .unit=${def.unit}
                      .thresholds=${def.thresholds}
                    ></svg-line-chart>
                  </div>
                `)}
              </div>
            `
          : ""}
      </div>
    `;
  }
}

// Register the card with Home Assistant
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "air-comfort-card",
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
