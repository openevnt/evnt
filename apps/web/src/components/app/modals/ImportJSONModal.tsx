import { Button, JsonInput, Stack } from "@mantine/core";
import { modals, type ContextModalProps } from "@mantine/modals";
import { randomId } from "@mantine/hooks";
import { useState } from "react";
import { prettifyError, type z } from "zod";
import { EventDataSchema, type EventData } from "@evnt/schema";
import { AsyncAction } from "../../data/AsyncAction";
import { EventActions } from "../../../lib/actions/event-actions";

// export interface ImportJSONModalProps<T extends z.ZodType> {
//     schema: T;
//     onSubmit: (data: z.infer<T>) => void;
// };

// export const openImportJSONModal = <T extends z.ZodType>(props: ImportJSONModalProps<T>) => {
//     const modalId = randomId();
//     modals.open({
//         title: "Add Event JSON",
//         size: "xl",
//         modalId,
//         children: (
//             <ImportJSONModal
//                 schema={props.schema}
//                 onSubmit={(data) => {
//                     props.onSubmit(data);
//                     modals.close(modalId);
//                 }}
//             />
//         ),
//     });
// }

export const ImportJSONModal = ({
	context,
	id: modalId,
}: ContextModalProps<{}>) => {
	const [json, setJson] = useState("");

	let error = "";
	let parsed = null;
	let result: z.ZodSafeParseResult<EventData> | null = null;
	try {
		parsed = JSON.parse(json);
		result = EventDataSchema.safeParse(parsed);
		if (!result.success) {
			error = prettifyError(result.error);
		}
	} catch (e) {
		error = ""+e;
	}

	return (
		<Stack>
			<JsonInput
				value={json}
				onChange={setJson}
				minRows={5}
				autosize
				placeholder="Paste event JSON here..."
				error={error}
				styles={{
					error: { whiteSpace: "pre-wrap" },
				}}
			/>
			<AsyncAction
				action={async () => {
					if (!result || !result.success) return;
					await EventActions.createLocalEvent(result.data);
					modals.close(modalId);
				}}
			>
				{({ loading, onClick }) => (
					<Button
						loading={loading}
						disabled={!!error || !json || !result || !result.success}
						onClick={onClick}
						color="green"
					>
						Import
					</Button>
				)}
			</AsyncAction>
		</Stack>
	);
}
