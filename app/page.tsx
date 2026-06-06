export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 px-6 py-12 dark:from-zinc-950 dark:to-black">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-3xl text-white shadow-lg dark:bg-white dark:text-black">
          🐵
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
          AI Planer
        </h1>
        <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Голосовий brain dump → структурований план дня.
        </p>
        <span className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-black">
          Phase 0 · Live · autodeploy OK
        </span>
      </div>
    </main>
  );
}
