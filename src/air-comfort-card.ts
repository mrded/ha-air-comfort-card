import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface CardConfig {
  type: string;
  temperature_entity: string;
  humidity_entity: string;
  name?: string;
  show_temperature?: boolean;
  show_humidity?: boolean;
  show_comfort_level?: boolean;
}

interface HomeAssistant {
  states: {
    [entity_id: string]: {
      state: string;
      attributes: Record<string, any>;
    };
  };
  callService: (domain: string, service: string, data?: any) => Promise<void>;
}

interface LovelaceCardConfig {
  type: string;
}

interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: CardConfig): void;
  getCardSize(): number;
}

// Comfort zone calculation based on temperature and humidity
function calculateComfortZone(temp: number, humidity: number): {
  angle: number;
  radialDistance: number;
  isInComfortZone: boolean;
  statusText: string;
  tempDeviation: number;
  humidityDeviation: number;
} {
  // Comfort zone: 20-24°C and 40-60% humidity
  const tempMin = 20;
  const tempMax = 24;
  const humidityMin = 40;
  const humidityMax = 60;
  
  // Normalization factors for radial distance calculation
  const TEMP_NORMALIZATION_FACTOR = 10; // 10°C deviation = 1.0 normalized
  const HUMIDITY_NORMALIZATION_FACTOR = 40; // 40% deviation = 1.0 normalized
  
  // Thresholds for combined status messages
  const TEMP_PREFERENCE_THRESHOLD = 0.5; // Prefer temperature in status when temp deviation is 50% larger
  const HUMIDITY_COMBINATION_THRESHOLD = 5; // Show combined status if humidity deviates by 5%+
  const TEMP_COMBINATION_THRESHOLD = 1; // Show combined status if temperature deviates by 1°C+
  
  // Calculate deviations from comfort zone
  let tempDeviation = 0;
  if (temp < tempMin) {
    tempDeviation = tempMin - temp;
  } else if (temp > tempMax) {
    tempDeviation = temp - tempMax;
  }
  
  let humidityDeviation = 0;
  if (humidity < humidityMin) {
    humidityDeviation = humidityMin - humidity;
  } else if (humidity > humidityMax) {
    humidityDeviation = humidity - humidityMax;
  }
  
  // Check if in comfort zone
  const isInComfortZone = tempDeviation === 0 && humidityDeviation === 0;
  
  // Calculate direction angle based on which side of comfort zone we're on
  let tempDirection = 0;
  let humidityDirection = 0;
  
  if (temp < tempMin) {
    tempDirection = -1; // Cold
  } else if (temp > tempMax) {
    tempDirection = 1; // Warm
  }
  
  if (humidity < humidityMin) {
    humidityDirection = -1; // Dry
  } else if (humidity > humidityMax) {
    humidityDirection = 1; // Humid
  }
  
  // Map to angle (0-360 degrees)
  // Top (0°): Too warm
  // Right (90°): Humid  
  // Bottom (180°): Cold
  // Left (270°): Dry
  let angle = 0;
  
  if (isInComfortZone) {
    // If fully in comfort zone, use actual values relative to ideal center to determine a neutral position
    const idealTemp = (tempMin + tempMax) / 2;
    const idealHumidity = (humidityMin + humidityMax) / 2;
    const tempOffset = temp - idealTemp;
    const humidityOffset = humidity - idealHumidity;
    angle = Math.atan2(humidityOffset, tempOffset) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;
  } else {
    // Calculate angle based on actual deviations, not just direction
    // Use actual deviation values for angle calculation
    let tempAngleComponent = 0;
    let humidityAngleComponent = 0;
    
    if (temp < tempMin) {
      tempAngleComponent = temp - tempMin; // Negative for cold
    } else if (temp > tempMax) {
      tempAngleComponent = temp - tempMax; // Positive for warm
    }
    
    if (humidity < humidityMin) {
      humidityAngleComponent = humidity - humidityMin; // Negative for dry
    } else if (humidity > humidityMax) {
      humidityAngleComponent = humidity - humidityMax; // Positive for humid
    }
    
    // Calculate angle using atan2(-temp, humidity) + 90 to map:
    // - Warm (temp > 0) → 0° (top)
    // - Humid (humidity > 0) → 90° (right)
    // - Cold (temp < 0) → 180° (bottom)
    // - Dry (humidity < 0) → 270° (left)
    angle = Math.atan2(-tempAngleComponent, humidityAngleComponent) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;
  }
  
  // Calculate radial distance based on deviation magnitude
  // Normalize deviations to a 0-1 scale
  const normalizedTempDev = tempDeviation / TEMP_NORMALIZATION_FACTOR;
  const normalizedHumidityDev = humidityDeviation / HUMIDITY_NORMALIZATION_FACTOR;
  
  // Combined deviation (Euclidean distance)
  const radialDistance = Math.sqrt(
    normalizedTempDev * normalizedTempDev + 
    normalizedHumidityDev * normalizedHumidityDev
  );
  
  // Determine status text
  let statusText = 'PLEASANT';
  
  if (!isInComfortZone) {
    // Find the most significant deviation
    const absTempDev = Math.abs(tempDeviation);
    const absHumidityDev = Math.abs(humidityDeviation);
    
    if (absTempDev > absHumidityDev * TEMP_PREFERENCE_THRESHOLD) {
      // Temperature is the primary issue (with threshold to prefer temp)
      if (temp < tempMin) {
        statusText = absHumidityDev > HUMIDITY_COMBINATION_THRESHOLD ? (humidity < humidityMin ? 'COLD & DRY' : 'COLD & HUMID') : 'COLD';
      } else {
        statusText = absHumidityDev > HUMIDITY_COMBINATION_THRESHOLD ? (humidity < humidityMin ? 'WARM & DRY' : 'WARM & HUMID') : 'WARM';
      }
    } else {
      // Humidity is the primary issue
      if (humidity < humidityMin) {
        statusText = absTempDev > TEMP_COMBINATION_THRESHOLD ? (temp < tempMin ? 'COLD & DRY' : 'WARM & DRY') : 'DRY';
      } else {
        statusText = absTempDev > TEMP_COMBINATION_THRESHOLD ? (temp < tempMin ? 'COLD & HUMID' : 'WARM & HUMID') : 'HUMID';
      }
    }
  }
  
  return { 
    angle, 
    radialDistance, 
    isInComfortZone, 
    statusText,
    tempDeviation,
    humidityDeviation
  };
}

