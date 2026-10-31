"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PriceChart } from "@/components/PriceChart";
import { StockTable, type Row } from "@/components/StockTable";
import { PageTitle, Stat, Unavailable, UpdatedAt } from "@/components/ui";
import { colorFor, compact, idr, pct } from "@/lib/format";

const RANGES = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];

export default function Home() {
  const [ov, setOv] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [range, setRange] = useState("3M");
  const [hist, setHist] = useState<any>(null);
  const [histErr, setHistErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/market/overview");
    const j = await r.json();
    if (!r.ok) { setErr(j.error || "Gagal memuat"); return; }
    setErr(null); setOv(j);
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 60_000); return () => clearInterval(t); }, [load]);

  useEffect(() => {
    setHist(null); setHistErr(null);
    fetch(`/api/market/history?symbol=IHSG&range=${range}`).then(async (r) => {
      const j = await r.json();
      if (!r.ok) setHistErr(j.error || "Data tidak tersedia"); else setHist(j);
    }).catch(() => setHistErr("Gagal terhubung"));
  }, [range]);

  const ihsg = ov?.ihsg;
  const top = (ov?.stocks || []) as (Row & { trendScore: number })[];
  const gainers = [...top].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...top].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard Pasar" sub="Pemantauan saham Bursa Efek Indonesia — data dari API provider, tanpa angka acak." />

      {err && <Unavailable message={err} />}
      {ov?.ihsgError && <Unavailable message={`IHSG: ${ov.ihsgError}`} />}
      {ov?.empty && (
        <div className="card text-sm text-slate-300">
          Belum ada data harga tersimpan. Admin: jalankan <code className="rounded bg-black/40 px-1">/api/cron/refresh</code> setelah API key diisi (lihat README).
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card col-span-2 shadow-glow">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">IHSG</div>
          <div className="mt-1 flex items-end gap-3">
            <span className="font-mono text-3xl font-extrabold text-white md:text-4xl">{ihsg ? idr(ihsg.price) : "—"}</span>
            {ihsg && <span className={`pb-1 font-mono text-lg font-bold ${colorFor(ihsg.changePercent)}`}>{pct(ihsg.changePercent)} <span className="text-sm">({ihsg.change > 0 ? "+" : ""}{idr(ihsg.change)})</span></span>}
          </div>
          {ihsg && <div className="mt-2"><UpdatedAt iso={ihsg.sourceTime ?? ihsg.fetchedAt} provider={ihsg.provider} status={ihsg.status} /></div>}
        </div>
        <Stat label="Saham Naik" value={ov ? ov.breadth.up : "—"} tone="text-neon" sub={`dari ${ov?.breadth.tracked ?? 0} saham terpantau`} />
        <Stat label="Saham Turun" value={ov ? ov.breadth.down : "—"} tone="text-loss" sub={`Stagnan: ${ov?.breadth.flat ?? "—"}`} />
        <Stat label="Volume (terpantau)" value={ov ? compact(ov.totals.volume) : "—"} sub="lembar" />
        <Stat label="Nilai (terpantau)" value={ov ? "Rp " + compact(ov.totals.value) : "—"} sub="estimasi volume × harga" />
        <Stat label="Terakhir diperbarui" value={<span className="text-base">{ov?.lastUpdated ? new Date(ov.lastUpdated).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) : "—"}</span>} sub="WIB, refresh otomatis 60 dtk" />
      </section>

      <section className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-white">Pergerakan IHSG</h2>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${range === r ? "bg-electric text-white" : "text-slate-400 hover:bg-white/5"}`}>{r}</button>
            ))}
          </div>
        </div>
        {histErr ? <Unavailable message={histErr} /> : !hist ? <div className="h-[320px] animate-pulse rounded-xl bg-white/5" /> : (
          <>
            <PriceChart candles={hist.candles} mode="line" height={320} />
            <p className="mt-2 text-[11px] text-slate-500">Data historis harian • candle terakhir {hist.lastCandleDate}. {hist.note}</p>
          </>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-0">
          <div className="flex items-center justify-between px-4 pt-4"><h2 className="font-bold text-neon">Top Gainers</h2><Link href="/trending" className="text-xs text-electric">Lihat semua →</Link></div>
          <StockTable rows={gainers} />
        </div>
        <div className="card p-0">
          <div className="flex items-center justify-between px-4 pt-4"><h2 className="font-bold text-loss">Top Losers</h2><Link href="/trending" className="text-xs text-electric">Lihat semua →</Link></div>
          <StockTable rows={losers} />
        </div>
      </section>
    </div>
  );
}
