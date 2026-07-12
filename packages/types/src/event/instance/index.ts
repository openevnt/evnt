import type { PartialDate } from "../../types/PartialDate.js";
import type { AnyComponent } from "../component/index.js";
import type { EventStatus } from "../event.js";
import type { Activity } from "./activity.js";

export interface EventInstance {
	id?: string;
	venueIds: string[];
	start?: PartialDate;
	end?: PartialDate;
	status?: EventStatus;
	activities?: Activity[];
	components?: AnyComponent[];
}
