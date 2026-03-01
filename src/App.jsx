import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import AlertsPanel from "./camponent/AlertsPanel";
import ExpertPanel from "./camponent/ExpertPanel";
import MetricCard from "./camponent/MetricCard";
import StatusCard from "./camponent/StatusCard";
import ToxicCard from "./camponent/ToxicCard";
import TrendChart from "./camponent/TrendChart";
import UserModeSwitch from "./camponent/UserModeSwitch";

const THRESHOLDS = {
  safeMax: 2500,
  hazardMax: 5000,
  toxicMax: 10000,
};

const USER_LEVELS = {
  LAYMAN: "layman",
  GRADUATE: "graduate",
  EXPERT: "expert",
};

const EXPERT_PASSWORD = "toxic123";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function bandFromValue(v) {
  if (v <= THRESHOLDS.safeMax) return "SAFE";
  if (v <= THRESHOLDS.hazardMax) return "HAZARD";
  return "TOXIC";
}

function statusFromBoth(t1, t2) {
  const b1 = bandFromValue(t1);
  const b2 = bandFromValue(t2);
  if (b1 === "TOXIC" || b2 === "TOXIC") return "TOXIC";
  if (b1 === "HAZARD" || b2 === "HAZARD") return "HAZARD";
  return "SAFE";
}

function toTimeLabel(timestamp) {
  const d = new Date(timestamp.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return timestamp;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const h = Object.fromEntries(headers.map((key, idx) => [key, idx]));

  return lines
    .slice(1)
    .map((line) => line.split(","))
    .map((cells) => ({
      timestamp: (cells[h.timestamp] || "").trim(),
      temp: Number.parseFloat(cells[h.temp_c]),
      humidity: Number.parseFloat(cells[h.humidity_pct]),
      toxic1: Number.parseFloat(cells[h.toxic1]),
      toxic2: Number.parseFloat(cells[h.toxic2]),
      overallStatus: (cells[h.overall_status] || "").trim(),
    }))
    .filter(
      (r) =>
        r.timestamp &&
        Number.isFinite(r.temp) &&
        Number.isFinite(r.humidity) &&
        Number.isFinite(r.toxic1) &&
        Number.isFinite(r.toxic2)
    );
}

function playStatusTone(status) {
  const toneByStatus = {
    SAFE: { freq: 640, duration: 0.08 },
    HAZARD: { freq: 440, duration: 0.14 },
    TOXIC: { freq: 280, duration: 0.22 },
  };

  const settings = toneByStatus[status] || toneByStatus.SAFE;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const context = new AudioCtx();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "sine";
    osc.frequency.value = settings.freq;
    gain.gain.value = 0.02;

    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();

    setTimeout(() => {
      osc.stop();
      context.close();
    }, Math.round(settings.duration * 1000));
  } catch {
    // Browser blocked autoplay audio.
  }
}

