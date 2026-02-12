import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CardConfig, HomeAssistant } from "./types";
import { editorStyles } from "./styles";

type EntityField = "temperature_entity" | "humidity_entity" | "co2_entity" | "no2_entity" | "pm25_entity" | "pm10_entity" | "voc_entity";

const ENTITY_FIELDS = new Set<string>(["temperature_entity", "humidity_entity", "co2_entity", "no2_entity", "pm25_entity", "pm10_entity", "voc_entity"]);

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

        <div class="section">
          <div class="section-title">Temperature</div>
          ${this._renderEntityField("temperature_entity", "Temperature Entity", "temperature")}
          ${this._renderRangeField("temp_min", "temp_max", "Comfort Range (°C)", 20, 24)}
          ${this._renderCheckbox("show_temperature_graph", "Show Graph")}
        </div>

        <div class="section">
          <div class="section-title">Humidity</div>
          ${this._renderEntityField("humidity_entity", "Humidity Entity", "humidity")}
          ${this._renderRangeField("humidity_min", "humidity_max", "Comfort Range (%)", 40, 60)}
          ${this._renderCheckbox("show_humidity_graph", "Show Graph")}
        </div>

        <div class="section">
          <div class="section-title">CO₂</div>
          ${this._renderEntityField("co2_entity", "CO₂ Entity", "carbon_dioxide", false)}
          ${this._renderThresholdField("co2_good", "Good (ppm)", 800)}
          ${this._renderThresholdField("co2_warning", "Stuffy (ppm)", 1200)}
          ${this._renderThresholdField("co2_poor", "Poor (ppm)", 1500)}
          ${this._renderCheckbox("show_co2_graph", "Show Graph")}
        </div>

        <div class="section">
          <div class="section-title">NO₂</div>
          ${this._renderEntityField("no2_entity", "NO₂ Entity", "nitrogen_dioxide", false)}
          ${this._renderThresholdField("no2_good", "Good", 50)}
          ${this._renderThresholdField("no2_warning", "Warning", 150)}
          ${this._renderThresholdField("no2_poor", "Poor", 250)}
          ${this._renderCheckbox("show_no2_graph", "Show Graph")}
        </div>

        <div class="section">
          <div class="section-title">PM 2.5</div>
          ${this._renderEntityField("pm25_entity", "PM 2.5 Entity", "pm25", false)}
          ${this._renderThresholdField("pm25_good", "Good (µg/m³)", 15)}
          ${this._renderThresholdField("pm25_warning", "Warning (µg/m³)", 35)}
          ${this._renderThresholdField("pm25_poor", "Poor (µg/m³)", 75)}
          ${this._renderCheckbox("show_pm25_graph", "Show Graph")}
        </div>

        <div class="section">
          <div class="section-title">PM 10</div>
          ${this._renderEntityField("pm10_entity", "PM 10 Entity", "pm10", false)}
          ${this._renderThresholdField("pm10_good", "Good (µg/m³)", 45)}
          ${this._renderThresholdField("pm10_warning", "Warning (µg/m³)", 100)}
          ${this._renderThresholdField("pm10_poor", "Poor (µg/m³)", 150)}
          ${this._renderCheckbox("show_pm10_graph", "Show Graph")}
        </div>

        <div class="section">
          <div class="section-title">VOC</div>
          ${this._renderEntityField("voc_entity", "VOC Entity", "volatile_organic_compounds", false)}
          ${this._renderThresholdField("voc_good", "Good", 150)}
          ${this._renderThresholdField("voc_warning", "Warning", 250)}
          ${this._renderThresholdField("voc_poor", "Poor", 400)}
          ${this._renderCheckbox("show_voc_graph", "Show Graph")}
        </div>
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
