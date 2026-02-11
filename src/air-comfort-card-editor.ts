import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CardConfig, HomeAssistant } from "./types";
import { editorStyles } from "./styles";

type EntityField = "temperature_entity" | "humidity_entity" | "co2_entity";

const ENTITY_FIELDS = new Set<string>(["temperature_entity", "humidity_entity", "co2_entity"]);

// Home Assistant lazy-loads ha-entity-picker — it is NOT registered when the
// editor first renders. We force-load it by creating a temporary "entities"
// card via loadCardHelpers() and calling getConfigElement() on it, which
// triggers HA to register ha-entity-picker as a custom element.
// If loading fails, the editor falls back to plain text inputs.
async function loadEntityPicker(): Promise<boolean> {
  if (customElements.get("ha-entity-picker")) {
    return true;
  }

  try {
    const helpers = await (window as any).loadCardHelpers?.();
    if (helpers) {
      const card = await helpers.createCardElement({ type: "entities", entities: [] });
      await card?.constructor?.getConfigElement?.();
    }
  } catch {
    // ignore
  }

  if (customElements.get("ha-entity-picker")) {
    return true;
  }

  try {
    await Promise.race([
      customElements.whenDefined("ha-entity-picker"),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000))
    ]);
    return true;
  } catch {
    return false;
  }
}

@customElement("air-comfort-card-editor")
export class AirComfortCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: CardConfig;
  @state() private _entityPickerAvailable = false;

  static styles = editorStyles;

  // --- Lifecycle ---

  public connectedCallback(): void {
    super.connectedCallback();
    void loadEntityPicker().then(available => { this._entityPickerAvailable = available; });
  }

  public setConfig(config: CardConfig): void {
    this.config = config;
  }

  // --- Rendering ---

  protected render() {
    if (!this.config) {
      return nothing;
    }

    return html`
      <div class="card-config">
        ${this._renderTextField("name", "Card Title", "Air Comfort")}
        ${this._renderEntityField("temperature_entity", "Temperature Entity", "temperature")}
        ${this._renderEntityField("humidity_entity", "Humidity Entity", "humidity")}
        ${this._renderEntityField("co2_entity", "CO₂ Entity", "carbon_dioxide", false)}
        ${this._renderRangeField("temp_min", "temp_max", "Temperature Range (°C)", 20, 24)}
        ${this._renderRangeField("humidity_min", "humidity_max", "Humidity Range (%)", 40, 60)}
        ${this._renderThresholdField("co2_good", "CO₂ Good (ppm)", 800)}
        ${this._renderThresholdField("co2_warning", "CO₂ Stuffy (ppm)", 1200)}
        ${this._renderThresholdField("co2_poor", "CO₂ Poor (ppm)", 1500)}
        ${this._renderCheckbox("show_temperature_graph", "Show Temperature Graph")}
        ${this._renderCheckbox("show_humidity_graph", "Show Humidity Graph")}
        ${this._renderCheckbox("show_co2_graph", "Show CO₂ Graph")}
      </div>
    `;
  }

  private _renderTextField(id: string, label: string, placeholder: string) {
    return html`
      <div class="option">
        <label for=${id}>${label}</label>
        <input
          id=${id}
          type="text"
          .value=${(this.config as any)?.[id] || ""}
          placeholder=${placeholder}
          @input=${this._valueChanged}
        />
      </div>
    `;
  }

  private _renderEntityField(field: EntityField, label: string, deviceClass: string, required = true) {
    if (!this.config) {
      return nothing;
    }

    if (this._entityPickerAvailable) {
      return html`
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this.config[field] || ""}
          .label=${label}
          .includeDomains=${["sensor"]}
          .includeDeviceClasses=${[deviceClass]}
          .required=${required}
          @value-changed=${this._entityChanged(field)}
          allow-custom-entity
        ></ha-entity-picker>
      `;
    }

    return this._renderTextField(field, label, "sensor.example");
  }

  private _renderCheckbox(id: string, label: string) {
    return html`
      <div class="checkbox-option">
        <input
          id=${id}
          type="checkbox"
          .checked=${(this.config as any)?.[id] !== false}
          @change=${this._valueChanged}
        />
        <label for=${id}>${label}</label>
      </div>
    `;
  }

  private _renderRangeField(minId: string, maxId: string, label: string, defaultMin: number, defaultMax: number) {
    return html`
      <div class="option">
        <label>${label}</label>
        <div class="range-inputs">
          <input
            id=${minId}
            type="number"
            .value=${String((this.config as any)?.[minId] ?? defaultMin)}
            placeholder=${String(defaultMin)}
            @input=${this._valueChanged}
          />
          <span class="range-separator">–</span>
          <input
            id=${maxId}
            type="number"
            .value=${String((this.config as any)?.[maxId] ?? defaultMax)}
            placeholder=${String(defaultMax)}
            @input=${this._valueChanged}
          />
        </div>
      </div>
    `;
  }

  private _renderThresholdField(id: string, label: string, defaultValue: number) {
    return html`
      <div class="option">
        <label for=${id}>${label}</label>
        <input
          id=${id}
          type="number"
          .value=${String((this.config as any)?.[id] ?? defaultValue)}
          placeholder=${String(defaultValue)}
          @input=${this._valueChanged}
        />
      </div>
    `;
  }

  // --- Event handlers ---

  private _entityChanged(field: EntityField) {
    return (ev: CustomEvent) => {
      this._updateConfig(field, ev.detail.value || undefined);
    };
  }

  private _valueChanged(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const id = target.id;

    let value: string | boolean | number | undefined;
    if (target.type === "checkbox") {
      value = target.checked;
    } else if (target.type === "number") {
      value = target.value === "" ? undefined : parseFloat(target.value);
    } else {
      value = target.value;
      if (value === "" && ENTITY_FIELDS.has(id)) {
        value = undefined;
      }
    }

    this._updateConfig(id, value);
  }

  private _updateConfig(key: string, value: string | boolean | number | undefined): void {
    if (!this.config) {
      return;
    }

    this.config = { ...this.config, [key]: value };

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "air-comfort-card-editor": AirComfortCardEditor;
  }
}