export default function App() {
  const [rows, setRows] = useState([]);
  const [index, setIndex] = useState(0);
  const [loadError, setLoadError] = useState("");

  const [userLevel, setUserLevel] = useState(USER_LEVELS.LAYMAN);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const [expertPassword, setExpertPassword] = useState("");
  const [expertUnlocked, setExpertUnlocked] = useState(false);
  const [expertFilter, setExpertFilter] = useState("ALL");
  const [expertQuery, setExpertQuery] = useState("");

  const previousStatusRef = useRef("SAFE");

  useEffect(() => {
    let cancelled = false;

    async function loadCsv() {
      try {
        const res = await fetch("/demo_dashboard_dataset.csv");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const text = await res.text();
        const parsed = parseCsv(text);

        if (!cancelled) {
          setRows(parsed);
          setIndex(0);
          setLoadError(parsed.length ? "" : "CSV file is empty.");
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(`Failed to load CSV: ${err.message}`);
        }
      }
    }

    loadCsv();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (rows.length < 2) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % rows.length);
    }, 2500);

    return () => clearInterval(id);
  }, [rows]);

  const current = rows[index] || {
    timestamp: "-",
    temp: 0,
    humidity: 0,
    toxic1: 0,
    toxic2: 0,
    overallStatus: "SAFE",
  };

  const temp = clamp(current.temp, 0, 60);
  const humidity = clamp(current.humidity, 0, 100);
  const toxic1 = clamp(current.toxic1, 0, THRESHOLDS.toxicMax);
  const toxic2 = clamp(current.toxic2, 0, THRESHOLDS.toxicMax);

  const overallStatus = useMemo(
    () => current.overallStatus || statusFromBoth(toxic1, toxic2),
    [current.overallStatus, toxic1, toxic2]
  );

  useEffect(() => {
    if (!soundEnabled) return;
    if (previousStatusRef.current === overallStatus) return;

    playStatusTone(overallStatus);
    previousStatusRef.current = overallStatus;
  }, [overallStatus, soundEnabled]);

  const band = bandFromValue(Math.max(toxic1, toxic2));

  const series = useMemo(() => {
    if (!rows.length) return [];

    const windowSize = 18;
    const points = [];

    for (let i = windowSize - 1; i >= 0; i -= 1) {
      const pos = (index - i + rows.length) % rows.length;
      const row = rows[pos];
      points.push({
        t: toTimeLabel(row.timestamp),
        toxic1: Math.round(clamp(row.toxic1, 0, THRESHOLDS.toxicMax)),
        toxic2: Math.round(clamp(row.toxic2, 0, THRESHOLDS.toxicMax)),
        temp: Math.round(clamp(row.temp, 0, 60)),
        humidity: Math.round(clamp(row.humidity, 0, 100)),
      });
    }

    return points;
  }, [index, rows]);

  const alerts = useMemo(() => {
    if (!rows.length) return [];

    const limit = Math.min(8, rows.length);
    const result = [];

    for (let i = 0; i < limit; i += 1) {
      const pos = (index - i + rows.length) % rows.length;
      const row = rows[pos];
      const status = row.overallStatus || statusFromBoth(row.toxic1, row.toxic2);
      result.push({
        time: toTimeLabel(row.timestamp),
        status,
        message: `Toxic1 ${Math.round(row.toxic1)} | Toxic2 ${Math.round(row.toxic2)}`,
      });
    }

    return result;
  }, [index, rows]);

  const filteredExpertRows = useMemo(() => {
    return rows.filter((row) => {
      const status = row.overallStatus || statusFromBoth(row.toxic1, row.toxic2);
      const filterOk = expertFilter === "ALL" || status === expertFilter;
      const query = expertQuery.trim().toLowerCase();
      const queryOk =
        query.length === 0 ||
        row.timestamp.toLowerCase().includes(query) ||
        String(Math.round(row.toxic1)).includes(query) ||
        String(Math.round(row.toxic2)).includes(query);

      return filterOk && queryOk;
    });
  }, [expertFilter, expertQuery, rows]);

  function handleUnlockExpert() {
    if (expertPassword === EXPERT_PASSWORD) {
      setExpertUnlocked(true);
      return;
    }

    setExpertUnlocked(false);
  }

  function handleExportCsv() {
    const header = "timestamp,temp_c,humidity_pct,toxic1,toxic2,overall_status";
    const body = filteredExpertRows
      .map((row) => {
        const status = row.overallStatus || statusFromBoth(row.toxic1, row.toxic2);
        return [row.timestamp, row.temp, row.humidity, row.toxic1, row.toxic2, status].join(",");
      })
      .join("\n");

    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "expert_filtered_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const showCharts = userLevel !== USER_LEVELS.LAYMAN;
  const showExpert = userLevel === USER_LEVELS.EXPERT;

  return (
    <div className="page">
      <div className="dashboardShell">
        <aside className="sideRail leftRail">
          <div className="cardBlock">
            <h2 className="railTitle">User Mode</h2>
            <UserModeSwitch selected={userLevel} onChange={setUserLevel} />
          </div>

          <div className="cardBlock">
            <h3 className="railSubTitle">Assistive Alert</h3>
            <label className="toggleLine" htmlFor="audio-toggle">
              <input
                id="audio-toggle"
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              <span>Enable status sound</span>
            </label>
            <p className="railHint">Safe: soft beep | Hazard: medium alert | Toxic: strong alarm</p>
          </div>

          <div className="cardBlock">
            <h3 className="railSubTitle">Current Snapshot</h3>
            <p className="snapshotText">Time: {toTimeLabel(current.timestamp)}</p>
            <p className="snapshotText">Condition: {overallStatus}</p>
            <p className="snapshotText">Priority Band: {band}</p>
          </div>
        </aside>

        <main className="mainContent">
          {loadError ? <div className="errorCard">{loadError}</div> : null}

          <StatusCard status={overallStatus} simplified={userLevel === USER_LEVELS.LAYMAN} />

          <div className="grid2">
            <MetricCard icon="T" label="TEMP" value={`${Math.round(temp)} C`} band={band} />
            <MetricCard icon="H" label="HUMIDITY" value={`${Math.round(humidity)} %`} band={band} />
          </div>

          <div className="grid2">
            <ToxicCard title="TOXIC1" value={Math.round(toxic1)} thresholds={THRESHOLDS} />
            <ToxicCard title="TOXIC2" value={Math.round(toxic2)} thresholds={THRESHOLDS} />
          </div>

          {showCharts ? <TrendChart data={series} /> : null}

          {showExpert ? (
            <ExpertPanel
              unlocked={expertUnlocked}
              password={expertPassword}
              onPasswordChange={setExpertPassword}
              onUnlock={handleUnlockExpert}
              rows={filteredExpertRows}
              filter={expertFilter}
              onFilterChange={setExpertFilter}
              query={expertQuery}
              onQueryChange={setExpertQuery}
              onExport={handleExportCsv}
            />
          ) : null}
        </main>

        <aside className="sideRail rightRail">
          <AlertsPanel alerts={alerts} status={overallStatus} />
        </aside>
      </div>
    </div>
  );
}
