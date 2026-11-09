import manifest from "../.generated/manifest.json";
import { createHandler } from "./handler.ts";

export default { fetch: createHandler(manifest) } satisfies ExportedHandler;
