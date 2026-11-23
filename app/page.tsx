import Stage from "@/components/Stage";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Ziggy&apos;s Day</h1>
        <p className="text-sm text-stone-400">
          Three agents argue about one dog&apos;s day. Press Next, Space or the right arrow.
        </p>
      </header>
      <Stage />
    </main>
  );
}
