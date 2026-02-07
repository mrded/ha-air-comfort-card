export interface CardConfig {
  type: string;
  temperature_entity: string;
  humidity_entity: string;
  name?: string;
  show_temperature?: boolean;
  show_humidity?: boolean;
  show_comfort_level?: boolean;
}

export interface HomeAssistant {
  states: {
    [entity_id: string]: {
      state: string;
      attributes: Record<string, any>;
    };
  };
  callService: (domain: string, service: string, data?: any) => Promise<void>;
}

export interface LovelaceCardConfig {
  type: string;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: CardConfig): void;
  getCardSize(): number;
}
