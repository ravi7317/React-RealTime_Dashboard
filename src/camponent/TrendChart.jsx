import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./TrendChart.css";

export default function TrendChart({ data }) {
  return (
    <section className="trendChart">
      <div className="trendHeader">
        <div className="trendTitle">Parameter Trend Analysis</div>
        <div className="trendSub">X-axis: Time | Y-axis: Value</div>
      </div>

      <div className="trendCanvas">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2ee" />
            <XAxis dataKey="t" tickMargin={8} />
            <YAxis domain={[0, 10000]} tickMargin={8} />
            <Tooltip />
            <Line type="monotone" dataKey="toxic1" name="Toxic1" stroke="#d50000" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="toxic2" name="Toxic2" stroke="#ff8f00" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="humidity" name="Humidity" stroke="#0088ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
