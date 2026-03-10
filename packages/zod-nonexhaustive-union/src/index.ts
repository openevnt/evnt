import z from "zod";

export type ZodVariantList<DiscriminatorKey extends string, VariantValue extends string = string> = (
	z.ZodObject<{ readonly [D in DiscriminatorKey]: z.ZodLiteral<VariantValue> }>
)[];

export type VariantList<DiscriminatorKey extends string, VariantValue extends string = string> = (
	{ [D in DiscriminatorKey]: VariantValue }
)[];

export type KnownVariant<
	DiscriminatorKey extends string,
	List extends VariantList<DiscriminatorKey, VariantValue>,
	VariantValue extends string = string
> = List[number];

export type UnknownVariant<DiscriminatorKey extends string> = {
	[D in DiscriminatorKey]: (string & {});
} & Record<string, unknown>;

export type NonExhaustiveUnion<
	DiscriminatorKey extends string,
	List extends VariantList<DiscriminatorKey, VariantValue>,
	VariantValue extends string = string,
> = KnownVariant<DiscriminatorKey, List, VariantValue> | UnknownVariant<DiscriminatorKey>;

export type ZodNonExhaustiveUnion<DiscriminatorKey extends string,
	List extends VariantList<DiscriminatorKey, VariantValue>,
	VariantValue extends string = List[number][DiscriminatorKey],
> = z.ZodType<NonExhaustiveUnion<DiscriminatorKey, List, VariantValue>>;

export type InferVariants<T extends z.ZodType> = T extends ZodNonExhaustiveUnion<infer DiscriminatorKey, infer List, infer VariantValue>
	? List[number]
	: never;

export type InferDiscriminatorKey<T extends z.ZodType> = T extends ZodNonExhaustiveUnion<infer DiscriminatorKey, infer List, infer VariantValue>
	? DiscriminatorKey
	: never;

export type InferVariantValue<T extends z.ZodType> = T extends ZodNonExhaustiveUnion<infer DiscriminatorKey, infer List, infer VariantValue>
	? VariantValue
	: never;

export const zodNonExhaustiveUnion = <
	DiscriminatorKey extends string,
	List extends VariantList<DiscriminatorKey, VariantValue>,
	VariantValue extends string = List[number][DiscriminatorKey],
>(
	discriminator: DiscriminatorKey,
	schemas: z.ZodObject<{ readonly [D in DiscriminatorKey]: z.ZodLiteral<VariantValue> }>[],
	opts?: {
		defaultVariant?: VariantValue;
	},
): z.ZodType<NonExhaustiveUnion<DiscriminatorKey, List, VariantValue>> => {
	const knownVariants = schemas.map(zodObject => zodObject.shape[discriminator].value);

	const baseSchema = z.object({
		[discriminator]: z.string(),
	});

	const refinedSchema = baseSchema.superRefine((obj, ctx) => {
		const variantValue = (obj[discriminator] ?? opts?.defaultVariant) as VariantValue | undefined;
		if (variantValue && knownVariants.includes(variantValue)) {
			const schema = schemas.find(zodObject => zodObject.shape[discriminator].value === variantValue)!;
			const result = schema.safeParse(obj);
			if (!result.success) result.error.issues.forEach((issue) => {
				ctx.addIssue({ ...issue, path: [] });
			});
		}
	});

	refinedSchema._zod.processJSONSchema = (ctx, json, params) => {
		const oneOfSchemas = Object.entries(schemas).map(([variant, schema]) =>
			z.strictObject({
				[discriminator]: z.literal(variant),
				...schema.shape,
			})
		);

		const internals = z.union(oneOfSchemas)._zod;
		internals.processJSONSchema?.(ctx, json, params);

		json.oneOf ??= [];
		json.oneOf.push({
			type: "object",
			properties: {
				[discriminator]: {
					type: "string",
					not: {
						anyOf: knownVariants.map((variant) => ({ const: variant })),
					},
				},
			},
			required: [discriminator],
			additionalProperties: true,
		});
	};

	// Typescript wizardry sometimes requires us to do many type casts...
	return refinedSchema as unknown as z.ZodType<NonExhaustiveUnion<DiscriminatorKey, List, VariantValue>>;
};
