import "./MetricCard.css";

function accentClass(band) {
  if (band === "TOXIC") return "metricCard--toxic";
  if (band === "HAZARD") return "metricCard--hazard";
  return "metricCard--safe";
}

export default function MetricCard({ icon, label, value, band = "SAFE" }) {
  return (
    <article className={`metricCard ${accentClass(band)}`}>
      <div className="metricCardLine" />
      <div className="metricTop">
        <div className="metricIcon" aria-hidden="true">{icon}</div>
        <div className="metricLabel">{label}</div>
      </div>
      <div className="metricValue">{value}</div>
    </article>
  );
}
