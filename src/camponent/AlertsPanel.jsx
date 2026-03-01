import "./AlertsPanel.css";

function statusClass(status) {
  if (status === "TOXIC") return "alertItem--toxic";
  if (status === "HAZARD") return "alertItem--hazard";
  return "alertItem--safe";
}

export default function AlertsPanel({ alerts, status }) {
  return (
    <section className="alertsPanel">
      <div className="alertsHeader">
        <h3 className="alertsTitle">Alerts History</h3>
        <span className={`alertsStatus alertsStatus--${status.toLowerCase()}`}>{status}</span>
      </div>

      <ul className="alertsList">
        {alerts.map((alert, idx) => (
          <li key={`${alert.time}-${idx}`} className={`alertItem ${statusClass(alert.status)}`}>
            <div className="alertTop">
              <span className="alertLevel">{alert.status}</span>
              <span className="alertTime">{alert.time}</span>
            </div>
            <div className="alertMsg">{alert.message}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
