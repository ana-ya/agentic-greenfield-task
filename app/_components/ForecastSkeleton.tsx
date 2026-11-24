import { strings } from "@/lib/i18n";

/**
 * First-load placeholder in the final shape: weekend panel + seven day cards on `surface-sunken`,
 * no spinner (FR-FORECAST-07). Uses the real wx- containers so nothing shifts when data arrives.
 */
export function ForecastSkeleton() {
  return (
    <div role="status" aria-label={strings.forecast.loading} className="flex w-full flex-col gap-4">
      <div className="h-8 w-48 rounded-sm bg-surface-sunken" />
      <div className="h-44 rounded-lg bg-surface-sunken" />
      <div className="wx-days !px-0">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-[196px] rounded-md bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}
