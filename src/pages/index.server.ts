import { defineHead } from "void/handler";
import manifest from "../../.generated/manifest.json";
import { homeHead } from "../seo.ts";

export const head = defineHead(() => homeHead(manifest));
