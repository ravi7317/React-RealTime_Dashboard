import "./UserModeSwitch.css";

const MODES = [
  { id: "layman", title: "Layman", note: "Simple alerts" },
  { id: "graduate", title: "Graduate", note: "Charts and trends" },
  { id: "expert", title: "Expert", note: "Advanced tools" },
];

export default function UserModeSwitch({ selected, onChange }) {
  return (
    <div className="modeSwitch" role="tablist" aria-label="User mode">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          className={`modeButton ${selected === mode.id ? "modeButton--active" : ""}`}
          onClick={() => onChange(mode.id)}
          type="button"
          role="tab"
          aria-selected={selected === mode.id}
        >
          <span className="modeTitle">{mode.title}</span>
          <span className="modeNote">{mode.note}</span>
        </button>
      ))}
    </div>
  );
}
