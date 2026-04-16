import type { OnlineVenue } from "@evnt/schema";
import { DeatomOptional, type EditAtom } from "../edit-atom";
import { Input, Stack, Text } from "@mantine/core";
import { ClearableTextInput } from "../../base/input/ClearableTextInput";
import { focusAtom } from "jotai-optics";
import { useMemo } from "react";

export const EditVenueOnline = ({ data }: { data: EditAtom<OnlineVenue> }) => {
	const urlAtom = useMemo(() => focusAtom(data, o => o.prop("url")), [data]);

	return (
		<Stack>
			<Stack gap={0}>
				<Input.Label>URL</Input.Label>
				<DeatomOptional
					component={ClearableTextInput}
					atom={urlAtom}
					set={() => ""}
					setLabel="Click to set URL"
					placeholder="https://..."
				/>
			</Stack>
		</Stack>
	)
};
