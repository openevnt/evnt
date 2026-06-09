import type { EventBuilder } from "../EventBuilder";
import type { KnownEventComponent, UnknownEventComponent } from "@evnt/schema";

export class ComponentBuilder<T extends KnownEventComponent | UnknownEventComponent = KnownEventComponent> {
	protected component: T;
	protected parent?: EventBuilder;
	constructor(component: T, parent?: EventBuilder) {
		this.component = component;
		this.parent = parent;
	}

	build = () => this.component;
}
