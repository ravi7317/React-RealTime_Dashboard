import "./StatusCard.css";

const STATUS_COPY = {
  SAFE: {
    title: "SAFE",
    subtitle: "Air quality in stable zone",
    icon: "OK",
  },
  HAZARD: {
    title: "WARNING",
    subtitle: "Risk rising, monitor closely",
    icon: "ALERT",
  },
  TOXIC: {
    title: "DANGER",
    subtitle: "Immediate action is required",
    icon: "CRITICAL",
  },
};

export default function StatusCard({ status = "SAFE", simplified = false }) {
  const card = STATUS_COPY[status] || STATUS_COPY.SAFE;

  return (
    <section className={`statusCard statusCard--${status.toLowerCase()}`}>
      <div className="statusIcon">{card.icon}</div>
      <div className="statusBody">
        <div className="statusText">{card.title}</div>
        <div className="statusSub">{simplified ? "System state for non-technical users" : card.subtitle}</div>
      </div>
    </section>
  );
}
