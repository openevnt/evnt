import type { PartialDate } from "../../types/PartialDate";
import type { Translations } from "../../types/Translations";

export interface LinkComponent {
	$type: "directory.evnt.component.link";
	url: string;
	name?: Translations;
	disabled?: boolean;
	opensAt?: PartialDate;
	closesAt?: PartialDate;
};
