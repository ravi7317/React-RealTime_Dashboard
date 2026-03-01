import "./ToxicCard.css";

function bandFromValue(v, t) {
  if (v <= t.safeMax) return "SAFE";
  if (v <= t.hazardMax) return "HAZARD";
  return "TOXIC";
}

function progressPct(v, t) {
  return Math.max(0, Math.min(100, (v / t.toxicMax) * 100));
}

function scaleClass(band) {
  if (band === "TOXIC") return "toxicCard--toxic";
  if (band === "HAZARD") return "toxicCard--hazard";
  return "toxicCard--safe";
}

export default function ToxicCard({ title, value, unit = "", thresholds }) {
  const band = bandFromValue(value, thresholds);
  const pct = progressPct(value, thresholds);

  return (
    <article className={`toxicCard ${scaleClass(band)}`}>
      <div className="toxicCardLine" />

      <div className="toxicHeader">
        <div className="toxicTitle">{title}</div>
        <div className={`bandPill bandPill--${band.toLowerCase()}`}>{band}</div>
      </div>

      <div className="toxicValue">
        {value}
        <span className="unit">{unit}</span>
      </div>

      <div className="bandRow" aria-label="Risk bands">
        <span className={band === "SAFE" ? "active" : ""}>SAFE</span>
        <span className={band === "HAZARD" ? "active" : ""}>HAZARD</span>
        <span className={band === "TOXIC" ? "active" : ""}>TOXIC</span>
      </div>

      <div className="barWrap" aria-label="Toxic band indicator">
        <div className="barFill" style={{ width: `${pct}%` }} />
      </div>

      <div className="rangeNote">
        Green 0-{thresholds.safeMax} | Yellow {thresholds.safeMax}-{thresholds.hazardMax} | Red {thresholds.hazardMax}-{thresholds.toxicMax}
      </div>
    </article>
  );
}
