import { hiLo } from "@/lib/format";
import { strings } from "@/lib/strings";
import { ComfortBadge } from "./ComfortBadge";

export const MAX_PINNED_CITIES = 3;

export interface CompareDay {
  hi: number;
  lo: number;
  /** Precipitation probability, %. */
  precip: number;
}

export interface CompareCity {
  name: string;
  sat: CompareDay;
  sun: CompareDay;
  /** Weekend comfort, 0–100. */
  score: number;
}

export interface CompareTableProps {
  /** 1–3 pinned cities, any order: rows are sorted best first. */
  cities: readonly CompareCity[];
  className?: string;
}

function dayCell(d: CompareDay) {
  return `${hiLo(d.hi, d.lo)} · ${Math.round(d.precip)}%`;
}

function CompareRow({ city, best }: { city: CompareCity; best: boolean }) {
  return (
    <tr className={best ? "wx-best" : undefined}>
      <th scope="row">
        {city.name}
        {best ? <span className="wx-best-label">{strings.compare.best}</span> : null}
      </th>
      <td className="wx-num">{dayCell(city.sat)}</td>
      <td className="wx-num">{dayCell(city.sun)}</td>
      <td>
        <ComfortBadge score={city.score} />
      </td>
    </tr>
  );
}

/** Side-by-side weekend comparison. Below 720px the table scrolls; rows never become cards. */
export function CompareTable({ cities, className }: CompareTableProps) {
  const rows = cities.toSorted((a, b) => b.score - a.score);
  // «Найкращий вибір» only means something when there is more than one city.
  const hasBest = rows.length > 1;
  return (
    <div className={className}>
      <div className="wx-chips">
        {cities.map((c) => (
          <span key={c.name} className="wx-chip">
            {c.name}
          </span>
        ))}
        <span className="wx-chip wx-chip-empty">
          {strings.compare.pinned(cities.length, MAX_PINNED_CITIES)}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="wx-compare">
          <thead>
            <tr>
              <th scope="col">{strings.compare.city}</th>
              <th scope="col">{strings.compare.saturday}</th>
              <th scope="col">{strings.compare.sunday}</th>
              <th scope="col">{strings.compare.comfort}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => (
              <CompareRow key={c.name} city={c} best={hasBest && i === 0} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
