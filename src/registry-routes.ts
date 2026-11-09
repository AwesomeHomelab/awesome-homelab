import { defineHandler } from "void/handler";
import registry from "./registry-handler.ts";

const handler = defineHandler((context) => registry.fetch(context.req.raw));

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
};
