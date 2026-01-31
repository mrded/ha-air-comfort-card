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
  comfort: string;
  description: string;
} {
  // Ideal comfort zone: 20-24°C and 40-60% humidity
  const idealTemp = 22;
  const idealHumidity = 50;
  
  // Calculate deviations
  const tempDev = (temp - idealTemp) / 10; // Normalize to roughly -1 to 1
  const humidityDev = (humidity - idealHumidity) / 50; // Normalize to roughly -1 to 1
  
  // Calculate angle (0-360 degrees)
  // We'll map the comfort zone as a circle where:
  // - Top (0°): Perfect comfort
  // - Right (90°): Too warm/humid
  // - Bottom (180°): Too cold/dry
  // - Left (270°): Too cold/humid
  let angle = Math.atan2(humidityDev, tempDev) * (180 / Math.PI);
  
  // Adjust angle to start from top (12 o'clock position)
  angle = (angle + 90 + 360) % 360;
  
  // Determine comfort level and description
  let comfort = 'comfortable';
  let description = 'Perfect';
  
  const distance = Math.sqrt(tempDev * tempDev + humidityDev * humidityDev);
  
  if (distance > 0.8) {
    comfort = 'very-uncomfortable';
    if (temp < 18) {
      description = humidity < 40 ? 'Too Cold & Dry' : humidity > 60 ? 'Too Cold & Humid' : 'Too Cold';
    } else if (temp > 26) {
      description = humidity < 40 ? 'Too Warm & Dry' : humidity > 60 ? 'Too Warm & Humid' : 'Too Warm';
    } else {
      description = humidity < 40 ? 'Too Dry' : 'Too Humid';
    }
  } else if (distance > 0.5) {
    comfort = 'uncomfortable';
    if (temp < 20) {
      description = humidity < 45 ? 'Slightly Cold & Dry' : humidity > 55 ? 'Slightly Cold & Humid' : 'Slightly Cold';
    } else if (temp > 24) {
      description = humidity < 45 ? 'Slightly Warm & Dry' : humidity > 55 ? 'Slightly Warm & Humid' : 'Slightly Warm';
    } else {
      description = humidity < 45 ? 'Slightly Dry' : 'Slightly Humid';
    }
  } else if (distance > 0.3) {
    comfort = 'acceptable';
    description = 'Good';
  }
  
  return { angle, comfort, description };
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

      .dial-ring {
        position: absolute;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.3);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .dial-center {
        position: absolute;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
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

    const { angle, comfort, description } = calculateComfortZone(temperature, humidity);
    
    // Calculate indicator position on the dial ring
    const radius = 80; // Position on the ring edge
    const indicatorAngle = (angle - 90) * (Math.PI / 180);
    const indicatorX = radius * Math.cos(indicatorAngle);
    const indicatorY = radius * Math.sin(indicatorAngle);

    // Determine status text based on comfort level
    let statusText = 'COMFORTABLE';
    if (temperature < 20) {
      statusText = 'COLD';
    } else if (temperature > 24) {
      statusText = 'WARM';
    } else if (humidity < 40) {
      statusText = 'DRY';
    } else if (humidity > 60) {
      statusText = 'HUMID';
    }

    // Show warning icon if not comfortable
    const showWarning = statusText !== 'COMFORTABLE';

    return html`
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">${this.config.name || 'Air Comfort'}</div>
          <div class="status-badge">${statusText}</div>
        </div>
        
        <div class="comfort-dial-container">
          <div class="comfort-dial">
            <div class="dial-ring"></div>
            <div class="dial-center"></div>
            <div 
              class="comfort-indicator"
              style="transform: translate(-50%, -50%) translate(${indicatorX}px, ${indicatorY}px);"
            ></div>
            
            <div class="dial-label label-top">TOO WARM</div>
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
  type: 'air-comfort-card',
  name: 'Air Comfort Card',
  description: 'A card that visualizes indoor air comfort using temperature and humidity',
  preview: false,
  documentationURL: 'https://github.com/mrded/ha-air-comfort-card'
});

declare global {
  interface HTMLElementTagNameMap {
    'air-comfort-card': AirComfortCard;
  }
}
