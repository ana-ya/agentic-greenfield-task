import { getForecast } from "@/app/_data/open-meteo";
import { DayCard, Notice, WeekendHighlight } from "@/components/design-system";
import type { Forecast } from "@/lib/forecast/types";
import { strings } from "@/lib/i18n";
import { parseLocation } from "@/lib/location";
import { comfortScore } from "@/lib/scoring/comfort";
import { upcomingWeekend, weekendSummary } from "@/lib/weekend";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Hero question, only while no place is active (FR-SHELL-03). */
export async function Hero({ searchParams }: { searchParams: SearchParams }) {
  if (parseLocation(await searchParams).kind === "ok") return null;
  return (
    <div className="flex flex-col items-center pt-4 lg:pt-8">
      <h1 className="display text-center text-ink">{strings.hero}</h1>
      <p className="mt-3 text-center text-ink-muted">{strings.tagline}</p>
    </div>
  );
}

/**
 * The forecast area (design D-2). Reads the URL, then the cached forecast for the rounded place.
 * Rendered inside an unkeyed `<Suspense>`, so a place change keeps the old forecast visible.
 */
export async function ForecastSection({ searchParams }: { searchParams: SearchParams }) {
  const location = parseLocation(await searchParams);
  if (location.kind === "empty") return null;
  if (location.kind === "invalid") return <Notice title={strings.location.invalid} />;

  let forecast: Forecast;
  try {
    forecast = await getForecast(location.lat, location.lon);
  } catch {
    return (
      <Notice tone="error" title={strings.errors.forecast}>
        {strings.errors.forecastHint}
      </Notice>
    );
  }

  const days = forecast.days.slice(0, 7);
  const weekend = upcomingWeekend(forecast.days[0].date);
  const summary = weekendSummary(forecast.days, weekend);

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="title text-ink">{location.label}</h1>
      {summary.kind === "scored" ? (
        <WeekendHighlight
          title={strings.weekend.verdict[summary.band](location.label)}
          saturdayDate={weekend.saturday}
          sundayDate={weekend.sunday}
          score={summary.score}
          hi={summary.hi}
          lo={summary.lo}
          explanation={summary.rationale}
          saturday={{ hi: summary.saturday.day.tempMax, lo: summary.saturday.day.tempMin, precipProb: summary.saturday.day.precipProb }}
          sunday={{ hi: summary.sunday.day.tempMax, lo: summary.sunday.day.tempMin, precipProb: summary.sunday.day.precipProb }}
        />
      ) : (
        <Notice title={strings.weekend.unavailable} />
      )}
      <section aria-label={strings.forecast.days} className="wx-days !px-0">
        {days.map((day) => (
          <DayCard
            key={day.date}
            date={day.date}
            hi={day.tempMax}
            lo={day.tempMin}
            code={day.code}
            precipProb={day.precipProb}
            windKmh={day.windMax}
            comfort={comfortScore(day).value}
            weekend={day.date === weekend.saturday || day.date === weekend.sunday}
          />
        ))}
      </section>
    </div>
  );
}
