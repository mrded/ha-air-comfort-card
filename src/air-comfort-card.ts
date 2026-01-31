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
        padding: 16px;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .card-title {
        font-size: 1.5em;
        font-weight: 500;
        margin-bottom: 16px;
        color: var(--primary-text-color);
      }

      .comfort-dial-container {
        position: relative;
        width: 240px;
        height: 240px;
        margin: 20px 0;
      }

      .comfort-dial {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: relative;
        background: conic-gradient(
          from 0deg,
          var(--success-color, #4caf50) 0deg,
          var(--success-color, #4caf50) 72deg,
          var(--warning-color, #ff9800) 72deg,
          var(--warning-color, #ff9800) 144deg,
          var(--error-color, #f44336) 144deg,
          var(--error-color, #f44336) 216deg,
          var(--info-color, #2196f3) 216deg,
          var(--info-color, #2196f3) 288deg,
          var(--success-color, #4caf50) 288deg,
          var(--success-color, #4caf50) 360deg
        );
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .comfort-dial::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        border-radius: 50%;
        background: var(--card-background-color, #fff);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .dial-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 2;
      }

      .comfort-indicator {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        border: 3px solid var(--card-background-color, #fff);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        top: 50%;
        left: 50%;
        z-index: 3;
        transition: transform 0.5s ease;
      }

      .comfort-level {
        font-size: 1.2em;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--primary-text-color);
      }

      .comfort-description {
        font-size: 0.9em;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }

      .readings {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-top: 16px;
      }

      .reading {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .reading-label {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }

      .reading-value {
        font-size: 1.5em;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .reading-unit {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-left: 2px;
      }

      .comfortable {
        color: var(--success-color, #4caf50);
      }

      .acceptable {
        color: var(--info-color, #2196f3);
      }

      .uncomfortable {
        color: var(--warning-color, #ff9800);
      }

      .very-uncomfortable {
        color: var(--error-color, #f44336);
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
        <ha-card>
          <div class="card-content">
            <div class="card-title">Air Comfort</div>
            <div>Entity not found</div>
          </div>
        </ha-card>
      `;
    }

    const temperature = parseFloat(tempState.state);
    const humidity = parseFloat(humidityState.state);
    const tempUnit = tempState.attributes.unit_of_measurement || '°C';
    const humidityUnit = humidityState.attributes.unit_of_measurement || '%';

    if (isNaN(temperature) || isNaN(humidity)) {
      return html`
        <ha-card>
          <div class="card-content">
            <div class="card-title">Air Comfort</div>
            <div>Invalid sensor values</div>
          </div>
        </ha-card>
      `;
    }

    const { angle, comfort, description } = calculateComfortZone(temperature, humidity);
    
    // Calculate indicator position on the dial
    // Position on outer edge of the inner circle
    const radius = 96; // 80% of 120px (half of 240px)
    const indicatorAngle = (angle - 90) * (Math.PI / 180); // Convert to radians and adjust for top start
    const indicatorX = radius * Math.cos(indicatorAngle);
    const indicatorY = radius * Math.sin(indicatorAngle);

    return html`
      <ha-card>
        <div class="card-content">
          ${this.config.name ? html`<div class="card-title">${this.config.name}</div>` : ''}
          
          <div class="comfort-dial-container">
            <div class="comfort-dial"></div>
            <div class="dial-center">
              ${this.config.show_comfort_level !== false ? html`
                <div class="comfort-level ${comfort}">${description}</div>
              ` : ''}
            </div>
            <div 
              class="comfort-indicator"
              style="transform: translate(-50%, -50%) translate(${indicatorX}px, ${indicatorY}px);"
            ></div>
          </div>

          <div class="readings">
            ${this.config.show_temperature !== false ? html`
              <div class="reading">
                <div class="reading-label">Temperature</div>
                <div class="reading-value">
                  ${temperature.toFixed(1)}<span class="reading-unit">${tempUnit}</span>
                </div>
              </div>
            ` : ''}
            
            ${this.config.show_humidity !== false ? html`
              <div class="reading">
                <div class="reading-label">Humidity</div>
                <div class="reading-value">
                  ${humidity.toFixed(0)}<span class="reading-unit">${humidityUnit}</span>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </ha-card>
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
