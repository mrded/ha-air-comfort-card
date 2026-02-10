import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CardConfig, HomeAssistant } from "./types";
import { editorStyles } from "./styles";

@customElement("air-comfort-card-editor")
export class AirComfortCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: CardConfig;
  @state() private _entityPickerAvailable = false;

  static styles = editorStyles;

  public setConfig(config: CardConfig): void {
    this.config = config;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    void this._loadEntityPicker();
  }

  private async _loadEntityPicker(): Promise<void> {
    if (customElements.get("ha-entity-picker")) {
      this._entityPickerAvailable = true;
      return;
    }

    try {
      const helpers = await (window as any).loadCardHelpers?.();
      if (helpers) {
        const card = await helpers.createCardElement({ type: "entities", entities: [] });
        if (card) {
          await card.constructor?.getConfigElement?.();
        }
      }
    } catch {
      // ignore
    }

    if (customElements.get("ha-entity-picker")) {
      this._entityPickerAvailable = true;
      return;
    }

    // Wait up to 3 seconds for the element to appear
    try {
      await Promise.race([
        customElements.whenDefined("ha-entity-picker"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000))
      ]);
      this._entityPickerAvailable = true;
    } catch {
      this._entityPickerAvailable = false;
    }
  }

  private _renderEntityField(field: "temperature_entity" | "humidity_entity", label: string, deviceClass: string) {
    if (!this.config) {
      return nothing;
    }

    if (this._entityPickerAvailable) {
      return html`
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this.config[field]}
          .label=${label}
          .includeDomains=${["sensor"]}
          .includeDeviceClasses=${[deviceClass]}
          .required=${true}
          @value-changed=${this._entityChanged(field)}
          allow-custom-entity
        ></ha-entity-picker>
      `;
    }

    return html`
      <div class="option">
        <label for=${field}>${label}</label>
        <input
          id=${field}
          type="text"
          .value=${this.config[field] || ""}
          placeholder="sensor.example"
          @input=${this._valueChanged}
        />
      </div>
    `;
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

        ${this._renderEntityField("temperature_entity", "Temperature Entity", "temperature")}
        ${this._renderEntityField("humidity_entity", "Humidity Entity", "humidity")}

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
