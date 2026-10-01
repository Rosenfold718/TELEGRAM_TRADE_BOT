"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { Settings } from "@/lib/types";
import { useApi } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings2, Save, RotateCcw } from "lucide-react";

export function SettingsPanel() {
  const { data: settings, loading, refetch } = useApi<Settings>("/api/settings", {});
  const [local, setLocal] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setLocal(settings);
  }, [settings]);

  if (loading && !settings) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const value = local || settings!;

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Failed");
      }
      await refetch();
      toast.success("Настройки сохранены");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (settings) setLocal(settings);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Настройки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="leverage" className="text-xs">Кредитное плечо</Label>
            <Badge variant="outline" className="tabular-nums">{value.leverage}x</Badge>
          </div>
          <Slider
            id="leverage"
            value={[value.leverage]}
            min={1}
            max={125}
            step={1}
            onValueChange={(v) => setLocal({ ...value, leverage: v[0] })}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1x</span>
            <span>125x</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="positionSize" className="text-xs">Размер позиции (% от баланса)</Label>
            <Badge variant="outline" className="tabular-nums">{value.positionSizePct}%</Badge>
          </div>
          <Slider
            id="positionSize"
            value={[value.positionSizePct]}
            min={0.5}
            max={50}
            step={0.5}
            onValueChange={(v) => setLocal({ ...value, positionSizePct: v[0] })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="tp" className="text-xs">Take Profit %</Label>
            <Input
              id="tp"
              type="number"
              step="0.1"
              value={value.takeProfitPct}
              onChange={(e) => setLocal({ ...value, takeProfitPct: parseFloat(e.target.value) || 0 })}
              className="tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor="sl" className="text-xs">Stop Loss %</Label>
            <Input
              id="sl"
              type="number"
              step="0.1"
              value={value.stopLossPct}
              onChange={(e) => setLocal({ ...value, stopLossPct: parseFloat(e.target.value) || 0 })}
              className="tabular-nums"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="channel" className="text-xs">Telegram канал (username без @)</Label>
          <Input
            id="channel"
            value={value.telegramChannel}
            onChange={(e) => setLocal({ ...value, telegramChannel: e.target.value })}
            placeholder="cryptoalr"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="poll" className="text-xs">Poll interval (sec)</Label>
            <Input
              id="poll"
              type="number"
              min={5}
              max={3600}
              value={value.pollIntervalSec}
              onChange={(e) => setLocal({ ...value, pollIntervalSec: parseInt(e.target.value) || 5 })}
              className="tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor="check" className="text-xs">Check interval (sec)</Label>
            <Input
              id="check"
              type="number"
              min={2}
              max={600}
              value={value.checkIntervalSec}
              onChange={(e) => setLocal({ ...value, checkIntervalSec: parseInt(e.target.value) || 2 })}
              className="tabular-nums"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <Label htmlFor="tradingEnabled" className="text-sm font-medium">Торговля включена</Label>
            <p className="text-[11px] text-muted-foreground">
              OFF = только мониторинг сигналов
            </p>
          </div>
          <Switch
            id="tradingEnabled"
            checked={value.tradingEnabled}
            onCheckedChange={(v) => setLocal({ ...value, tradingEnabled: v })}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={save} disabled={saving} size="sm" className="flex-1">
            <Save className="h-3.5 w-3.5 mr-1" />
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
