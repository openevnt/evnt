export namespace PartialDate {
	type TimezoneIdentifier = string;
	export type YearOnly = `${number}[${TimezoneIdentifier}]`;
	export type YearMonth = `${number}-${number}[${TimezoneIdentifier}]`;
	export type YearMonthDay = `${number}-${number}-${number}[${TimezoneIdentifier}]`;
	export type YearMonthDayTime =
		`${number}-${number}-${number}T${number}:${number}[${TimezoneIdentifier}]`;
}

export type PartialDate =
	| PartialDate.YearOnly
	| PartialDate.YearMonth
	| PartialDate.YearMonthDay
	| PartialDate.YearMonthDayTime;
