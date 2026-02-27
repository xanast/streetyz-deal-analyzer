"use client";

import { useEffect, useMemo, useState } from "react";
import SwRegister from "./_components/SwRegister";

type Deal = {
  id: string;
  createdAt: number;
  item: string;
  notes: string;
  buy: number;
  sell: number;
  feePct: number;
  shipBuy: number;
  shipSell: number;
  misc: number;
  fee: number;
  net: number;
  roi: number;
  breakeven: number;
};

function clampNum(v: unknown) {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function money(n: number) {
  return (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
    style: "currency",
    currency: "EUR",
  });
}

function pct(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return `${x.toFixed(1)}%`;
}

function calc({
  buy,
  sell,
  feePct,
  shipBuy,
  shipSell,
  misc,
}: {
  buy: number;
  sell: number;
  feePct: number;
  shipBuy: number;
  shipSell: number;
  misc: number;
}) {
  const fee = (sell * feePct) / 100;
  const net = sell - fee - shipSell - buy - shipBuy - misc;
  const cost = buy + shipBuy + misc;
  const roi = cost > 0 ? (net / cost) * 100 : 0;

  const denom = 1 - feePct / 100;
  const breakeven = denom > 0 ? (buy + shipBuy + misc + shipSell) / denom : 0;

  return { fee, net, roi, breakeven };
}

export default function Page() {
  const [form, setForm] = useState({
    item: "Nike / Streetwear item",
    buy: "0",
    sell: "0",
    feePct: "12",
    shipBuy: "0",
    shipSell: "0",
    misc: "0",
    notes: "",
  });

  const [saved, setSaved] = useState<Deal[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("streetyz_deals_v1");
    if (raw) {
      try {
        setSaved(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("streetyz_deals_v1", JSON.stringify(saved));
  }, [saved]);

  const numbers = useMemo(() => {
    return {
      buy: clampNum(form.buy),
      sell: clampNum(form.sell),
      feePct: clampNum(form.feePct),
      shipBuy: clampNum(form.shipBuy),
      shipSell: clampNum(form.shipSell),
      misc: clampNum(form.misc),
    };
  }, [form]);

  const result = useMemo(() => calc(numbers), [numbers]);

  const verdict = useMemo(() => {
    if (result.net >= 40 && result.roi >= 15) return { label: "GOOD DEAL", tone: "good" as const };
    if (result.net >= 10 && result.roi >= 5) return { label: "OK / MAYBE", tone: "mid" as const };
    return { label: "SKIP", tone: "bad" as const };
  }, [result.net, result.roi]);

  function setField<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function saveDeal() {
    const entry: Deal = {
      id: "d_" + Date.now(),
      createdAt: Date.now(),
      item: form.item.trim() || "Untitled",
      notes: form.notes.trim(),
      ...numbers,
      ...result,
    };
    setSaved((p) => [entry, ...p]);
  }

  function removeDeal(id: string) {
    setSaved((p) => p.filter((x) => x.id !== id));
  }

  const toneClass =
    verdict.tone === "good"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : verdict.tone === "mid"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
      : "border-rose-500/40 bg-rose-500/10 text-rose-200";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <SwRegister />

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-2">
          <div className="text-sm text-zinc-400">Streetyz Tools</div>
          <h1 className="text-3xl font-semibold tracking-tight">Deal Analyzer</h1>
          <p className="text-zinc-400">
            Υπολόγισε profit / ROI / break-even πριν αγοράσεις. Κρατάει ιστορικό στο κινητό σου.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Inputs</h2>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm text-zinc-400">Item</span>
                <input
                  className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-zinc-600"
                  value={form.item}
                  onChange={(e) => setField("item", e.target.value)}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm text-zinc-400">Buy price (€)</span>
                  <input
                    inputMode="decimal"
                    className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-zinc-600"
                    value={form.buy}
                    onChange={(e) => setField("buy", e.target.value)}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-zinc-400">Sell price (€)</span>
                  <input
                    inputMode="decimal"
                    className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-zinc-600"
                    value={form.sell}
                    onChange={(e) => setField("sell", e.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm text-zinc-400">Fee (%)</span>
                  <input
                    inputMode="decimal"
                    className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-zinc-600"
                    value={form.feePct}
                    onChange={(e) => setField("feePct", e.target.value)}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-zinc-400">Ship (buy)</span>
                  <input
                    inputMode="decimal"
                    className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-zinc-600"
                    value={form.shipBuy}
                    onChange={(e) => setField("shipBuy", e.target.value)}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-zinc-400">Ship (sell)</span>
                  <input
                    inputMode="decimal"
                    className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-zinc-600"
                    value={form.shipSell}
                    onChange={(e) => setField("shipSell", e.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm text-zinc-400">Misc costs</span>
                  <input
                    inputMode="decimal"
                    className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-zinc-600"
                    value={form.misc}
                    onChange={(e) => setField("misc", e.target.value)}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm text-zinc-400">Notes</span>
                  <input
                    className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 outline-none focus:border-zinc-600"
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  onClick={saveDeal}
                  className="rounded-xl bg-zinc-100 px-4 py-3 font-semibold text-zinc-950 hover:bg-white"
                >
                  Save deal
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">Result</h2>
              <div className={`rounded-xl border px-3 py-2 text-sm font-semibold ${toneClass}`}>
                {verdict.label}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="text-sm text-zinc-400">Marketplace fee</div>
                <div className="mt-1 text-2xl font-semibold">{money(result.fee)}</div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="text-sm text-zinc-400">Net profit</div>
                <div className="mt-1 text-2xl font-semibold">{money(result.net)}</div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="text-sm text-zinc-400">ROI</div>
                <div className="mt-1 text-2xl font-semibold">{pct(result.roi)}</div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="text-sm text-zinc-400">Break-even sell price</div>
                <div className="mt-1 text-2xl font-semibold">{money(result.breakeven)}</div>
              </div>
            </div>

            <h3 className="mt-6 text-sm font-semibold text-zinc-300">Saved deals</h3>
            <div className="mt-3 grid gap-3">
              {saved.length === 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-sm text-zinc-400">
                  Δεν έχεις αποθηκεύσει ακόμα deal.
                </div>
              )}

              {saved.slice(0, 8).map((d) => (
                <div key={d.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{d.item}</div>
                      <div className="mt-1 text-xs text-zinc-400">
                        {new Date(d.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDeal(d.id)}
                      className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-500"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div className="text-zinc-300">
                      Net: <span className="font-semibold">{money(d.net)}</span>
                    </div>
                    <div className="text-zinc-300">
                      ROI: <span className="font-semibold">{pct(d.roi)}</span>
                    </div>
                    <div className="text-zinc-300">
                      BE: <span className="font-semibold">{money(d.breakeven)}</span>
                    </div>
                  </div>

                  {d.notes ? <div className="mt-2 text-xs text-zinc-400">Notes: {d.notes}</div> : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 text-xs text-zinc-500">
          iPhone: άνοιξε από Safari → Share → Add to Home Screen.
        </div>
      </div>
    </main>
  );
}