# AI Planer — MVP Design (60-min hackathon)

**Date:** 2026-06-06
**Status:** Approved scope, ready for plan
**Timebox:** ~60 хв до закриття хакатону

## 1. Призначення

Mobile-first веб-апа: користувач голосом виливає "усе з голови", AI перетворює це на структуровані задачі (priority + час + дедлайн + reminder) і складає план на сьогодні. Деплой — Vercel.

## 2. Скоуп (жорстко)

**У скоупі:**

1. Один екран з табами **Сьогодні / Усі** + chip-фільтром проектів зверху + FAB-мікрофон знизу.
2. Fullscreen recording (Web Speech API, `uk-UA`) → текст у textarea, який юзер може поправити перед відправкою.
3. Endpoint `POST /api/parse` → Claude (`claude-sonnet-4-6`) → JSON-масив задач → auto-add у localStorage.
4. Inline-редагування задачі (tap → expand → edit fields, включно з `project`).
5. Reminder: поле `reminderAt`. При відкритті апи перевіряємо tasks, де `reminderAt <= now < deadline` і `done=false` → toast-банер ("Скоро дедлайн: …"). Бонус — `Notification` API, якщо `permission === 'granted'`.
6. Mobile-first UI: великі тач-таргети (≥48px), ввід однією рукою, FAB у нижній половині екрана.
7. Текстове fallback-поле для введення (якщо мікрофон недоступний або не дозволений).
8. Deploy на Vercel (production URL).
9. **Проекти**: легке поле `project?: string` на задачі. AI може автоматично проставити проект з контексту dump'а; юзер може поправити в edit-mode. Список проектів — це просто унікальні значення з усіх задач (без окремого CRUD сторінки). Header'і chip-фільтр: "Усі / <project1> / <project2> / …".
10. **Формат дати**: внутрішньо `YYYY-MM-DD` (ISO), у UI показуємо `DD.MM.YYYY` (наприклад, `06.06.2026`). Один хелпер `formatDate(iso)` робить трансформацію.

**Поза скоупом (свідомо):** auth, серверне сховище, undo, темна тема, swipe-actions, теги (крім одного поля `project`), drag-reorder, окремий CRUD проектів (створюються неявно), PWA / service worker, push-notifications, історія dump'ів, нотатки до задач, повторювані задачі, sub-tasks, time-blocking, анімації понад базові.

## 3. Архітектура

**Стек:** Next.js 16 (App Router, breaking-changes версія — читати `node_modules/next/dist/docs/` перед кодом), React 19, TypeScript, Tailwind v4.

**Топологія:**

- Клієнт (browser) — все state-management через React + `useSyncExternalStore` поверх localStorage. UI повністю клієнтський.
- Сервер — один Route Handler `/api/parse` (server-only, тримає `ANTHROPIC_API_KEY`).
- Сховище — `window.localStorage` під ключем `ai-planer:tasks` (масив `Task`) і `ai-planer:meta` (наприклад, `lastDumpAt`).
- AI — один виклик Claude через офіційний SDK `@anthropic-ai/sdk`. Один промпт, один ключ, один модель.

**Чому така архітектура:** мінімум поверхонь для коду, нульова інфраструктура крім Vercel, нульова робота з аутентифікацією, фокус на двох AI-дотиках.

## 4. Модель даних

```ts
type Priority = 'low' | 'medium' | 'high';

type Task = {
  id: string;            // crypto.randomUUID()
  title: string;
  priority: Priority;
  estimateMin: number;   // оцінка часу у хвилинах
  deadline: string;      // ISO date string YYYY-MM-DD (день, без часу)
  reminderAt?: string;   // ISO datetime UTC; якщо немає — UI рахує (deadline 09:00 локально) - 1h
  done: boolean;
  createdAt: string;     // ISO datetime
  pinnedToToday?: boolean; // ручне закріплення з беклогу
  project?: string;      // довільна назва проекту, напр. "Робота", "AI Planer"
};

// Хелпер для UI: ISO "2026-06-06" → "06.06.2026"
function formatDate(iso: string): string;

```

**Today-логіка (чиста функція):**

```
isToday(task) =
   !task.done &&
   (task.pinnedToToday
    || task.deadline <= endOfToday()
    || isOverdue(task))
```

## 5. UI / Екрани

**Головний екран** (`/`)

