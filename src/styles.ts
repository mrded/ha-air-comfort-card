import { css } from "lit";

export const editorStyles = css`
  .card-config {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .option {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  label {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  input {
    padding: 8px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-size: 14px;
  }

  input[type="checkbox"] {
    width: auto;
    margin-left: 0;
  }

  .checkbox-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  ha-entity-picker {
    margin-top: 8px;
  }
`;

export const cardStyles = css`
  :host {
    display: block;
    min-width: 0;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    padding: clamp(16px, 4vw, 24px);
    background: var(
      --ha-card-background,
      var(--card-background-color, #1a1a1a)
    );
    border-radius: 12px;
    box-sizing: border-box;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 1.5em;
    font-weight: 400;
    color: var(--primary-text-color, #ffffff);
  }

  .status-badge {
    font-size: 1.2em;
    font-weight: 500;
    color: var(--primary-text-color, #ffffff);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .comfort-dial-container {
    position: relative;
    width: min(var(--dial-size, 300px), 100%);
    aspect-ratio: 1 / 1;
    margin: 0 auto 24px;
  }

  .comfort-dial {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dial-outer-ring {
    position: absolute;
    width: 80%;
    height: 80%;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .dial-comfort-zone {
    position: absolute;
    width: 40%;
    height: 40%;
    border-radius: 50%;
    background: rgba(100, 200, 100, 0.15);
    border: 2px solid rgba(100, 200, 100, 0.4);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  .comfort-indicator {
    position: absolute;
    width: clamp(16px, calc(var(--dial-size, 300px) * 0.08), 24px);
    height: clamp(16px, calc(var(--dial-size, 300px) * 0.08), 24px);
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    top: 50%;
    left: 50%;
    z-index: 3;
    transition: transform 0.5s ease;
  }

  .dial-label {
    position: absolute;
    font-size: 0.9em;
    font-weight: 500;
    color: var(--primary-text-color, #ffffff);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .label-top {
    top: 6%;
    left: 50%;
    transform: translateX(-50%);
  }

  .label-right {
    right: 6%;
    top: 50%;
    transform: translateY(-50%);
  }

  .label-bottom {
    bottom: 6%;
    left: 50%;
    transform: translateX(-50%);
  }

  .label-left {
    left: 6%;
    top: 50%;
    transform: translateY(-50%);
  }

  .readings {
    display: flex;
    justify-content: center;
    gap: 32px;
    flex-wrap: wrap;
  }

  .reading {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .reading-label {
    font-size: 0.75em;
    color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .reading-value {
    font-size: 2.5em;
    font-weight: 300;
    color: var(--primary-text-color, #ffffff);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .reading-unit {
    font-size: 0.6em;
    color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
  }

  .warning-icon {
    font-size: 0.5em;
    color: var(--warning-color, #ff9800);
  }

  @media (max-width: 480px) {
    .card-title {
      font-size: 1.2em;
    }

    .status-badge {
      font-size: 1em;
    }

    .readings {
      gap: 24px;
    }

    .reading-value {
      font-size: 2em;
    }
  }

  @media (max-width: 360px) {
    .card-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .comfort-dial-container {
      margin-bottom: 16px;
    }

    .readings {
      gap: 16px;
    }

    .reading {
      align-items: flex-start;
    }
  }
`;
