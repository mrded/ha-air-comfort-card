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
import { calculateComfortZone, celsiusToFahrenheit, fahrenheitToCelsius } from "./comfort-zone";
import { calculateAirQuality, SensorReading } from "./air-quality";
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
  @state() private co2History: ChartDataPoint[] = [];
  @state() private no2History: ChartDataPoint[] = [];
  @state() private pm25History: ChartDataPoint[] = [];
  @state() private pm10History: ChartDataPoint[] = [];
  @state() private vocHistory: ChartDataPoint[] = [];
  @state() private historyExpanded = false;

  private resizeObserver?: ResizeObserver;
  private charts = new Map<string, Chart>();
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
      pm25_entity: "",
      pm10_entity: "",
      voc_entity: "",
      temperature_unit: "C",
      show_temperature_graph: true,
      show_humidity_graph: true,
      show_co2_graph: true,
      show_no2_graph: true,
      show_pm25_graph: true,
      show_pm10_graph: true,
      show_voc_graph: true,
      temp_c_min: 20,
      temp_c_max: 24,
      temp_f_min: 68,
      temp_f_max: 75,
      humidity_min: 40,
      humidity_max: 60,
      co2_good: 800,
      co2_warning: 1200,
      co2_poor: 1500,
      no2_good: 50,
      no2_warning: 150,
      no2_poor: 250,
      pm25_good: 15,
      pm25_warning: 35,
      pm25_poor: 75,
      pm10_good: 45,
      pm10_warning: 100,
      pm10_poor: 150,
      voc_good: 150,
      voc_warning: 250,
      voc_poor: 400
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
      show_temperature_graph: true,
      show_humidity_graph: true,
      show_co2_graph: true,
      show_no2_graph: true,
      show_pm25_graph: true,
      show_pm10_graph: true,
      show_voc_graph: true,
      temp_c_min: 20,
      temp_c_max: 24,
      temp_f_min: 68,
      temp_f_max: 75,
      humidity_min: 40,
      humidity_max: 60,
      co2_good: 800,
      co2_warning: 1200,
      co2_poor: 1500,
      no2_good: 50,
      no2_warning: 150,
      no2_poor: 250,
      pm25_good: 15,
      pm25_warning: 35,
      pm25_poor: 75,
      pm10_good: 45,
      pm10_warning: 100,
      pm10_poor: 150,
      voc_good: 150,
      voc_warning: 250,
      voc_poor: 400,
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
      changedProperties.has("co2History") ||
      changedProperties.has("no2History") ||
      changedProperties.has("pm25History") ||
      changedProperties.has("pm10History") ||
      changedProperties.has("vocHistory") ||
      changedProperties.has("config");

    if (changedProperties.has("historyExpanded")) {
      if (this.historyExpanded) {
        this.updateCharts();
      } else {
        this.destroyCharts();
      }
    } else if (this.historyExpanded && chartDataChanged) {
      // Recreate charts when config changes so threshold lines update
      if (changedProperties.has("config")) {
        this.destroyCharts();
      }
      this.updateCharts();
    }
  }

  private destroyCharts(): void {
    for (const chart of this.charts.values()) {
      chart.destroy();
    }
    this.charts.clear();
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
      if (this.config.pm25_entity) {
        entityIds.push(this.config.pm25_entity);
      }
      if (this.config.pm10_entity) {
        entityIds.push(this.config.pm10_entity);
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
        } else if (firstRecord.entity_id === this.config.co2_entity) {
          this.co2History = points;
        } else if (firstRecord.entity_id === this.config.no2_entity) {
          this.no2History = points;
        } else if (firstRecord.entity_id === this.config.pm25_entity) {
          this.pm25History = points;
        } else if (firstRecord.entity_id === this.config.pm10_entity) {
          this.pm10History = points;
        } else if (firstRecord.entity_id === this.config.voc_entity) {
          this.vocHistory = points;
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
    unit: string,
    thresholds?: { value: number; color: string; label?: string }[]
  ): ChartConfiguration {
    const datasetPoints: ScatterDataPoint[] = data.map(point => ({
      x: point.time.getTime(),
      y: point.value
    }));

    const plugins: ChartConfiguration["plugins"] = [];
    if (thresholds && thresholds.length > 0) {
      plugins.push({
        id: "thresholdLines",
        afterDatasetsDraw(chart: Chart) {
          const { ctx, chartArea, scales } = chart;
          const yScale = scales.y;
          if (!yScale || !chartArea) return;

          ctx.save();

          for (const threshold of thresholds) {
            const yMin = yScale.min as number;
            const yMax = yScale.max as number;
            if (threshold.value < yMin || threshold.value > yMax) continue;
            const y = yScale.getPixelForValue(threshold.value);

            ctx.setLineDash([6, 4]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = threshold.color;
            ctx.beginPath();
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);
            ctx.stroke();

            if (threshold.label) {
              ctx.setLineDash([]);
              ctx.font = "10px sans-serif";
              ctx.fillStyle = threshold.color;
              ctx.textAlign = "right";
              ctx.fillText(
                threshold.label,
                chartArea.right - 4,
                y - 4
              );
            }
          }

          ctx.restore();
        }
      });
    }

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
      plugins,
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

private getSensorDefs() {
    const config = this.config;
    if (!config) return [];

    type Threshold = { value: number; color: string; label: string };
    const thresh = (value: number | undefined, color: string, label: string): Threshold | null =>
      value != null ? { value, color, label } : null;
    const collect = (...items: (Threshold | null)[]): Threshold[] =>
      items.filter((t): t is Threshold => t !== null);

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
        id: "temperature", canvasId: "temp-chart",
        label: "Temperature", color: "#ff6b6b",
        unit: displayTempUnit, history: tempHistory,
        show: config.show_temperature_graph !== false,
        thresholds: collect(
          thresh(tempMin, "rgba(100,150,255,0.5)", "Cold"),
          thresh(tempMax, "rgba(255,100,80,0.5)", "Hot"),
        ),
      },
      {
        id: "humidity", canvasId: "humidity-chart",
        label: "Humidity", color: "#4dabf7",
        unit: entityUnit("humidity_entity", "%"), history: this.humidityHistory,
        show: config.show_humidity_graph !== false,
        thresholds: collect(
          thresh(config.humidity_min, "rgba(255,180,50,0.5)", "Dry"),
          thresh(config.humidity_max, "rgba(80,160,255,0.5)", "Wet"),
        ),
      },
      {
        id: "co2", canvasId: "co2-chart",
        label: "CO₂", color: "#a9e34b",
        unit: entityUnit("co2_entity", "ppm"), history: this.co2History,
        show: config.show_co2_graph !== false && !!config.co2_entity,
        thresholds: collect(
          thresh(config.co2_good, "rgba(100,220,100,0.5)", "Good"),
          thresh(config.co2_warning, "rgba(255,180,50,0.5)", "Stuffy"),
          thresh(config.co2_poor, "rgba(255,80,80,0.5)", "Poor"),
        ),
      },
      {
        id: "no2", canvasId: "no2-chart",
        label: "NO₂", color: "#ffa94d",
        unit: entityUnit("no2_entity", ""), history: this.no2History,
        show: config.show_no2_graph !== false && !!config.no2_entity,
        thresholds: collect(
          thresh(config.no2_good, "rgba(100,220,100,0.5)", "Good"),
          thresh(config.no2_warning, "rgba(255,180,50,0.5)", "Warning"),
          thresh(config.no2_poor, "rgba(255,80,80,0.5)", "Poor"),
        ),
      },
      {
        id: "pm25", canvasId: "pm25-chart",
        label: "PM 2.5", color: "#da77f2",
        unit: entityUnit("pm25_entity", "µg/m³"), history: this.pm25History,
        show: config.show_pm25_graph !== false && !!config.pm25_entity,
        thresholds: collect(
          thresh(config.pm25_good, "rgba(100,220,100,0.5)", "Good"),
          thresh(config.pm25_warning, "rgba(255,180,50,0.5)", "Warning"),
          thresh(config.pm25_poor, "rgba(255,80,80,0.5)", "Poor"),
        ),
      },
      {
        id: "pm10", canvasId: "pm10-chart",
        label: "PM 10", color: "#74c0fc",
        unit: entityUnit("pm10_entity", "µg/m³"), history: this.pm10History,
        show: config.show_pm10_graph !== false && !!config.pm10_entity,
        thresholds: collect(
          thresh(config.pm10_good, "rgba(100,220,100,0.5)", "Good"),
          thresh(config.pm10_warning, "rgba(255,180,50,0.5)", "Warning"),
          thresh(config.pm10_poor, "rgba(255,80,80,0.5)", "Poor"),
        ),
      },
      {
        id: "voc", canvasId: "voc-chart",
        label: "VOC", color: "#20c997",
        unit: entityUnit("voc_entity", ""), history: this.vocHistory,
        show: config.show_voc_graph !== false && !!config.voc_entity,
        thresholds: collect(
          thresh(config.voc_good, "rgba(100,220,100,0.5)", "Good"),
          thresh(config.voc_warning, "rgba(255,180,50,0.5)", "Warning"),
          thresh(config.voc_poor, "rgba(255,80,80,0.5)", "Poor"),
        ),
      },
    ];
  }

  private updateCharts(): void {
    for (const def of this.getSensorDefs()) {
      const canvas = this.shadowRoot?.getElementById(def.canvasId) as HTMLCanvasElement | null;

      if (!canvas) {
        this.charts.get(def.id)?.destroy();
        this.charts.delete(def.id);
        continue;
      }

      if (def.history.length === 0) continue;

      const chartConfig = this.getChartConfig(def.history, def.label, def.color, def.unit, def.thresholds);
      const existing = this.charts.get(def.id);
      if (existing) {
        existing.data = chartConfig.data;
        existing.update("none");
      } else {
        this.charts.set(def.id, new Chart(canvas, chartConfig));
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
              ${displayTemperature.toFixed(1)}<span class="reading-unit"
                >${displayUnit}</span
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

    ${aqStatus ? html`
        <div class="air-quality-section">
          <span class="aq-dot aq-${aqStatus.level}"></span>
          <span class="aq-text">Air quality: <strong>${aqStatus.label}</strong></span>
        </div>
      ` : ''}

    ${this.renderCharts()}
  </div>
`;
  }

  private toggleHistory(): void {
    this.historyExpanded = !this.historyExpanded;
  }

  private calculateAirQuality() {
    if (!this.config || !this.hass) return null;

    const candidates = [
      { entity: this.config.co2_entity,  good: this.config.co2_good,  warning: this.config.co2_warning  },
      { entity: this.config.no2_entity,  good: this.config.no2_good,  warning: this.config.no2_warning  },
      { entity: this.config.pm25_entity, good: this.config.pm25_good, warning: this.config.pm25_warning },
      { entity: this.config.pm10_entity, good: this.config.pm10_good, warning: this.config.pm10_warning },
      { entity: this.config.voc_entity,  good: this.config.voc_good,  warning: this.config.voc_warning  },
    ];

    const readings: SensorReading[] = [];
    for (const { entity, good, warning } of candidates) {
      if (!entity || good == null || warning == null) continue;
      const state = this.hass.states[entity];
      if (!state) continue;
      const value = parseFloat(state.state);
      if (isNaN(value)) continue;
      readings.push({ value, good, warning });
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
                ${visibleDefs.map(def => html`
                  <div class="chart-wrapper">
                    <div class="chart-label">${def.label} (24h)</div>
                    <div class="chart-canvas-container">
                      <canvas id="${def.canvasId}"></canvas>
                    </div>
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