- Header: назва, тогл `Сьогодні | Усі` (segmented control).
- Під header'ом — горизонтальний скрол chip-ів проектів: `[Усі] [Робота] [Особисте] …`. Активний chip фільтрує список.
- Список: картки задач (title, priority pill, ⏱ estimate, 📅 deadline у форматі `DD.MM.YYYY`, мітка проекту, чекбокс).
- Toast-банер зверху, якщо є active reminders.
- FAB ⊕🎤 — fixed-bottom-right, 64px, відкриває mic-screen.
- Empty state з лагідним копірайтом: "Тапни мікрофон і вивали все, що в голові."

**Mic-screen** (fullscreen overlay)

- Велика кнопка-мікрофон по центру, пульсація під час запису.
- Live transcript внизу (textarea, видно як набирається).
- Дві дії: ✕ скасувати / ✓ відправити на парсинг.
- Якщо мікрофон/SpeechRecognition недоступний → одразу показуємо textarea з кнопкою "Парсити".

**Edit-mode задачі**

- Tap по картці → expand inline: змінити title, priority (segmented), estimateMin (number), deadline (date input), reminderAt (datetime).
- Кнопка "Видалити" внизу.

## 6. Контракт `/api/parse`

**Request:**
```json
{ "text": "<повний транскрипт>", "today": "2026-06-06", "knownProjects": ["Робота", "AI Planer"] }
```

**Response:**
```json
{ "tasks": [ { "title": "...", "priority": "high", "estimateMin": 30, "deadline": "2026-06-06", "reminderAt": "2026-06-06T08:00:00Z", "project": "Робота" } ] }
```

**Системний промпт (скелет):**

> Ти — асистент-планувальник. На вхід — український "потік свідомості". Витягни **тільки дії**, які потребують виконання. Не вигадуй. Якщо щось не дія — пропускай. Поверни строгий JSON: `{ "tasks": [ ... ] }`. Поля кожної задачі: `title` (коротко, дієсловом), `priority` (low/medium/high), `estimateMin` (int 5..240), `deadline` (ISO date YYYY-MM-DD, відносно `today`), `reminderAt` (ISO datetime, опціонально), `project` (рядок або null — обери з `knownProjects` якщо підходить, інакше запропонуй нову коротку назву, або null). Краще менше якісних задач, ніж багато з шумом.

Викликати з `response_format: json` (або через tool-use з strict-schema). Server валідує через `zod`; помилки — `400` з повідомленням, фронт показує toast.

## 7. Помилки

- Web Speech API недоступний → одразу показати textarea, заховати кнопку мікрофона.
- Permission denied на мікрофон → toast "Дозволь мікрофон у налаштуваннях".
- `/api/parse` 5xx або таймаут (>20с) → toast "Не вдалось розпарсити, спробуй ще". Транскрипт зберігається у textarea, щоб не втратити.
- Невалідний JSON від Claude → ретрай 1 раз; якщо знов — повідомити.
- localStorage переповнений / недоступний (приватний режим Safari) → in-memory fallback, попередити юзера, що дані не збережуться.

## 8. Тестування (мінімум, бо 60 хв)

- Manual smoke: записати голосом 3 задачі → перевірити, що з'явились коректно.
- Manual: deadline у минулому → бачимо у "Сьогодні".
- Manual: відкрити в iPhone Safari (responsive devtools) — кнопки тапаються, mic screen fullscreen.
- Type-check: `npm run lint && tsc --noEmit`.

## 9. Деплой

- Vercel CLI або через GitHub-інтеграцію.
- Env: `ANTHROPIC_API_KEY` (server-only, без `NEXT_PUBLIC_`).
- Перевірити: production URL відкривається, mic працює на mobile (HTTPS обов'язково — Vercel дає).

## 10. Послідовність робіт (для plan)

1. Setup `.env.local` + Anthropic SDK.
2. Storage helpers (localStorage CRUD + Zod-схема Task).
3. `/api/parse` Route Handler + промпт + валідація.
4. UI shell: Header, табы, FAB.
5. TaskList + TaskCard + inline edit.
6. MicScreen + Web Speech API hook + textarea fallback.
7. End-to-end wiring: mic → /api/parse → setState → localStorage.
8. Reminder check on mount + toast.
9. Mobile polish: viewport meta, safe-area, тач-таргети.
10. Deploy на Vercel + smoke на телефоні.
