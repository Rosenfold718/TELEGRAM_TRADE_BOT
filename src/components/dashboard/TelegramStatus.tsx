"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Radio, RefreshCw, ExternalLink } from "lucide-react";

interface TelegramStatusResponse {
  method: "mtproto" | "scrape";
  configured: boolean;
  connection: {
    ok: boolean;
    configured: boolean;
    method: string;
    me?: { id: string; firstName: string; username?: string };
    message?: string;
    error?: string;
  };
  testChannel: string;
  messagesCount: number | null;
  sampleMessage: string | null;
  fetchError: string | null;
}

export function TelegramStatus() {
  const { data, loading, refetch } = useApi<TelegramStatusResponse>("/api/telegram/status", {});
  const [testing, setTesting] = useState(false);

  const runFetchTest = async () => {
    setTesting(true);
    try {
      const res = await fetch(`/api/telegram/status?fetch=true`);
      const json = await res.json();
      if (json.fetchError) {
        toast.error(`Ошибка: ${json.fetchError}`);
      } else if (json.messagesCount === 0) {
        toast.info("Сообщений не найдено. Возможно, канал пустой или нет доступа.");
      } else if (json.messagesCount) {
        toast.success(`Получено ${json.messagesCount} сообщений из @${json.testChannel}`);
      }
      refetch();
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

  const method = data?.method || "mtproto";
  const configured = data?.configured || false;
  const connection = data?.connection;
  const isOk = connection?.ok && (method === "scrape" || configured);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Radio className="h-4 w-4" />
          Telegram
          {isOk ? (
            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-600/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> OK
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-600/30">
              <XCircle className="h-3 w-3 mr-1" /> Требует настройки
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Метод:</span>
          <span className="font-mono">{method === "mtproto" ? "MTProto (User API)" : "Web scraping"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Канал:</span>
          <span className="font-mono">@{data?.testChannel || "cryptoalr"}</span>
        </div>
        {method === "mtproto" && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">API ключи:</span>
            {configured ? (
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-600/30">
                настроены
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-600/30">
                не настроены
              </Badge>
            )}
          </div>
        )}
        {connection?.me && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Аккаунт:</span>
            <span className="font-mono">
              {connection.me.firstName}
              {connection.me.username && ` (@${connection.me.username})`}
            </span>
          </div>
        )}
        {connection?.error && (
          <Alert className="border-red-500/20 bg-red-500/5 py-2">
            <AlertTitle className="text-xs text-red-700">Ошибка</AlertTitle>
            <AlertDescription className="text-[11px] text-red-700/80">
              {connection.error}
            </AlertDescription>
          </Alert>
        )}

        {method === "mtproto" && !configured && (
          <Alert className="border-amber-600/20 bg-amber-500/5 py-2">
            <AlertTitle className="text-xs text-amber-700">⚠️ MTProto не настроен</AlertTitle>
            <AlertDescription className="text-[11px] text-amber-700/80 space-y-2">
              <p>Чтобы читать канал @cryptoalr:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Получи <code className="font-mono bg-amber-500/10 px-1 rounded">api_id</code> и{" "}
                  <code className="font-mono bg-amber-500/10 px-1 rounded">api_hash</code> на{" "}
                  <a
                    href="https://my.telegram.org"
                    target="_blank"
                    rel="noreferrer"
                    className="underline inline-flex items-center gap-0.5"
                  >
                    my.telegram.org <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </li>
                <li>
                  Добавь их в <code className="font-mono bg-amber-500/10 px-1 rounded">.env</code>:
                  <pre className="font-mono text-[10px] bg-muted/50 p-1.5 rounded mt-1 overflow-x-auto">
{`TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abc123...
TELEGRAM_METHOD=mtproto`}
                  </pre>
                </li>
                <li>
                  Запусти в терминале:
                  <pre className="font-mono text-[10px] bg-muted/50 p-1.5 rounded mt-1 overflow-x-auto">
                    bun run scripts/telegram-login.ts
                  </pre>
                </li>
                <li>
                  Введи номер телефона, код из Telegram/SMS, (опц.) 2FA пароль
                </li>
                <li>
                  Скопируй выведенную строку в{" "}
                  <code className="font-mono bg-amber-500/10 px-1 rounded">.env</code>:
                  <pre className="font-mono text-[10px] bg-muted/50 p-1.5 rounded mt-1 overflow-x-auto">
{`TELEGRAM_SESSION=...`}
                  </pre>
                </li>
                <li>
                  Перезапусти приложение и нажми «Тест» ниже
                </li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {data?.fetchError && (
          <Alert className="border-red-500/20 bg-red-500/5 py-2">
            <AlertTitle className="text-xs text-red-700">Ошибка чтения</AlertTitle>
            <AlertDescription className="text-[11px] text-red-700/80 line-clamp-3">
              {data.fetchError}
            </AlertDescription>
          </Alert>
        )}

        {data?.messagesCount !== null && data?.messagesCount !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Прочитано сообщений:</span>
            <span className="font-mono">{data.messagesCount}</span>
          </div>
        )}

        {data?.sampleMessage && (
          <div className="border rounded p-2 bg-muted/30">
            <p className="text-[10px] text-muted-foreground mb-1">Последнее сообщение:</p>
            <p className="text-[11px] line-clamp-3">{data.sampleMessage}</p>
          </div>
        )}

        <Button
          onClick={runFetchTest}
          disabled={testing}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${testing ? "animate-spin" : ""}`} />
          {testing ? "Тест..." : "Тест: прочитать 5 сообщений"}
        </Button>
      </CardContent>
    </Card>
  );
}
