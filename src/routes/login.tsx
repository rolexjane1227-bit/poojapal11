import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, Delete, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { Brand } from "@/components/pos/AppShell";
import { LogoMark, Wordmark } from "@/components/pos/Logo";
import barHero from "@/assets/bar-hero.jpg";
import { Input } from "@/components/ui/input";
import { delay, login } from "@/services/pos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Pooja Palace SmartPOS" },
      { name: "description", content: "Cashier and admin sign-in for Pooja Palace SmartPOS." },
      { property: "og:title", content: "Sign in — Pooja Palace SmartPOS" },
      { property: "og:description", content: "Cashier and admin sign-in for Pooja Palace SmartPOS." },
    ],
  }),
  component: LoginPage,
});

const DEMO = [
  { role: "Cashier", username: "rahul", pin: "1111", icon: UserRound },
  { role: "Admin", username: "admin", pin: "1234", icon: ShieldCheck },
];

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (u = username, p = pin) => {
    setError("");
    if (!u || p.length < 4) return setError("Enter username and 4-digit PIN");
    setLoading(true);
    await delay(400);
    try {
      const user = login(u, p);
      navigate({ to: user.role === "admin" ? "/admin" : "/cashier" });
    } catch (e) {
      setError((e as Error).message);
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const press = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4 && username) submit(username, next);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img src={barHero} alt="" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/70 lg:bg-gradient-to-r lg:from-background/40 lg:to-background/90" />
      <div className="relative grid min-h-screen lg:grid-cols-[1fr_480px]">
      <div className="hidden flex-col items-center justify-center p-10 text-center lg:flex">
        <LogoMark className="h-24 w-24" />
        <div className="mt-4"><Wordmark size="lg" /></div>
        <div className="mt-4 text-3xl font-semibold">Smart<span className="text-primary">POS</span></div>
        <p className="mt-3 text-muted-foreground">Table Ordering • Billing • Inventory • Reports</p>
        <p className="mt-16 font-serif text-3xl leading-snug">Simple Billing. Better <span className="text-primary">Business.</span></p>
      </div>

      <div className="flex flex-col justify-center px-5 py-10">
        <div className="mx-auto w-full max-w-sm rounded-3xl border bg-card/95 p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex justify-center lg:hidden"><Brand compact /></div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome Back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Login to Pooja Palace SmartPOS</p>

          <label className="mt-6 block text-sm font-medium" htmlFor="username">Username</label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" placeholder="e.g. rahul" className="mt-1.5 h-12 text-base" />

          <div className="mt-5 text-sm font-medium">PIN</div>
          <div className="mt-2 flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("grid h-12 flex-1 place-items-center rounded-md border bg-surface", pin.length > i && "border-primary")}>
                {pin.length > i && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <KeyBtn key={d} onClick={() => press(d)}>{d}</KeyBtn>
            ))}
            <KeyBtn onClick={() => setPin("")} muted>Clear</KeyBtn>
            <KeyBtn onClick={() => press("0")}>0</KeyBtn>
            <KeyBtn onClick={() => setPin(pin.slice(0, -1))} muted aria-label="Backspace"><Delete className="h-5 w-5" /></KeyBtn>
          </div>

          <button
            onClick={() => submit()}
            disabled={loading}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </button>

          <div className="mt-6">
            <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR QUICK DEMO<span className="h-px flex-1 bg-border" /></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {DEMO.map((d) => (
                <button key={d.role} onClick={() => { setUsername(d.username); setPin(d.pin); submit(d.username, d.pin); }} className="flex flex-col items-center gap-1.5 rounded-2xl border bg-surface px-3 py-4 text-center hover:border-primary">
                  <d.icon className="h-7 w-7 text-primary" />
                  <div className="text-sm font-semibold">{d.role}</div>
                  <div className="text-[11px] text-muted-foreground">{d.role === "Cashier" ? "Order & Billing" : "Manage & Reports"}</div>
                  <div className="text-[11px] text-muted-foreground">{d.username} · {d.pin}</div>
                </button>
              ))}
            </div>
            <p className="mt-5 text-center text-xs text-muted-foreground">Version 1.0.0</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function KeyBtn({ children, muted, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { muted?: boolean }) {
  return (
    <button type="button" {...rest} className={cn("h-14 rounded-md border bg-card text-xl font-medium active:bg-accent", muted && "text-sm text-muted-foreground")}>
      {children}
    </button>
  );
}
