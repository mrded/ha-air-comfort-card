import { LitElement, html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  Chart,
  ChartConfiguration,
  registerables,
  ScatterDataPoint
} from "chart.js";
import "chartjs-adapter-date-fns";
import { CardConfig, HomeAssistant, HistoryState, LovelaceCard } from "./types";
import { cardStyles } from "./styles";
import { calculateComfortZone } from "./comfort-zone";
import "./air-comfort-card-editor";

Chart.register(...registerables);

interface ChartDataPoint {
  time: Date;
  value: number;
}

@customElement("air-comfort-card")
export class AirComfortCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: CardConfig;
  @state() private dialSize = 280;
  @state() private temperatureHistory: ChartDataPoint[] = [];
  @state() private humidityHistory: ChartDataPoint[] = [];
  @state() private historyExpanded = false;

  private resizeObserver?: ResizeObserver;
  private temperatureChart?: Chart;
  private humidityChart?: Chart;
  private historyFetchInterval?: number;
  private lastHistoryFetch = 0;

  static styles = cardStyles;

  static getStubConfig(): CardConfig {
    return {
      type: "custom:air-comfort-card",
      temperature_entity: "sensor.temperature",
      humidity_entity: "sensor.humidity",
      show_temperature: true,
      show_humidity: true,
      show_comfort_level: true,
      show_temperature_graph: true,
      show_humidity_graph: true
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
      show_temperature_graph: true,
      show_humidity_graph: true,
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
    this.destroyCharts();
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    const chartDataChanged =
      changedProperties.has("temperatureHistory") ||
      changedProperties.has("humidityHistory") ||
      changedProperties.has("config");

    if (changedProperties.has("historyExpanded")) {
      if (this.historyExpanded) {
        this.updateCharts();
      } else {
        this.destroyCharts();
      }
    } else if (this.historyExpanded && chartDataChanged) {
      this.updateCharts();
    }
  }

  private destroyCharts(): void {
    this.temperatureChart?.destroy();
    this.temperatureChart = undefined;
    this.humidityChart?.destroy();
    this.humidityChart = undefined;
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
      const history = await this.hass.callApi<HistoryState[][]>(
        "GET",
        `history/period/${startTime.toISOString()}?filter_entity_id=${this.config.temperature_entity},${this.config.humidity_entity}&end_time=${endTime.toISOString()}&minimal_response&no_attributes`
      );

      if (!history || history.length === 0) {
        return;
      }

      for (const entityHistory of history) {
        if (entityHistory.length === 0) continue;

        const points: ChartDataPoint[] = entityHistory
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
        }
      }
    } catch (e) {
      console.error("Error fetching history:", e);
    }
  }

  private getChartConfig(
    data: ChartDataPoint[],
    label: string,
    color: string,
    unit: string
  ): ChartConfiguration {
    const datasetPoints: ScatterDataPoint[] = data.map(point => ({
      x: point.time.getTime(),
      y: point.value
    }));

    return {
      type: "line",
      data: {
        datasets: [
          {
            label,
            data: datasetPoints,
            borderColor: color,
            backgroundColor: color + "33",
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index"
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: tooltipItems => {
                const tooltipItem = tooltipItems[0];
                if (!tooltipItem) {
                  return "";
                }
                const parsedX = tooltipItem.parsed.x;
                const timestamp =
                  typeof parsedX === "number"
                    ? parsedX
                    : typeof (tooltipItem.raw as { x?: number })?.x ===
                      "number"
                    ? (tooltipItem.raw as { x: number }).x
                    : undefined;
                if (typeof timestamp !== "number") {
                  return "";
                }
                const date = new Date(timestamp);
                if (Number.isNaN(date.getTime())) {
                  return "";
                }
                return date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                });
              },
              label: context => {
                return `${context.parsed.y?.toFixed(1) ?? ""}${unit}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "hour",
              displayFormats: {
                hour: "HH:mm"
              }
            },
            grid: {
              color: "rgba(255,255,255,0.1)"
            },
            ticks: {
              color: "rgba(255,255,255,0.6)",
              maxTicksLimit: 6
            }
          },
          y: {
            grid: {
              color: "rgba(255,255,255,0.1)"
            },
            ticks: {
              color: "rgba(255,255,255,0.6)",
              callback: value => `${Math.round(Number(value))}${unit}`
            }
          }
        }
      }
    };
  }

  private updateCharts(): void {
    const tempCanvas = this.shadowRoot?.getElementById(
      "temp-chart"
    ) as HTMLCanvasElement | null;
    const humidityCanvas = this.shadowRoot?.getElementById(
      "humidity-chart"
    ) as HTMLCanvasElement | null;

    if (!tempCanvas && this.temperatureChart) {
      this.temperatureChart.destroy();
      this.temperatureChart = undefined;
    }
    if (!humidityCanvas && this.humidityChart) {
      this.humidityChart.destroy();
      this.humidityChart = undefined;
    }

    if (!tempCanvas && !humidityCanvas) {
      return;
    }

    const tempState = this.hass?.states[this.config?.temperature_entity || ""];
    const humidityState = this.hass?.states[
      this.config?.humidity_entity || ""
    ];
    const tempUnit = tempState?.attributes.unit_of_measurement || "°C";
    const humidityUnit = humidityState?.attributes.unit_of_measurement || "%";

    // Update or create temperature chart
    if (tempCanvas && this.temperatureHistory.length > 0) {
      const tempConfig = this.getChartConfig(
        this.temperatureHistory,
        "Temperature",
        "#ff6b6b",
        tempUnit
      );
      if (this.temperatureChart) {
        this.temperatureChart.data = tempConfig.data;
        this.temperatureChart.update("none");
      } else {
        this.temperatureChart = new Chart(tempCanvas, tempConfig);
      }
    }

    // Update or create humidity chart
    if (humidityCanvas && this.humidityHistory.length > 0) {
      const humidityConfig = this.getChartConfig(
        this.humidityHistory,
        "Humidity",
        "#4dabf7",
        humidityUnit
      );
      if (this.humidityChart) {
        this.humidityChart.data = humidityConfig.data;
        this.humidityChart.update("none");
      } else {
        this.humidityChart = new Chart(humidityCanvas, humidityConfig);
      }
    }
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
    } = calculateComfortZone(temperature, humidity);

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
        </div>

    ${this.renderCharts()}
  </div>
`;
  }

  private toggleHistory(): void {
    this.historyExpanded = !this.historyExpanded;
  }

  private handleHistoryToggleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.toggleHistory();
    }
  }

  private renderCharts() {
    if (!this.config) {
      return null;
    }
    const showTemperatureGraph = this.config.show_temperature_graph !== false;
    const showHumidityGraph = this.config.show_humidity_graph !== false;
    if (!showTemperatureGraph && !showHumidityGraph) {
      return null;
    }
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
            ${this.historyExpanded ? "Hide 24-hour history" : "Show 24-hour history"}
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
                ${showTemperatureGraph
                  ? html`
                      <div class="chart-wrapper">
                        <div class="chart-label">Temperature (24h)</div>
                        <div class="chart-canvas-container">
                          <canvas id="temp-chart"></canvas>
                        </div>
                      </div>
                    `
                  : ""}
                ${showHumidityGraph
                  ? html`
                      <div class="chart-wrapper">
                        <div class="chart-label">Humidity (24h)</div>
                        <div class="chart-canvas-container">
                          <canvas id="humidity-chart"></canvas>
                        </div>
                      </div>
                    `
                  : ""}
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
