/**
 * Интерактивная авторизация в Telegram User API.
 *
 * Запуск:
 *   bun run scripts/telegram-login.ts
 *
 * Шаги:
 *  1. Получи api_id и api_hash на https://my.telegram.org → API development tools
 *  2. Заполни .env:
 *       TELEGRAM_API_ID=<твой api_id>
 *       TELEGRAM_API_HASH=<твой api_hash>
 *  3. Запусти этот скрипт — он спросит номер телефона, код из SMS/Telegram, (опц.) 2FA пароль
 *  4. Скопируй выведенную SESSION строку в .env:
 *       TELEGRAM_SESSION=<длинная строка>
 *  5. Перезапусти приложение
 *
 * После этого worker сможет читать любые каналы, где состоит твой аккаунт.
 */

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import * as readline from "readline";
import * as dotenv from "dotenv";

dotenv.config({ path: "/home/z/my-project/.env" });

const apiIdStr = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const existingSession = process.env.TELEGRAM_SESSION;

if (!apiIdStr || !apiHash) {
  console.error("\n❌ TELEGRAM_API_ID или TELEGRAM_API_HASH не заданы в .env");
  console.log("\nШаги:");
  console.log("  1. Перейди на https://my.telegram.org");
  console.log("  2. Войди по номеру телефона");
  console.log("  3. Выбери 'API development tools'");
  console.log("  4. Создай новое приложение (любые значения)");
  console.log("  5. Скопируй app api_id и app api_hash");
  console.log("  6. Заполни .env: TELEGRAM_API_ID=<id> TELEGRAM_API_HASH=<hash>");
  console.log("  7. Запусти этот скрипт снова\n");
  process.exit(1);
}

const apiId = parseInt(apiIdStr, 10);

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\n🔐 Авторизация в Telegram User API\n");

  const session = new StringSession(existingSession || "");
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    useWSS: true,
  });

  // Готовый промпт для ввода телефона
  await client.start({
    phoneNumber: async () => ask("📞 Введи номер телефона (формат: +79991234567): "),
    password: async () => ask("🔑 Введи 2FA пароль (если включён, иначе нажми Enter): "),
    phoneCode: async () => ask("📲 Введи код из Telegram/SMS (например, 12345): "),
    onError: (err) => console.error("Ошибка:", err.message),
  });

  console.log("\n✅ Авторизация успешна!\n");
  const me = await client.getMe();
  console.log(`Аккаунт: ${(me as any).firstName} ${((me as any).lastName || "")}`.trim());
  console.log(`Username: ${(me as any).username || "(нет)"}`);
  console.log(`ID: ${(me as any).id}`);

  const sessionString = (client.session as StringSession).save();
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("🎯 СКОПИРУЙ ЭТУ СТРОКУ И ВСТАВЬ В .env КАК TELEGRAM_SESSION:");
  console.log("═══════════════════════════════════════════════════════════════\n");
  console.log(sessionString);
  console.log("\n═══════════════════════════════════════════════════════════════\n");

  console.log("После вставки в .env перезапусти приложение (Ctrl+C → bun run dev).");

  // Тест: попробуем получить последние 5 сообщений из канала cryptoalr
  const channel = process.env.TELEGRAM_CHANNEL || "cryptoalr";
  console.log(`\n📡 Тест: читаю последние 5 сообщений из @${channel}...`);
  try {
    const entity = await client.getEntity(channel);
    const messages = await client.getMessages(entity, { limit: 5 });
    console.log(`\nНайдено ${messages.length} сообщений:`);
    for (const m of messages) {
      const text = (m as any).message || "(без текста)";
      const preview = text.slice(0, 100).replace(/\n/g, " ");
      console.log(`  [${(m as any).id}] ${preview}${text.length > 100 ? "..." : ""}`);
    }
  } catch (e: any) {
    console.error(`Не удалось прочитать канал @${channel}:`, e.message);
    console.log("Убедись, что ты подписан на канал и username указан верно.");
  }

  await client.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error("Критическая ошибка:", e);
  process.exit(1);
});
