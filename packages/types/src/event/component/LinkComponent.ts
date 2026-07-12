import type { PartialDate } from "../../types/PartialDate.js";
import type { Translations } from "../../types/Translations.js";

export interface LinkComponent {
	$type: "directory.evnt.component.link";
	url: string;
	name?: Translations;
	disabled?: boolean;
	opensAt?: PartialDate;
	closesAt?: PartialDate;
}
