import type { ComponentProps } from "react";
import { css, cx } from "../../styled-system/css";
import { dashboardIcon } from "../catalog.ts";
import type { Dashboard, Manifest } from "../registry.ts";

export function DashboardIcon({
  dashboard,
  manifest,
  loading = "lazy",
}: {
  dashboard: Dashboard;
  manifest: Manifest;
  loading?: ComponentProps<"img">["loading"];
}) {
  const icon = dashboardIcon(dashboard.icon, manifest);
  return icon ? (
    <img
      className={cx(
        "dashboard-icon",
        css({
          flexShrink: "0",
          width: "12",
          height: "12",
          objectFit: "contain",
          bg: "white",
          p: "1.5",
          borderWidth: "1px",
          borderColor: "border",
          rounded: "lg",
        }),
      )}
      src={icon}
      alt=""
      width={48}
      height={48}
      loading={loading}
    />
  ) : null;
}
