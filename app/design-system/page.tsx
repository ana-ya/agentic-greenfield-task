import type { Metadata } from "next";
import {
  Button,
  ClearIcon,
  CloudyIcon,
  ComfortBadge,
  CompareTable,
  DayCard,
  LocationIcon,
  Notice,
  PartlyCloudyIcon,
  RainIcon,
  WeekendHighlight,
} from "@/components/design-system";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `Design system · ${strings.appName}`,
  robots: { index: false, follow: false },
};

/**
 * Living reference of the ported components, with the sample data from
 * docs/design-system previews. Use it to check a change visually in both
 * themes (switch the OS / devtools colour scheme). Not linked from the product.
 */

const SWATCHES = [
  "surface", "surface-raised", "surface-sunken", "ink", "ink-muted", "ink-subtle",
  "line", "line-strong", "brand", "brand-soft", "accent", "accent-soft", "accent-ink",
  "comfort-good", "comfort-fair", "comfort-poor", "danger",
] as const;

const TYPE = ["display", "temp-xl", "title", "heading", "body", "body-sm", "label", "caption", "clock", "data"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="title">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-8 px-4 py-8 lg:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="title">{strings.appName} · design system</h1>
        <p className="body-sm text-ink-muted">
          Source: docs/design-system. Rules: DESIGN.md.
        </p>
      </header>

      <Section title="Colour">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {SWATCHES.map((name) => (
            <div key={name} className="flex flex-col gap-1">
              <div
                className="h-12 rounded-md border border-line"
                style={{ background: `var(--${name})` }}
              />
              <code className="data text-ink-muted">{name}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-raised p-4 shadow-card lg:p-6">
          {TYPE.map((name) => (
            <p key={name} className={name}>
              {name} · Куди поїхати на вихідні 18° / 9°
            </p>
          ))}
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">{strings.compare.action}</Button>
          <Button icon={<LocationIcon />}>{strings.search.useMyLocation}</Button>
          <Button variant="text">{strings.compare.pin}</Button>
          <Button disabled>{strings.compare.pinned(3, 3)}</Button>
        </div>
      </Section>

      <Section title="ComfortBadge">
        <div className="flex flex-wrap items-center gap-3">
          {[86, 58, 22].map((s) => (
            <ComfortBadge key={s} score={s} />
          ))}
          {[86, 58, 22].map((s) => (
            <ComfortBadge key={`lg-${s}`} score={s} size="lg" />
          ))}
        </div>
      </Section>

      <Section title="WeekendHighlight">
        <WeekendHighlight
          title={strings.weekend.worthIt("Львів")}
          saturdayDate="2026-11-28"
          sundayDate="2026-11-29"
          score={78}
          hi={13}
          lo={5}
          explanation="Сухо й прохолодно, вітер слабкий — на вечір знадобиться тепла куртка."
          saturday={{ hi: 13, lo: 5, precipProb: 5 }}
          sunday={{ hi: 12, lo: 6, precipProb: 15 }}
        />
      </Section>

      <Section title="DayCard">
        <div className="wx-days !p-0">
          <DayCard date="2026-11-26" hi={11} lo={4} icon={<CloudyIcon label="Хмарно" />} precipProb={20} windKmh={14} comfort={64} />
          <DayCard date="2026-11-27" hi={9} lo={3} icon={<RainIcon label="Дощ" />} precipProb={80} windKmh={22} comfort={31} />
          <DayCard date="2026-11-28" hi={13} lo={5} icon={<ClearIcon label="Ясно" />} precipProb={5} windKmh={8} comfort={84} weekend />
          <DayCard date="2026-11-29" hi={12} lo={6} icon={<PartlyCloudyIcon label="Мінлива хмарність" />} precipProb={15} windKmh={11} comfort={72} weekend />
        </div>
      </Section>

      <Section title="CompareTable">
        <CompareTable
          cities={[
            { name: "Львів", sat: { hi: 13, lo: 5, precip: 5 }, sun: { hi: 12, lo: 6, precip: 15 }, score: 78 },
            { name: "Ужгород", sat: { hi: 15, lo: 7, precip: 5 }, sun: { hi: 14, lo: 6, precip: 10 }, score: 84 },
            { name: "Чернівці", sat: { hi: 10, lo: 3, precip: 60 }, sun: { hi: 9, lo: 2, precip: 70 }, score: 38 },
          ]}
        />
      </Section>

      <Section title="Notice">
        <div className="flex flex-col gap-3">
          <Notice title={strings.search.empty}>{strings.search.emptyHint}</Notice>
          <Notice tone="error" title={strings.errors.forecast}>
            {strings.errors.forecastHint}
          </Notice>
        </div>
      </Section>
    </main>
  );
}
