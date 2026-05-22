import z from "zod";
import { LinkComponentSchema } from "./LinkComponent";
import { SourceComponentSchema } from "./SourceComponent";
import { SplashMediaComponentSchema } from "./SplashMediaComponent";
import { LanguagesComponentSchema } from "./LanguagesComponent";
import { MarkdownComponentSchema } from "./MarkdownComponent";
import { BlueSkyRichtextComponentSchema } from "./BlueSkyRichtextComponent";

const KnownEventComponentsMap = {
	"directory.evnt.component.link": LinkComponentSchema,
	"directory.evnt.component.source": SourceComponentSchema,
	"directory.evnt.component.splashMedia": SplashMediaComponentSchema,
	"directory.evnt.component.languages": LanguagesComponentSchema,
	"directory.evnt.component.markdown": MarkdownComponentSchema,
	"directory.evnt.component.blueSkyRichtext": BlueSkyRichtextComponentSchema,
} as const;

export type KnownEventComponent = {
	[K in keyof typeof KnownEventComponentsMap]: z.infer<(typeof KnownEventComponentsMap)[K]>;
}[keyof typeof KnownEventComponentsMap];

export type UnknownEventComponent = z.infer<typeof UnknownEventComponentSchema>;
const UnknownEventComponentSchema = z.looseObject({
	$type: z.string(),
});

export type EventComponent = z.infer<typeof EventComponentSchema>;
export type EventComponentType = keyof typeof KnownEventComponentsMap | (string & {});

export const EventComponentSchema = UnknownEventComponentSchema.superRefine((obj, ctx) => {
	if (obj.$type in KnownEventComponentsMap) {
		const schema = KnownEventComponentsMap[obj.$type as keyof typeof KnownEventComponentsMap];
		const result = schema.safeParse(obj);
		if (!result.success)
			result.error.issues.forEach((issue) => {
				ctx.addIssue({ ...issue, path: ["data", ...issue.path] });
			});
	}
}).meta({ id: "EventComponent" }) as z.ZodType<KnownEventComponent | UnknownEventComponent>;

EventComponentSchema._zod.processJSONSchema = (ctx, json, params) => {
	const xor = z.xor([
		...Object.entries(KnownEventComponentsMap).map(([type, schema]) =>
			schema.strict().extend({ $type: z.literal(type) })
		),
	]);

	const internals = xor._zod;
	internals.processJSONSchema?.(ctx, json, params);

	json.oneOf ??= [];

	json.oneOf.push({
		type: "object",
		properties: {
			$type: {
				type: "string",
				not: {
					anyOf: Object.keys(KnownEventComponentsMap).map((type) => ({ const: type })),
				},
			},
		},
		required: ["$type"],
		additionalProperties: true,
	});
};
