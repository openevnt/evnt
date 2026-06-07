import type { PartialDate } from "../../types/PartialDate";
import type { AnyComponent } from "../component";
import type { EventStatus } from "../event";
import type { Activity } from "./activity";

export interface EventInstance {
	id?: string;
	venueIds: string[];
	start?: PartialDate;
	end?: PartialDate;
	status?: EventStatus;
	activities?: Activity[];
	components?: AnyComponent[];
};
