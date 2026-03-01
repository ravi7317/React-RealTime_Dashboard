import "./ExpertPanel.css";

export default function ExpertPanel({
  unlocked,
  password,
  onPasswordChange,
  onUnlock,
  rows,
  filter,
  onFilterChange,
  query,
  onQueryChange,
  onExport,
}) {
  if (!unlocked) {
    return (
      <section className="expertPanel">
        <h3 className="expertTitle">Expert Panel (Protected)</h3>
        <p className="expertHint">Unlock to view raw data, filters, and export tools.</p>
        <div className="unlockRow">
          <input
            className="expertInput"
            type="password"
            value={password}
            placeholder="Enter password"
            onChange={(e) => onPasswordChange(e.target.value)}
          />
          <button className="expertButton" onClick={onUnlock} type="button">
            Unlock
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="expertPanel">
      <div className="expertHeader">
        <h3 className="expertTitle">Expert Analytics</h3>
        <button className="expertButton" onClick={onExport} type="button">
          Export CSV
        </button>
      </div>

      <div className="expertControls">
        <select className="expertSelect" value={filter} onChange={(e) => onFilterChange(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="SAFE">Safe</option>
          <option value="HAZARD">Hazard</option>
          <option value="TOXIC">Toxic</option>
        </select>
        <input
          className="expertInput"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search timestamp or toxic values"
        />
      </div>

      <div className="tableWrap">
        <table className="expertTable">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Temp</th>
              <th>Humidity</th>
              <th>Toxic1</th>
              <th>Toxic2</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 20).map((row) => (
              <tr key={`${row.timestamp}-${row.toxic1}-${row.toxic2}`}>
                <td>{row.timestamp}</td>
                <td>{row.temp}</td>
                <td>{row.humidity}</td>
                <td>{row.toxic1}</td>
                <td>{row.toxic2}</td>
                <td>{row.overallStatus || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
