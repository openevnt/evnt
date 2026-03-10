# zod-nonexhaustive-union

[Zod](https://zod.dev) utility for creating non-exhaustive unions

- Fully typed
- Parses variants correctly
- Issues are handled correctly
- Passthrough behavior for unknown variants
- `toJSONSchema` Support

```ts
import { zodNonExhaustiveUnion } from "zod-nonexhaustive-union";
import z from "zod";

type Schema = z.infer<typeof schema>;
const schema = zodNonExhaustiveUnion("type", [
	z.object({ type: z.literal("a"), a: z.string() }),
	z.object({ type: z.literal("b"), b: z.number() }),
]);

let x: Schema = { type: "a", a: "hello" };
let y: Schema = { type: "non-exhaustive" };

schema.parse({ type: "a" }) // Fails
schema.parse({ type: "a", a: "" }) // Succeeds

schema.parse({ type: "non-exhaustive" }) // Succeeds
```

Types

```ts
import * from "zod-nonexhaustive-union";

type Known = InferVariants<Schema>;
// { type: "a", a: string } | { type: "b", b: number }

type Enum = InferVariantValue<Schema>;
// "a" | "b"

type DiscKey = InferDiscriminatorKey<Schema>;
// "type"

type SameAsSchema = NonExhaustiveUnion<DiscKey, Known, Enum>;
type V0 = UnknownVariant<DiscKey>;
```

