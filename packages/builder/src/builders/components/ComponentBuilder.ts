import type { EventBuilder } from "../EventBuilder";
import type { KnownComponent, UnknownComponent } from "@evnt/types";

export class ComponentBuilder<T extends KnownComponent | UnknownComponent = KnownComponent> {
	protected component: T;
	protected parent?: EventBuilder;
	constructor(component: T, parent?: EventBuilder) {
		this.component = component;
		this.parent = parent;
	}

	build = () => this.component;
}
