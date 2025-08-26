import React, { useEffect, useMemo, useRef, useState } from "react";

// 🔴🟢 Red Button Clicker — with sounds, interactive blue background, RESET buttons, and menu

export default function App() {
  // ---------- Game State ----------
  const [score, setScore] = useState(0);
  const [perClick, setPerClick] = useState(1);
  const [multLevel, setMultLevel] = useState(0);
  const [autoCount, setAutoCount] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);

  // UI state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetClicksConfirm, setShowResetClicksConfirm] = useState(false);
  const [menuTab, setMenuTab] = useState("button"); // "button", "shop", "audio"

  // Audio settings state
  const [oscType, setOscType] = useState("square");
  const [frequency, setFrequency] = useState(440);
  const [duration, setDuration] = useState(0.15);

  // Costs scale up with each purchase
  const multBase = 50;
  const multScale = 1.5;
  const autoBase = 100;
  const autoScale = 1.6;

  const multCost = useMemo(() => Math.floor(multBase * Math.pow(multScale, multLevel)), [multLevel]);
  const autoCost = useMemo(() => Math.floor(autoBase * Math.pow(autoScale, autoCount)), [autoCount]);
  const cps = useMemo(() => autoCount > 0 ? Math.pow(2, autoCount - 1) : 0, [autoCount]);

  // ---------- Persistence ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rbc-save");
      if (raw) {
        const s = JSON.parse(raw);
        setScore(s.score ?? 0);
        setPerClick(s.perClick ?? 1);
        setMultLevel(s.multLevel ?? 0);
        setAutoCount(s.autoCount ?? 0);
        setTotalClicks(s.totalClicks ?? 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const payload = { score, perClick, multLevel, autoCount, totalClicks };
    try { localStorage.setItem("rbc-save", JSON.stringify(payload)); } catch {}
  }, [score, perClick, multLevel, autoCount, totalClicks]);

  // ---------- Auto Ticks ----------
  useEffect(() => {
    if (cps <= 0) return;
    const id = setInterval(() => {
      setScore((s) => s + cps);
    }, 1000);
    return () => clearInterval(id);
  }, [cps]);

  // ---------- Sound ----------
  const audioCtxRef = useRef(null);
  const ensureCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const playClickSound = () => {
    const ctx = ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = oscType;
    osc.frequency.setValueAtTime(frequency + Math.random() * 10, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playPunchSound = () => {
    const ctx = ensureCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);

    // add a noise burst for punch impact
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.15);
  };

  // ---------- Actions ----------
  const doClick = () => {
    setScore((s) => s + perClick);
    setTotalClicks((c) => c + 1);
    playClickSound();
  };

  const buyMultiplier = () => {
    if (score < multCost) return;
    setScore((s) => s - multCost);
    setMultLevel((l) => l + 1);
    setPerClick((p) => p * 2);
  };

  const buyAuto = () => {
    if (score < autoCost) return;
    setScore((s) => s - autoCost);
    setAutoCount((n) => n + 1);
  };

  const resetAll = () => setShowResetConfirm(True);
  const confirmReset = () => {
    setScore(0);
    setPerClick(1);
    setMultLevel(0);
    setAutoCount(0);
    try { localStorage.removeItem("rbc-save"); } catch {}
    setShowResetConfirm(false);
  };

  const resetTotalClicks = () => setShowResetClicksConfirm(true);
  const confirmResetTotalClicks = () => {
    setTotalClicks(0);
    try {
      const raw = localStorage.getItem("rbc-save");
      if (raw) {
        const s = JSON.parse(raw);
        s.totalClicks = 0;
        localStorage.setItem("rbc-save", JSON.stringify(s));
      }
    } catch {}
    setShowResetClicksConfirm(false);
  };

  // ---------- Little Visual Flair ----------
  const redRef = useRef(null);
  const bump = () => {
    const el = redRef.current;
    if (!el) return;
    el.animate([{ transform: "scale(1)" }, { transform: "scale(0.96)" }, { transform: "scale(1)" }], { duration: 120, easing: "ease-out" });
  };

  // ---------- UI ----------
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-sky-200 to-blue-400 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) playPunchSound();
      }}
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">🔴 Red Button Clicker</h1>
          <div className="text-sm opacity-70">Clicks earn points. Buy upgrades. Profit.</div>
        </div>

        {/* Menu Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setMenuTab("button")} className={`px-4 py-2 rounded-t-lg ${menuTab === "button" ? "bg-white shadow font-semibold" : "bg-sky-300"}`}>Button</button>
          <button onClick={() => setMenuTab("shop")} className={`px-4 py-2 rounded-t-lg ${menuTab === "shop" ? "bg-white shadow font-semibold" : "bg-sky-300"}`}>Shop</button>
          <button onClick={() => setMenuTab("audio")} className={`px-4 py-2 rounded-t-lg ${menuTab === "audio" ? "bg-white shadow font-semibold" : "bg-sky-300"}`}>Audio</button>
        </div>

        <div className="w-full rounded-b-2xl shadow bg-white p-4">
          {menuTab === "button" and (
            <div className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-4 gap-3">
                <Card label="Score" value={score} big />
                <Card label="Per Click" value={perClick} />
                <Card label="Auto-Clickers" value={`${autoCount} → ${cps} cps`} />
                <Card label="Total Clicks" value={totalClicks} />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  ref={redRef}
                  onClick={() => { doClick(); bump(); }}
                  className="px-8 py-10 rounded-3xl text-white font-extrabold shadow-lg border border-black/5 active:scale-95 transition bg-red-600 hover:bg-red-700"
                >
                  PRESS ME
                </button>

                <button
                  onClick={resetAll}
                  className="px-5 py-4 rounded-2xl font-semibold shadow border border-black/5 active:scale-95 transition bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >RESET</button>

                <button
                  onClick={resetTotalClicks}
                  className="px-5 py-4 rounded-2xl font-semibold shadow border border-black/5 active:scale-95 transition bg-yellow-400 hover:bg-yellow-500 text-black flex items-center gap-2"
                >RESET CLICKS</button>
              </div>
            </div>
          )}

          {menuTab === "shop" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <ShopItem
                name={`Multiplier (Lvl ${multLevel})`}
                desc="Doubles your per-click power (×2)."
                cost={multCost}
                afford={score >= multCost}
                onBuy={buyMultiplier}
              />
              <ShopItem
                name={`Auto-Clicker (Lvl ${autoCount})`}
                desc="Doubles your auto CPS each level (1 → 2 → 4 → 8…)."
                cost={autoCost}
                afford={score >= autoCost}
                onBuy={buyAuto}
              />
            </div>
          )}

          {menuTab === "audio" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Waveform</label>
                <select value={oscType} onChange={(e) => setOscType(e.target.value)} className="border rounded px-2 py-1">
                  <option value="sine">Sine</option>
                  <option value="square">Square</option>
                  <option value="sawtooth">Sawtooth</option>
                  <option value="triangle">Triangle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequency (Hz)</label>
                <input type="number" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="border rounded px-2 py-1 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                <input type="number" step="0.05" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="border rounded px-2 py-1 w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-4 rounded-2xl shadow p-4 bg-white text-sm">
          <div className="font-semibold mb-1">Try this with your kid:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Predict how long until you can afford the next upgrade.</li>
            <li>Change the cost formulas in code (look for <code>multScale</code> and <code>autoScale</code>) and test the difficulty.</li>
            <li>Add a new upgrade: <em>Golden Click</em> that gives a one-time +10 burst.</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showResetConfirm && (
        <ConfirmModal
          title="Reset all progress?"
          desc="This will clear score, upgrades, and auto-clickers. Your total clicks will be preserved."
          onCancel={() => setShowResetConfirm(false)}
          onConfirm={confirmReset}
          confirmColor="bg-rose-600 hover:bg-rose-700"
          confirmLabel="Yes, reset"
        />
      )}

      {showResetClicksConfirm && (
        <ConfirmModal
          title="Reset total clicks?"
          desc="This will clear your lifetime total clicks count. Other progress will be preserved."
          onCancel={() => setShowResetClicksConfirm(false)}
          onConfirm={confirmResetTotalClicks}
          confirmColor="bg-yellow-500 hover:bg-yellow-600"
          confirmLabel="Yes, reset clicks"
        />
      )}
    </div>
  );
}

function Card({ label, value, big }) {
  return (
    <div className="rounded-2xl shadow p-4 bg-white">
      <div className="text-xs uppercase opacity-60">{label}</div>
      <div className={"font-bold " + (big ? "text-3xl" : "text-xl")}>{value}</div>
    </div>
  );
}

function ShopItem({ name, desc, cost, afford, onBuy }) {
  return (
    <div className="rounded-2xl border border-black/5 shadow p-4 flex items-start justify-between gap-3">
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-sm opacity-80">{desc}</div>
        <div className="text-sm mt-1">Cost: <span className="font-mono">{cost}</span></div>
      </div>
      <button
        onClick={onBuy}
        disabled={!afford}
        className={"px-3 py-2 rounded-xl font-semibold shadow border border-black/5 active:scale-95 transition " + (afford ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed")}
      >Buy</button>
    </div>
  );
}

function ConfirmModal({ title, desc, onCancel, onConfirm, confirmColor, confirmLabel }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
        <div className="text-lg font-semibold mb-2">{title}</div>
        <p className="text-sm opacity-80 mb-4">{desc}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 rounded-xl border shadow-sm">Cancel</button>
          <button onClick={onConfirm} className={`px-3 py-2 rounded-xl text-white font-semibold shadow ${confirmColor}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
