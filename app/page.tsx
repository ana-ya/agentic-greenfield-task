import { strings } from "@/lib/strings";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-(--z-header) bg-scrim">
        <div className="mx-auto flex max-w-page items-center px-4 py-3 lg:px-6">
          <span className="heading text-ink">{strings.appName}</span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-page flex-1 flex-col items-center px-4 py-12 lg:px-6 lg:pt-16">
        <h1 className="display text-center text-ink">{strings.hero}</h1>
        <p className="mt-3 text-center text-ink-muted">{strings.tagline}</p>
      </main>
      <footer className="mx-auto w-full max-w-page px-4 py-6 lg:px-6">
        <p className="caption text-ink-subtle">{strings.credits}</p>
      </footer>
    </>
  );
}
