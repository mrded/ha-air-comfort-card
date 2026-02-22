export const DEPRECATED_KEYS = [
  'show_temperature_graph',
  'show_humidity_graph',
  'show_co2_graph',
  'show_no2_graph',
  'show_pm25_graph',
  'show_pm10_graph',
  'show_voc_graph',
  'temp_min',
  'temp_max',
  'co2_good', 'co2_warning', 'co2_poor',
  'no2_good', 'no2_warning', 'no2_poor',
  'pm25_good', 'pm25_warning', 'pm25_poor',
  'pm10_good', 'pm10_warning', 'pm10_poor',
  'voc_good', 'voc_warning', 'voc_poor',
] as const;

export function stripDeprecatedKeys(config: CardConfig): CardConfig {
  const cleaned = { ...config } as Record<string, unknown>;
  for (const key of DEPRECATED_KEYS) {
    delete cleaned[key];
  }
  return cleaned as unknown as CardConfig;
}

export interface CardConfig {
  type: string;
  temperature_entity: string;
  humidity_entity: string;
  co2_entity?: string;
  name?: string;
  temperature_unit?: 'C' | 'F';
  temp_c_min?: number;
  temp_c_max?: number;
  temp_f_min?: number;
  temp_f_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  no2_entity?: string;
  pm25_entity?: string;
  pm10_entity?: string;
  voc_entity?: string;
}

export interface EntityState {
  state: string;
  attributes: Record<string, any>;
}

export interface HistoryState {
  state: string;
  last_changed: string;
  last_updated: string;
}

export interface HomeAssistant {
  states: {
    [entity_id: string]: EntityState;
  };
  language?: string;
  callService: (domain: string, service: string, data?: any) => Promise<void>;
  callApi: <T>(method: string, path: string) => Promise<T>;
}

export interface LovelaceCardConfig {
  type: string;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: CardConfig): void;
  getCardSize(): number;
}
