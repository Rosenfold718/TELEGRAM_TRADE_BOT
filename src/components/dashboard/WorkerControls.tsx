"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkerStatus } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { useAppStore } from "@/stores/app-store";
import { Play, Square, Activity, AlertTriangle, Radio, Bell, FlaskConical } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function WorkerControls() {
  const { data, loading, refetch } = useApi<WorkerStatus>("/api/worker", { intervalMs: 3000 });
  const { workerRunning, setWorkerRunning } = useAppStore();
  const [toggling, setToggling] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPerm(Notification.permission);
    } else {
      setNotifPerm("unsupported");
    }
  }, []);

  useEffect(() => {
    if (data) setWorkerRunning(data.running);
  }, [data, setWorkerRunning]);

  const toggleWorker = async () => {
    setToggling(true);
    try {
      const action = workerRunning ? "stop" : "start";
      await fetch("/api/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await refetch();
    } finally {
      setToggling(false);
    }
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
  };

  const runTestSignal = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/test-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: "USUSDT" }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(`Test signal failed: ${json.error}`);
      } else if (json.message?.includes("trading is disabled")) {
        toast.info("Сигнал сохранён, но торговля выключена — включи её в настройках");
      } else {
        toast.success(`Сделка открыта для ${json.trade?.symbol || "test"}`);
      }
      // Отправим пуш-уведомление
      if (notifPerm === "granted" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("🔔 Test Signal", {
          body: `Signal detected: ${json.signal?.symbol || "USUSDT"}`,
          icon: "/logo.svg",
          tag: "test-signal",
        });
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const running = data?.running || false;
  const lastPoll = data?.lastPollAt ? new Date(data.lastPollAt).toLocaleTimeString() : "—";
  const lastSignal = data?.lastSignalAt ? formatRelative(data.lastSignalAt) : "—";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Worker
          {running ? (
            <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-600/20">
              <span className="relative flex h-1.5 w-1.5 mr-1">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                <span className="relative rounded-full bg-emerald-500 h-1.5 w-1.5" />
              </span>
              RUNNING
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">STOPPED</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={toggleWorker}
            disabled={toggling}
            variant={running ? "destructive" : "default"}
            size="sm"
            className="flex-1"
          >
            {running ? <Square className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
            {toggling ? "..." : running ? "Stop" : "Start"}
          </Button>

          {notifPerm === "default" && (
            <Button onClick={requestNotifications} variant="outline" size="sm">
              <Bell className="h-3.5 w-3.5 mr-1" />
              Push
            </Button>
          )}
          {notifPerm === "granted" && (
            <Badge variant="outline" className="text-xs flex items-center">
              <Bell className="h-3 w-3 mr-1" /> Push on
            </Badge>
          )}
          {notifPerm === "denied" && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Push off
            </Badge>
          )}
        </div>

        <Button
          onClick={runTestSignal}
          disabled={testing}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
          {testing ? "Тест..." : "Тестовый сигнал (USUSDT)"}
        </Button>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Radio className="h-3 w-3" /> Last poll:
            </span>
            <span className="tabular-nums font-mono">{lastPoll}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last signal:</span>
            <span>{lastSignal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Detected:</span>
            <span className="tabular-nums">{data?.totalSignalsDetected || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trades executed:</span>
            <span className="tabular-nums">{data?.totalTradesExecuted || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Errors:</span>
            <span className={`tabular-nums ${(data?.totalErrors || 0) > 0 ? "text-red-600" : ""}`}>
              {data?.totalErrors || 0}
            </span>
          </div>
        </div>

        {data?.lastPollStatus === "error" && data.lastPollMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2 text-xs text-red-700 flex items-start gap-1.5">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{data.lastPollMessage}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600_000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleString();
}
