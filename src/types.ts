export interface CardConfig {
  type: string;
  temperature_entity: string;
  humidity_entity: string;
  co2_entity?: string;
  name?: string;
  temperature_unit?: 'C' | 'F';
  show_temperature_graph?: boolean;
  show_humidity_graph?: boolean;
  show_co2_graph?: boolean;
  temp_c_min?: number;
  temp_c_max?: number;
  temp_f_min?: number;
  temp_f_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  no2_entity?: string;
  show_no2_graph?: boolean;
  pm25_entity?: string;
  show_pm25_graph?: boolean;
  pm10_entity?: string;
  show_pm10_graph?: boolean;
  voc_entity?: string;
  show_voc_graph?: boolean;
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
