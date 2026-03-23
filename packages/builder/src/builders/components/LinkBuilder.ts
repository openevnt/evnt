import type { LinkComponent, PartialDate } from "@evnt/schema";
import { ComponentBuilder } from "./ComponentBuilder";
import type { EventBuilder } from "../EventBuilder";
import { createTranslationAdder } from "../../utils/helpers";

export class LinkBuilder extends ComponentBuilder<"link"> {
	constructor(data: LinkComponent = { url: "" }, public parent?: EventBuilder) {
		super({ type: "link", data }, parent);
	}

	setUrl(url: string) {
		this.component.data.url = url;
		return this;
	}

	setName = createTranslationAdder(() => this.component.data.name ??= {}, this);
	setDescription = createTranslationAdder(() => this.component.data.description ??= {}, this);

	setDisabled(disabled: boolean) {
		this.component.data.disabled = disabled;
		return this;
	}

	setOpensAt(opensAt: PartialDate) {
		this.component.data.opensAt = opensAt;
		return this;
	}

	setClosesAt(closesAt: PartialDate) {
		this.component.data.closesAt = closesAt;
		return this;
	}
}
