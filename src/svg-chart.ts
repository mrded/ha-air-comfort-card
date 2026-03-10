import { LitElement, html, svg, css } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface SvgChartPoint {
  time: Date;
  value: number;
}

export interface SvgChartThreshold {
  value: number;
  color: string;
  label?: string;
}

const CHART_HEIGHT = 120;
const PAD = { top: 16, right: 8, bottom: 20, left: 40 } as const;

// Catmull-Rom spline → cubic bezier approximation for smooth curves
function catmullRomPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function niceYTicks(min: number, max: number, count = 4): number[] {
  if (min === max) return [min];
  const range = max - min;
  const rawStep = range / (count - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = ([1, 2, 5, 10].find(s => s * mag >= rawStep) ?? 10) * mag;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let i = 0; ; i++) {
    const v = Math.round((start + i * step) * 1e9) / 1e9;
    if (v > max + step * 0.01) break;
    if (v >= min - step * 0.5) ticks.push(v);
  }
  return ticks;
}

// Nice time intervals in milliseconds, ordered smallest to largest
const NICE_TIME_INTERVALS_MS = [
  60_000,                // 1 min
  5  * 60_000,           // 5 min
  10 * 60_000,           // 10 min
  15 * 60_000,           // 15 min
  30 * 60_000,           // 30 min
  60 * 60_000,           // 1 hour
  2  * 60 * 60_000,      // 2 hours
  4  * 60 * 60_000,      // 4 hours
  6  * 60 * 60_000,      // 6 hours
  12 * 60 * 60_000,      // 12 hours
  24 * 60 * 60_000,      // 24 hours
];

// Generate time-range-aware X-axis ticks snapped to real clock boundaries
function niceTimeTicks(minT: number, maxT: number, maxTicks = 6): number[] {
  const range = maxT - minT;
  if (range <= 0) return [minT];

  const targetInterval = range / (maxTicks - 1);
  const interval =
    NICE_TIME_INTERVALS_MS.find(i => i >= targetInterval) ??
    NICE_TIME_INTERVALS_MS[NICE_TIME_INTERVALS_MS.length - 1];

  // Snap first tick to next interval boundary after minT
  const start = Math.ceil(minT / interval) * interval;
  const ticks: number[] = [];
  for (let t = start; t <= maxT + interval * 0.01; t += interval) {
    ticks.push(t);
  }
  return ticks;
}

