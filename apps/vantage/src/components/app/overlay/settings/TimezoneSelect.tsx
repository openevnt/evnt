import { Anchor, Input, Select, Stack } from "@mantine/core";
import { useState } from "react";
import { trynull } from "../../../../lib/util/trynull";

export const TimezoneSelect = ({
	value,
	onChange,
	showDetected = true,
	label,
	description,
	leftSection,
}: {
	value: string | undefined;
	onChange: (value: string) => void;
	showDetected?: boolean;
	label?: React.ReactNode;
	description?: React.ReactNode;
	leftSection?: React.ReactNode;
}) => {
	const [searchValue, setSearchValue] = useState("");

	const intlResolvedTz = trynull(() => new Intl.DateTimeFormat().resolvedOptions().timeZone);

	return (
		<Stack gap={4}>
			<Select
				label={label ?? "Timezone"}
				description={description}
				data={Intl.supportedValuesOf('timeZone').filter(x => !x.startsWith("Etc/")).map(tz => ({ value: tz, label: tz }))}
				searchable
				clearable={value !== "UTC"}
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				onFocus={() => setSearchValue("")}
				value={value ?? "UTC"}
				onChange={(value) => {
					onChange(value ?? "UTC");
					setSearchValue("");
				}}
				leftSection={leftSection}
			/>
			{(showDetected && intlResolvedTz && value !== intlResolvedTz) && (
				<Input.Description>
					Set to <Anchor
						component="button"
						type="button"
						onClick={() => {
							onChange(intlResolvedTz);
						}}
						inherit
					>
						{intlResolvedTz}
					</Anchor>
				</Input.Description>
			)}
		</Stack>
	);
};
