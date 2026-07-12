import z from "zod";
import type { AnyComponent } from "@evnt/types";
import { LinkComponentSchema } from "./LinkComponent";
import { SourceComponentSchema } from "./SourceComponent";
import { SplashMediaComponentSchema } from "./SplashMediaComponent";
import { LanguagesComponentSchema } from "./LanguagesComponent";
import { RTMarkdownSchema } from "./MarkdownComponent";
import { RichTextBlueskyComponentSchema } from "./RichTextBlueskyComponent";

export const KnownEventComponents = new Map<string, z.ZodType<AnyComponent>>([
  ["directory.evnt.component.link", LinkComponentSchema],
  ["directory.evnt.component.source", SourceComponentSchema],
  ["directory.evnt.component.splashMedia", SplashMediaComponentSchema],
  ["directory.evnt.component.languages", LanguagesComponentSchema],
  ["directory.evnt.richtext.markdown", RTMarkdownSchema],
  ["directory.evnt.richtext.bluesky", RichTextBlueskyComponentSchema],
]);

export const EventComponentSchema = z
  .looseObject({
    $type: z.string(),
  })
  .superRefine((obj, ctx) => {
    if (KnownEventComponents.has(obj.$type)) {
      const schema = KnownEventComponents.get(obj.$type)!;
      const result = schema.safeParse(obj);
      if (!result.success)
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ ...issue, path: ["data", ...issue.path] });
        });
    }
  })
  .meta({ id: "EventComponent" }) as z.ZodType<AnyComponent>;

EventComponentSchema._zod.processJSONSchema = (ctx, json, params) => {
  const xor = z.xor(
    Array.from(KnownEventComponents.entries()).map(([type, schema]) =>
      (schema as unknown as z.ZodObject).strict().extend({ $type: z.literal(type) }),
    ),
  );

  const internals = xor._zod;
  internals.processJSONSchema?.(ctx, json, params);

  json.oneOf ??= [];

  json.oneOf.push({
    type: "object",
    properties: {
      $type: {
        type: "string",
        not: {
          anyOf: Array.from(KnownEventComponents.keys()).map((type) => ({ const: type })),
        },
      },
    },
    required: ["$type"],
    additionalProperties: true,
  });
};
