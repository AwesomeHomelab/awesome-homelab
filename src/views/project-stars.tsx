import { css, cx } from "../../styled-system/css";
import type { Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";

export function ProjectStars({
  repository,
  stars,
  locale,
}: {
  repository: string;
  stars: number | null;
  locale: Locale;
}) {
  const value = stars?.toLocaleString(locale) ?? "—";
  const label =
    stars === null
      ? m.stars_unavailable({ repository }, { locale })
      : m.stars_count({ repository, value, count: stars }, { locale });
  const width = 28 + Math.max(28, value.length * 7 + 12);
  return (
    <a
      className={cx(
        "project-stars",
        css({
          display: "inline-flex",
          flexShrink: "0",
          minHeight: "6",
          color: "fg",
          rounded: "sm",
          "& rect": { fill: "token(colors.bg.subtle)", stroke: "token(colors.border.strong)" },
          "& path": {
            fill: "token(colors.accent)",
            stroke: "token(colors.border.strong)",
            strokeWidth: "1px",
          },
          "& text": {
            fill: "currentColor",
            fontFamily: "mono",
            fontSize: "11px",
            fontWeight: "semibold",
          },
        }),
      )}
      href={`https://github.com/${repository}`}
      aria-label={label}
      title={label}
    >
      <svg
        width={width}
        height={24}
        viewBox={`0 0 ${width} 24`}
        aria-hidden="true"
        focusable="false"
      >
        <rect x={0.5} y={0.5} width={width - 1} height={23} rx={4} />
        <path d="m14 4 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" />
        <text x={(28 + width) / 2} y={16} textAnchor="middle">
          {value}
        </text>
      </svg>
    </a>
  );
}
