import Stage from "@/components/Stage";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Ziggy&apos;s Day</h1>
        <p className="text-sm text-stone-400">
          Angie and Rob decide how to spend the day with Ziggy, who reacts to every idea. Press Start, then Next or Space.
        </p>
      </header>
      <Stage />
    </main>
  );
}
