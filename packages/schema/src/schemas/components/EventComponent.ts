import z from "zod";
import { LinkComponentSchema } from "./LinkComponent";
import { SourceComponentSchema } from "./SourceComponent";
import { SplashMediaComponentSchema } from "./SplashMediaComponent";

const KnownEventComponentsMap = {
	link: LinkComponentSchema,
	source: SourceComponentSchema,
	splashMedia: SplashMediaComponentSchema,
} as const;

export type KnownEventComponent = {
	[K in keyof typeof KnownEventComponentsMap]: {
		type: K;
		data: z.infer<(typeof KnownEventComponentsMap)[K]>;
	};
}[keyof typeof KnownEventComponentsMap];

export type UnknownEventComponent = z.infer<typeof UnknownEventComponentSchema>;
export const UnknownEventComponentSchema = z.object({
	type: z.string(),
	data: z.record(z.string(), z.unknown())
});

export type EventComponent = z.infer<typeof EventComponentSchema>;
export type EventComponentType = keyof typeof KnownEventComponentsMap | (string & {});

export const EventComponentSchema = UnknownEventComponentSchema.superRefine((obj, ctx) => {
	if (obj.type in KnownEventComponentsMap) {
		const schema = KnownEventComponentsMap[obj.type as keyof typeof KnownEventComponentsMap];
		const result = schema.safeParse(obj.data);
		if (!result.success)
			result.error.issues.forEach((issue) => {
				ctx.addIssue({ ...issue, path: ["data", ...issue.path] });
			});
	}
}).meta({ id: "EventComponent" }) as z.ZodType<KnownEventComponent | UnknownEventComponent>;
