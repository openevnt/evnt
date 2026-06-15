import type { PartialDate } from "@evnt/types";

export interface DateGroup {
	dates: SingleDate | DateRange | DateList;
	times: TimeSlot[];
	venueIds: string[];
}

export interface SingleDate {
	type: "single";
	date: PartialDate;
}

export interface DateRange {
	type: "range";
	from: PartialDate;
	to: PartialDate;
}

export interface DateList {
	type: "list";
	dates: PartialDate[];
}

export interface TimeSlot {
	start?: PartialDate;
	end?: PartialDate;
}
