import type { LinkComponent, PartialDate } from "@evnt/types";
import type { EventBuilder } from "../EventBuilder";
import { ComponentBuilder } from "./ComponentBuilder";

export class LinkBuilder extends ComponentBuilder<LinkComponent> {
	constructor(component?: LinkComponent, parent?: EventBuilder) {
		super(component ?? {
			$type: "directory.evnt.component.link",
			url: "",
		}, parent);
	}

	setUrl(url: string) {
		this.component.url = url;
		return this;
	}

	setName(name: string, language?: string) {
		this.component.name ??= {};
		this.component.name[language ?? "en"] = name;
		return this;
	}

	setDisabled(disabled: boolean) {
		this.component.disabled = disabled;
		return this;
	}

	setOpensAt(opensAt: PartialDate) {
		this.component.opensAt = opensAt;
		return this;
	}

	setClosesAt(closesAt: PartialDate) {
		this.component.closesAt = closesAt;
		return this;
	}
}
