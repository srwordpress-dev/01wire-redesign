/**
 * Demo mode: the app runs on generated sample data and never talks to a backend.
 * Used only for the redesign review preview (branch redesign/phase-1-demo).
 *
 * Safety net: demo mode refuses to switch on at the live addresses, so even if this
 * branch were merged by mistake, production would keep talking to the real API.
 */
const LIVE_HOSTS = ["01wire-frontend.vercel.app", "dashboard.01wire.com", "app.01wire.com"];

export const DEMO_MODE: boolean =
  typeof window !== "undefined" && !LIVE_HOSTS.includes(window.location.hostname);

const b64url = (o: object) =>
  btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

/** A well-formed JWT that expires in 2100; it is never sent anywhere. */
export const DEMO_TOKEN = `${b64url({ alg: "none", typ: "JWT" })}.${b64url({
  sub: "demo",
  exp: 4102444800,
})}.demo`;

export type DemoRole = "USER" | "ADMIN";

export function enterDemo(role: DemoRole): void {
  localStorage.setItem("token", DEMO_TOKEN);
  localStorage.setItem("role", role);
  window.location.assign(role === "ADMIN" ? "/overview" : "/dashboards");
}

export function leaveDemo(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.assign("/");
}

export const DEMO_WRITE_MESSAGE = "Demo mode: changes aren't saved.";