@customElement('air-comfort-card-editor')
export class AirComfortCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: CardConfig;

  public setConfig(config: CardConfig): void {
    this.config = config;
  }

  private _getEntities(): string[] {
    if (!this.hass) {
      return [];
    }
    
    // Get all entity IDs from Home Assistant
    return Object.keys(this.hass.states).sort();
  }

  static get styles() {
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .option {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      label {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      input {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      input[type="checkbox"] {
        width: auto;
        margin-left: 0;
      }

      .checkbox-option {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      ha-entity-picker {
        margin-top: 8px;
      }
    `;
  }

  protected render() {
    if (!this.config) {
      return html``;
    }

    const config = this.config; // Store in local variable to avoid TS warnings

    return html`
      <div class="card-config">
        <div class="option">
          <label for="name">Card Title</label>
          <input
            id="name"
            type="text"
            .value=${config.name || ''}
            placeholder="Air Comfort"
            @input=${this._valueChanged}
          />
        </div>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.temperature_entity}
          .label=${'Temperature Entity'}
          .includeDomains=${['sensor']}
          .includeDeviceClasses=${['temperature']}
          .required=${true}
          @value-changed=${this._entityChanged('temperature_entity')}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.humidity_entity}
          .label=${'Humidity Entity'}
          .includeDomains=${['sensor']}
          .includeDeviceClasses=${['humidity']}
          .required=${true}
          @value-changed=${this._entityChanged('humidity_entity')}
          allow-custom-entity
        ></ha-entity-picker>

        <div class="checkbox-option">
          <input
            id="show_temperature"
            type="checkbox"
            .checked=${config.show_temperature !== false}
            @change=${this._valueChanged}
          />
          <label for="show_temperature">Show Temperature</label>
        </div>

        <div class="checkbox-option">
          <input
            id="show_humidity"
            type="checkbox"
            .checked=${config.show_humidity !== false}
            @change=${this._valueChanged}
          />
          <label for="show_humidity">Show Humidity</label>
        </div>

        <div class="checkbox-option">
          <input
            id="show_comfort_level"
            type="checkbox"
            .checked=${config.show_comfort_level !== false}
            @change=${this._valueChanged}
          />
          <label for="show_comfort_level">Show Comfort Level</label>
        </div>
      </div>
    `;
  }

  private _entityChanged(field: string) {
    return (ev: CustomEvent) => {
      if (!this.config) {
        return;
      }

      const value = ev.detail.value;
      this.config = {
        ...this.config,
        [field]: value || undefined
      };

      const event = new CustomEvent('config-changed', {
        detail: { config: this.config },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    };
  }

  private _valueChanged(ev: Event): void {
    if (!this.config) {
      return;
    }

    const target = ev.target as HTMLInputElement | HTMLSelectElement;
    const id = target.id;
    const entityFields = new Set(['temperature_entity', 'humidity_entity']);

    let value: string | boolean | undefined;
    if (target.type === 'checkbox') {
      value = (target as HTMLInputElement).checked;
    } else if (target instanceof HTMLSelectElement) {
      // For select elements
      value = target.value;
      if (value === '' && entityFields.has(id)) {
        value = undefined;
      }
    } else {
      // For text inputs, only set to undefined if empty AND it's a required field
      // Allow empty strings for optional fields like 'name'
      value = target.value;
      if (value === '' && entityFields.has(id)) {
        value = undefined;
      }
    }

    this.config = {
      ...this.config,
      [id]: value
    };

    const event = new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

@customElement('air-comfort-card')
export class AirComfortCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: CardConfig;
  
  static getStubConfig(): CardConfig {
    return {
      type: 'custom:air-comfort-card',
      temperature_entity: 'sensor.temperature',
      humidity_entity: 'sensor.humidity',
      show_temperature: true,
      show_humidity: true,
      show_comfort_level: true
    };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement('air-comfort-card-editor');
  }

  public setConfig(config: CardConfig): void {
    if (!config.temperature_entity) {
      throw new Error('You need to define a temperature_entity');
    }
    if (!config.humidity_entity) {
      throw new Error('You need to define a humidity_entity');
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

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        padding: 24px;
        background: var(--ha-card-background, var(--card-background-color, #1a1a1a));
        border-radius: 12px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }

      .card-title {
        font-size: 1.5em;
        font-weight: 400;
        color: var(--primary-text-color, #ffffff);
      }

      .status-badge {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--primary-text-color, #ffffff);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .comfort-dial-container {
        position: relative;
        width: 300px;
        height: 300px;
        margin: 0 auto 32px;
      }

      .comfort-dial {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dial-outer-ring {
        position: absolute;
        width: 240px;
        height: 240px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .dial-comfort-zone {
        position: absolute;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: rgba(100, 200, 100, 0.15);
        border: 2px solid rgba(100, 200, 100, 0.4);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
      }

      .comfort-indicator {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        top: 50%;
        left: 50%;
        z-index: 3;
        transition: transform 0.5s ease;
      }

      .dial-label {
        position: absolute;
        font-size: 0.9em;
        font-weight: 500;
        color: var(--primary-text-color, #ffffff);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .label-top {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      .label-right {
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
      }

      .label-bottom {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      }

      .label-left {
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
      }

      .readings {
        display: flex;
        justify-content: space-around;
        gap: 48px;
      }

      .reading {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .reading-label {
        font-size: 0.75em;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .reading-value {
        font-size: 2.5em;
        font-weight: 300;
        color: var(--primary-text-color, #ffffff);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .reading-unit {
        font-size: 0.6em;
        color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
      }

      .warning-icon {
        font-size: 0.5em;
        color: var(--warning-color, #ff9800);
      }
    `;
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
    const tempUnit = tempState.attributes.unit_of_measurement || '°C';
    const humidityUnit = humidityState.attributes.unit_of_measurement || '%';

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

    const { angle, radialDistance, isInComfortZone, statusText } = calculateComfortZone(temperature, humidity);
    
    // Calculate indicator position
    // Inner circle radius: 60px (comfort zone)
    // Outer circle radius: 120px (max boundary)
    const innerRadius = 60; // Comfort zone radius
    const outerRadius = 120; // Max boundary radius
    const MAX_RADIAL_DISTANCE_SCALE = 1.5; // Radial distance value at which indicator reaches outer boundary
    const COMFORT_ZONE_VARIATION = 0.3; // Max movement within comfort zone as fraction of inner radius
    
    let actualRadius;
    if (isInComfortZone) {
      // Inside comfort zone: stay near center, small variations based on position within zone
      actualRadius = radialDistance * innerRadius * COMFORT_ZONE_VARIATION;
    } else {
      // Outside comfort zone: map linearly from inner edge to outer edge
      actualRadius = innerRadius + (radialDistance * (outerRadius - innerRadius) / MAX_RADIAL_DISTANCE_SCALE);
      actualRadius = Math.min(actualRadius, outerRadius); // Cap at outer radius
    }
    
    const indicatorAngle = (angle - 90) * (Math.PI / 180);
    const indicatorX = actualRadius * Math.cos(indicatorAngle);
    const indicatorY = actualRadius * Math.sin(indicatorAngle);

    // Show warning icon if not in comfort zone
    const showWarning = !isInComfortZone;

    return html`
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">${this.config.name || 'Air Comfort'}</div>
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
              ${showWarning ? html`<span class="warning-icon">⚠</span>` : ''}
              ${temperature.toFixed(1)}<span class="reading-unit">${tempUnit}</span>
            </div>
          </div>
          
          <div class="reading">
            <div class="reading-label">Humidity</div>
            <div class="reading-value">
              ${humidity.toFixed(0)}<span class="reading-unit">${humidityUnit}</span>
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
  type: 'custom:air-comfort-card',
  name: 'Air Comfort Card',
  description: 'A card that visualizes indoor air comfort using temperature and humidity',
  preview: false,
  documentationURL: 'https://github.com/mrded/ha-air-comfort-card'
});

declare global {
  interface HTMLElementTagNameMap {
    'air-comfort-card': AirComfortCard;
    'air-comfort-card-editor': AirComfortCardEditor;
  }
}
