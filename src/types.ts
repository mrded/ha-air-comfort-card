export interface CardConfig {
  type: string;
  temperature_entity: string;
  humidity_entity: string;
  co2_entity?: string;
  name?: string;
  show_temperature_graph?: boolean;
  show_humidity_graph?: boolean;
  show_co2_graph?: boolean;
  temp_min?: number;
  temp_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  co2_good?: number;
  co2_warning?: number;
  co2_poor?: number;
  no2_entity?: string;
  no2_good?: number;
  no2_warning?: number;
  no2_poor?: number;
  show_no2_graph?: boolean;
  pm25_entity?: string;
  pm25_good?: number;
  pm25_warning?: number;
  pm25_poor?: number;
  show_pm25_graph?: boolean;
  pm10_entity?: string;
  pm10_good?: number;
  pm10_warning?: number;
  pm10_poor?: number;
  show_pm10_graph?: boolean;
  voc_entity?: string;
  voc_good?: number;
  voc_warning?: number;
  voc_poor?: number;
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