// Format a tick timestamp based on the overall time range
function formatTickTime(t: number, rangeMs: number): string {
  const date = new Date(t);
  if (rangeMs < 2 * 60_000) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

@customElement("svg-line-chart")
export class SvgLineChart extends LitElement {
  @property({ attribute: false }) data: SvgChartPoint[] = [];
  @property() color = "#4dabf7";
  @property() unit = "";
  @property({ attribute: false }) thresholds: SvgChartThreshold[] = [];

  private _width = 0;
  private ro?: ResizeObserver;

  static styles = css`
    :host {
      display: block;
      position: relative;
    }
    svg {
      display: block;
    }
    .tooltip {
      position: absolute;
      display: none;
      top: 0;
      background: var(--card-background-color, #1e1e1e);
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.15));
      border-radius: 4px;
      padding: 3px 7px;
      font-size: 11px;
      color: var(--secondary-text-color, rgba(255, 255, 255, 0.6));
      pointer-events: none;
      white-space: nowrap;
      z-index: 10;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? 0;
      if (Math.abs(w - this._width) > 1) {
        this._width = w;
        this.requestUpdate();
      }
    });
    this.ro.observe(this);
    this._width = this.clientWidth;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.ro?.disconnect();
  }

  private get cw() {
    return Math.max(0, this._width - PAD.left - PAD.right);
  }

  private get ch() {
    return CHART_HEIGHT - PAD.top - PAD.bottom;
  }

  private onMouseMove(e: MouseEvent) {
    if (this.data.length < 2) return;

    const svgEl = this.shadowRoot!.querySelector("svg")!;
    const rect = svgEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - PAD.left;
    const cw = this.cw;

    const times = this.data.map(p => p.time.getTime());
    const minT = times[0];
    const maxT = times[times.length - 1];
    const tRange = maxT - minT || 1;

    const fraction = Math.max(0, Math.min(1, mouseX / cw));
    const targetTime = minT + fraction * tRange;

    // Binary search for nearest point
    let lo = 0;
    let hi = this.data.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.data[mid].time.getTime() < targetTime) lo = mid + 1;
      else hi = mid;
    }
    const i =
      lo > 0 &&
      Math.abs(this.data[lo - 1].time.getTime() - targetTime) <
        Math.abs(this.data[lo].time.getTime() - targetTime)
        ? lo - 1
        : lo;

    const point = this.data[i];
    const svgX = PAD.left + ((point.time.getTime() - minT) / tRange) * cw;

    const crosshair = this.shadowRoot!.querySelector<SVGLineElement>(".crosshair");
    if (crosshair) {
      crosshair.setAttribute("x1", svgX.toFixed(1));
      crosshair.setAttribute("x2", svgX.toFixed(1));
      crosshair.style.display = "";
    }

    const tooltip = this.shadowRoot!.querySelector<HTMLElement>(".tooltip");
    if (tooltip) {
      const timeStr = formatTickTime(point.time.getTime(), tRange);
      tooltip.textContent = `${timeStr} · ${point.value.toFixed(1)}${this.unit}`;
      tooltip.style.display = "block";
      const tipLeft = svgX + 10;
      tooltip.style.left = `${Math.min(tipLeft, this._width - 150)}px`;
    }
  }

  private onMouseLeave() {
    const crosshair = this.shadowRoot!.querySelector<SVGLineElement>(".crosshair");
    if (crosshair) crosshair.style.display = "none";
    const tooltip = this.shadowRoot!.querySelector<HTMLElement>(".tooltip");
    if (tooltip) tooltip.style.display = "none";
  }

  render() {
    if (this._width < 10 || this.data.length < 2) return html``;

    const cw = this.cw;
    const ch = this.ch;

    const times = this.data.map(p => p.time.getTime());
    const minT = times[0];
    const maxT = times[times.length - 1];
    const tRange = maxT - minT || 1;

    const vals = this.data.map(p => p.value);
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    const vPad = (rawMax - rawMin) * 0.1 || 1;
    const minV = rawMin - vPad;
    const maxV = rawMax + vPad;
    const vRange = maxV - minV;

    // Scale to inner SVG coordinates (origin = top-left of chart area)
    const sx = (t: number) => ((t - minT) / tRange) * cw;
    const sy = (v: number) => (1 - (v - minV) / vRange) * ch;

    const pts: [number, number][] = this.data.map(p => [sx(p.time.getTime()), sy(p.value)]);
    const linePath = catmullRomPath(pts);
    const areaPath = `${linePath} L ${pts[pts.length - 1][0].toFixed(1)},${ch} L ${pts[0][0].toFixed(1)},${ch} Z`;

    const yTicks = niceYTicks(rawMin, rawMax);
    const xTicks = niceTimeTicks(minT, maxT);

    return html`
      <svg
        width="${this._width}"
        height="${CHART_HEIGHT}"
        @mousemove=${this.onMouseMove}
        @mouseleave=${this.onMouseLeave}
      >
        <!-- Y axis labels -->
        ${yTicks.map(v => {
          const y = PAD.top + sy(v);
          if (y < PAD.top - 2 || y > PAD.top + ch + 2) return "";
          return svg`
            <text
              x="${PAD.left - 4}" y="${y}"
              text-anchor="end" dominant-baseline="middle"
              font-size="10"
              fill="var(--secondary-text-color, rgba(255,255,255,0.6))"
            >${Math.round(v)}${this.unit}</text>
          `;
        })}

        <!-- X axis labels -->
        ${xTicks.map(t => {
          const x = PAD.left + sx(t);
          if (x < PAD.left - 1 || x > PAD.left + cw + 1) return "";
          const isFirst = x < PAD.left + 20;
          const isLast = x > PAD.left + cw - 20;
          const anchor = isFirst ? "start" : isLast ? "end" : "middle";
          return svg`
            <text
              x="${x}" y="${PAD.top + ch + 14}"
              text-anchor="${anchor}"
              font-size="10"
              fill="var(--secondary-text-color, rgba(255,255,255,0.6))"
            >${formatTickTime(t, tRange)}</text>
          `;
        })}

        <!-- Inner chart SVG — overflow:hidden clips the data paths -->
        <svg x="${PAD.left}" y="${PAD.top}" width="${cw}" height="${ch}" overflow="hidden">
          <!-- Y grid lines -->
          ${yTicks.map(v => {
            const y = sy(v);
            if (y < -2 || y > ch + 2) return "";
            return svg`
              <line
                x1="0" y1="${y}" x2="${cw}" y2="${y}"
                stroke="var(--divider-color, rgba(255,255,255,0.1))"
                stroke-width="1"
              />
            `;
          })}

          <!-- X grid lines -->
          ${xTicks.map(t => {
            const x = sx(t);
            if (x < -1 || x > cw + 1) return "";
            return svg`
              <line
                x1="${x}" y1="0" x2="${x}" y2="${ch}"
                stroke="var(--divider-color, rgba(255,255,255,0.1))"
                stroke-width="1"
              />
            `;
          })}

          <!-- Area fill -->
          <path d="${areaPath}" fill="${this.color}33" />

          <!-- Line -->
          <path d="${linePath}" fill="none" stroke="${this.color}" stroke-width="2" />

          <!-- Threshold lines and labels -->
          ${this.thresholds.map(th => {
            const y = sy(th.value);
            if (y < 0 || y > ch) return "";
            return svg`
              <line
                x1="0" y1="${y}" x2="${cw}" y2="${y}"
                stroke="${th.color}" stroke-width="1" stroke-dasharray="6,4"
              />
              ${th.label
                ? svg`<text
                    x="${cw - 4}" y="${y - 4}"
                    text-anchor="end" font-size="10" fill="${th.color}"
                  >${th.label}</text>`
                : ""}
            `;
          })}
        </svg>

        <!-- Crosshair (hidden until hover) -->
        <line
          class="crosshair"
          x1="${PAD.left}" y1="${PAD.top}"
          x2="${PAD.left}" y2="${PAD.top + ch}"
          stroke="var(--secondary-text-color, rgba(255,255,255,0.4))"
          stroke-width="1"
          style="display:none; pointer-events:none"
        />

        <!-- Hit area for mouse events (must be last) -->
        <rect
          x="${PAD.left}" y="${PAD.top}" width="${cw}" height="${ch}"
          fill="transparent" style="cursor:crosshair"
        />
      </svg>
      <div class="tooltip"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-line-chart": SvgLineChart;
  }
}
