import { Suspense } from "react";
import { CitySearch } from "@/app/_components/CitySearch";
import { ForecastSection, Hero } from "@/app/_components/ForecastSection";
import { ForecastSkeleton } from "@/app/_components/ForecastSkeleton";
import { ThemeIndicator } from "@/app/_components/ThemeIndicator";
import { strings } from "@/lib/i18n";

/**
 * Static shell (header, search, footer) with the URL-dependent parts streamed in (design D-2).
 * The Suspense boundaries are not keyed by place: a new place keeps the old forecast on screen
 * until the new one is ready (FR-FORECAST-05).
 */
export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-(--z-header) bg-scrim">
        <div className="mx-auto flex max-w-page items-center justify-between px-4 py-3 lg:px-6">
          <span className="heading text-ink">{strings.appName}</span>
          <ThemeIndicator />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-page flex-1 flex-col gap-8 px-4 py-8 lg:px-6 lg:py-12">
        <Suspense fallback={null}>
          <Hero searchParams={searchParams} />
        </Suspense>
        {/* Own stacking context below the sticky header (z-header), above the forecast. */}
        <div className="relative z-10">
          <CitySearch />
        </div>
        <Suspense fallback={<ForecastSkeleton />}>
          <ForecastSection searchParams={searchParams} />
        </Suspense>
      </main>
      <footer className="mx-auto w-full max-w-page px-4 py-6 lg:px-6">
        <p className="caption text-ink-subtle">
          {strings.credits.dataLabel}{" "}
          <a className="underline underline-offset-2 hover:text-ink" href="https://open-meteo.com/">
            {strings.credits.openMeteo}
          </a>{" "}
          · {strings.credits.mapLabel} {strings.credits.copyright}{" "}
          <a className="underline underline-offset-2 hover:text-ink" href="https://www.openstreetmap.org/copyright">
            {strings.credits.osm}
          </a>
        </p>
      </footer>
    </>
  );
}
