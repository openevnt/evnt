import type { EventComponent, KnownEventComponent } from "@evnt/schema";
import type { EventBuilder } from "../EventBuilder";

export class ComponentBuilder<Type extends KnownEventComponent["type"], Data = Extract<KnownEventComponent, { type: Type }>["data"]> {
	component: { type: Type; data: Data };
	constructor(component: { type: Type; data: Data }, public parent?: EventBuilder) {
		this.component = component;
	}

	build(): EventComponent {
		return this.component as EventComponent;
	}
};
