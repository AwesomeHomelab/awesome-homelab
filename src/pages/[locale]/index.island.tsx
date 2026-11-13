import manifest from "../../../.generated/manifest.json";
import { Home } from "../../views/home.tsx";
import type { Props } from "./index.server.ts";

export default function LocalizedHomePage({ locale }: Props) {
  return <Home manifest={manifest} locale={locale} />;
}
