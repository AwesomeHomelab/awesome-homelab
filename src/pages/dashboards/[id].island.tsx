import manifest from "../../../.generated/manifest.json";
import { DashboardDetail } from "../../views/detail.tsx";
import type { Props } from "./[id].server.ts";

export default function DashboardPage({ dashboard }: Props) {
  return <DashboardDetail dashboard={dashboard} manifest={manifest} />;
}
