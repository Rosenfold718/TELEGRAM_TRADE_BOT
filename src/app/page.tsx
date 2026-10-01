"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PnLChart } from "@/components/dashboard/PnLChart";
import { WinLossChart } from "@/components/dashboard/WinLossChart";
import { TradesTable } from "@/components/dashboard/TradesTable";
import { SignalsList } from "@/components/dashboard/SignalsList";
import { WorkerControls } from "@/components/dashboard/WorkerControls";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { KillSwitch } from "@/components/dashboard/KillSwitch";
import { LogsPanel } from "@/components/dashboard/LogsPanel";
import { InfoBanner } from "@/components/dashboard/InfoBanner";
import { TelegramStatus } from "@/components/dashboard/TelegramStatus";
import { Bot, Zap } from "lucide-react";

export default function Home() {
  // Регистрация Service Worker для push уведомлений
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((r) => console.log("[SW] registered:", r.scope))
        .catch((e) => console.warn("[SW] failed:", e));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 blur-md opacity-30 rounded-full" />
              <Bot className="relative h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight">Crypto Signals Trader</h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Binance Futures · Telegram signals · @cryptoalr
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3 text-amber-500" />
              <span className="text-muted-foreground hidden sm:inline">USDT-M Futures</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        <InfoBanner />

        {/* Top row: balance + worker + kill switch + settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BalanceCard />
          <StatsCard />
          <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <WorkerControls />
            <KillSwitch />
          </div>
        </div>

        {/* Middle row: charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PnLChart />
          <WinLossChart />
        </div>

        {/* Main dashboard: trades + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TradesTable />
          </div>
          <div className="space-y-4">
            <TelegramStatus />
            <SignalsList />
            <SettingsPanel />
            <LogsPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 text-center text-xs text-muted-foreground">
          Crypto Signals Trader · Личное приложение для трейдинга на Binance Futures ·{" "}
          <a
            href="https://t.me/cryptoalr"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground underline underline-offset-2"
          >
            @cryptoalr
          </a>
        </div>
      </footer>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
