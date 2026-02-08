import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CardConfig, HomeAssistant } from "./types";
import { editorStyles } from "./styles";

@customElement("air-comfort-card-editor")
export class AirComfortCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: CardConfig;

  static styles = editorStyles;

  public setConfig(config: CardConfig): void {
    this.config = config;
  }

  protected render() {
    if (!this.config) {
      return html``;
    }

    const config = this.config;

    return html`
      <div class="card-config">
        <div class="option">
          <label for="name">Card Title</label>
          <input
            id="name"
            type="text"
            .value=${config.name || ""}
            placeholder="Air Comfort"
            @input=${this._valueChanged}
          />
        </div>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.temperature_entity}
          .label=${"Temperature Entity"}
          .includeDomains=${["sensor"]}
          .includeDeviceClasses=${["temperature"]}
          .required=${true}
          @value-changed=${this._entityChanged("temperature_entity")}
          allow-custom-entity
        ></ha-entity-picker>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.humidity_entity}
          .label=${"Humidity Entity"}
          .includeDomains=${["sensor"]}
          .includeDeviceClasses=${["humidity"]}
          .required=${true}
          @value-changed=${this._entityChanged("humidity_entity")}
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

        <div class="checkbox-option">
          <input
            id="show_temperature_graph"
            type="checkbox"
            .checked=${config.show_temperature_graph !== false}
            @change=${this._valueChanged}
          />
          <label for="show_temperature_graph">Show Temperature Graph</label>
        </div>

        <div class="checkbox-option">
          <input
            id="show_humidity_graph"
            type="checkbox"
            .checked=${config.show_humidity_graph !== false}
            @change=${this._valueChanged}
          />
          <label for="show_humidity_graph">Show Humidity Graph</label>
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

      const event = new CustomEvent("config-changed", {
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
    const entityFields = new Set(["temperature_entity", "humidity_entity"]);

    let value: string | boolean | undefined;
    if (target.type === "checkbox") {
      value = (target as HTMLInputElement).checked;
    } else if (target instanceof HTMLSelectElement) {
      value = target.value;
      if (value === "" && entityFields.has(id)) {
        value = undefined;
      }
    } else {
      value = target.value;
      if (value === "" && entityFields.has(id)) {
        value = undefined;
      }
    }

    this.config = {
      ...this.config,
      [id]: value
    };

    const event = new CustomEvent("config-changed", {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "air-comfort-card-editor": AirComfortCardEditor;
  }
}
