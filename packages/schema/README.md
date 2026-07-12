# @evnt/schema

Zod validation schemas for [Open Evnt](https://evnt.directory) events.

Re-exports types from `@evnt/types`

```ts
import { OpenEvntSchema } from "@evnt/schema";

const result = OpenEvntSchema.safeParse(event);
if (result.success) {
	console.log("Valid event!");
} else {
	console.error(result.error.issues);
}
```

## Custom Component validation

```ts
import { KnownEventComponents } from "@evnt/schema";

KnownEventComponents.set("my.custom.component", MyCustomComponentSchema);
```
