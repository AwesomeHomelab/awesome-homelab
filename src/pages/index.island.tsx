import manifest from "../../.generated/manifest.json";
import { Home } from "../views/home.tsx";

export default function HomePage() {
  return <Home manifest={manifest} />;
}
