export interface CardConfig {
  type: string;
  temperature_entity: string;
  humidity_entity: string;
  name?: string;
  show_temperature?: boolean;
  show_humidity?: boolean;
  show_comfort_level?: boolean;
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
