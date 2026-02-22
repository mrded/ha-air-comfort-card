import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CardConfig, HomeAssistant, stripDeprecatedKeys } from "./types";
import { editorStyles } from "./styles";
import { getTranslations } from "./translations";

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
    this.config = stripDeprecatedKeys(config);
  }

  // --- Rendering ---

  protected render() {
    if (!this.config) {
      return nothing;
    }

    const t = getTranslations(this.hass?.language);

    const temperatureUnit = this.config.temperature_unit || "C";
    const tempUnitLabel = temperatureUnit === "F" ? "°F" : "°C";
    const tempMinField = temperatureUnit === "F" ? "temp_f_min" : "temp_c_min";
    const tempMaxField = temperatureUnit === "F" ? "temp_f_max" : "temp_c_max";
    const tempDefaultMin = temperatureUnit === "F" ? 68 : 20;
    const tempDefaultMax = temperatureUnit === "F" ? 75 : 24;

    return html`
      <div class="card-config">
        ${this._renderTextField("name", t.editor.cardTitle, t.card.title)}

        <div class="section">
          <div class="section-title">${t.editor.temperatureSection}</div>
          ${this._renderEntityField("temperature_entity", t.editor.temperatureEntity, "temperature")}
          ${this._renderTemperatureUnitSelector(t)}
          ${this._renderRangeField(tempMinField, tempMaxField, `${t.editor.comfortRange} (${tempUnitLabel})`, tempDefaultMin, tempDefaultMax)}
        </div>

        <div class="section">
          <div class="section-title">${t.editor.humiditySection}</div>
          ${this._renderEntityField("humidity_entity", t.editor.humidityEntity, "humidity")}
          ${this._renderRangeField("humidity_min", "humidity_max", t.editor.comfortRangeHumidity, 40, 60)}
        </div>

        <div class="section">
          <div class="section-title">${t.editor.airQualitySection}</div>
          ${this._renderEntityField("co2_entity", t.editor.co2Entity, "carbon_dioxide", false)}
          ${this._renderEntityField("no2_entity", t.editor.no2Entity, "nitrogen_dioxide", false)}
          ${this._renderEntityField("pm25_entity", t.editor.pm25Entity, "pm25", false)}
          ${this._renderEntityField("pm10_entity", t.editor.pm10Entity, "pm10", false)}
          ${this._renderEntityField("voc_entity", t.editor.vocEntity, "volatile_organic_compounds", false)}
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

  private _renderTemperatureUnitSelector(t: ReturnType<typeof getTranslations>) {
    const currentUnit = this.config?.temperature_unit || "C";
    return html`
      <div class="option">
        <label for="temperature_unit">${t.editor.displayUnit}</label>
        <select
          id="temperature_unit"
          .value=${currentUnit}
          @change=${this._valueChanged}
        >
          <option value="C" ?selected=${currentUnit === "C"}>${t.editor.celsius}</option>
          <option value="F" ?selected=${currentUnit === "F"}>${t.editor.fahrenheit}</option>
        </select>
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
    const target = ev.target as HTMLInputElement | HTMLSelectElement;
    const id = target.id;

    let value: string | boolean | number | undefined;
    if (target instanceof HTMLSelectElement) {
      value = target.value;
    } else if (target.type === "checkbox") {
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
