import "./project-stars.css";

export function ProjectStars({ repository, stars }: { repository: string; stars: number | null }) {
  const value = stars?.toLocaleString("en-US") ?? "—";
  const label =
    stars === null
      ? `${repository}: GitHub stars unavailable`
      : `${repository}: ${value} GitHub stars`;
  const width = 28 + Math.max(28, value.length * 7 + 12);
  return (
    <a
      className="project-stars"
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
