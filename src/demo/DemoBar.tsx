import { palette, fonts, transition } from "assets/theme/tokens";
import { enterDemo, leaveDemo, DemoRole } from "demo/demoMode";

const bar: React.CSSProperties = {
  position: "fixed",
  left: "50%",
  bottom: 16,
  transform: "translateX(-50%)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  gap: 4,
  flexWrap: "nowrap",
  justifyContent: "center",
  maxWidth: "calc(100vw - 32px)",
  padding: 4,
  borderRadius: 8,
  background: palette.ink,
  boxShadow: "0 8px 24px -8px rgba(38, 37, 30, 0.4)",
  fontFamily: fonts.sans,
};

const label: React.CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: palette.surface,
  opacity: 0.72,
  padding: "0 10px",
  whiteSpace: "nowrap",
};

function Btn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        border: 0,
        cursor: "pointer",
        borderRadius: 4,
        padding: "8px 12px",
        fontFamily: fonts.sans,
        fontSize: 13,
        fontWeight: 500,
        color: active ? palette.ink : palette.surface,
        background: active ? palette.surface : "transparent",
        transition: transition("background-color", "color"),
      }}
    >
      {children}
    </button>
  );
}

/** Floating switcher shown only in demo mode. */
export default function DemoBar(): JSX.Element {
  const role = localStorage.getItem("token") ? (localStorage.getItem("role") as DemoRole) : null;
  return (
    <div style={bar} role="region" aria-label="Demo controls">
      <style>{"@media (max-width: 520px) { .demo-bar-label { display: none; } }"}</style>
      <span style={label} className="demo-bar-label">
        <span style={{ color: palette.brand, marginRight: 6 }}>●</span>Demo · sample data
      </span>
      <Btn active={role === "USER"} onClick={() => enterDemo("USER")}>
        Client view
      </Btn>
      <Btn active={role === "ADMIN"} onClick={() => enterDemo("ADMIN")}>
        Admin view
      </Btn>
      <Btn active={!role} onClick={leaveDemo}>
        Sign-in page
      </Btn>
    </div>
  );
}
