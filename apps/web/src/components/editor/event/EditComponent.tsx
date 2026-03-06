import type { EditAtom } from "../edit-atom";
import type { EventComponent, EventComponentType, EventData } from "@evnt/schema";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { focusAtom } from "jotai-optics";
import { CollapsiblePaper } from "./CollapsiblePaper";
import { EventComponentRegistry } from "./event-components";
import { Trans } from "../../content/event/Trans";
import { IconQuestionMark } from "@tabler/icons-react";

export const EditComponent = ({ component, data }: {
	data: EditAtom<EventData>;
	component: EditAtom<EventComponent>;
}) => {
	const type: EventComponentType = useAtomValue(useMemo(() => atom((get) => get(component).type), [component]));

	const onDelete = useSetAtom(useMemo(() => atom(null, (get, set) => {
		const index = get(data).components?.findIndex((c) => c === get(component));
		if (index === undefined || index === -1) return;
		set(data, prev => ({
			...prev,
			components: prev.components?.filter((_, i) => i !== index),
		}));
	}), [data, component]));

	const {
		label,
		icon: Icon,
		editComponent: EditComponent,
	} = useMemo(() => {
		const registryEntry = type in EventComponentRegistry ? EventComponentRegistry[type as keyof typeof EventComponentRegistry] : null;
		return {
			label: registryEntry?.label ?? { en: `Unknown: ${type}` },
			icon: registryEntry?.icon ?? IconQuestionMark,
			editComponent: registryEntry?.editComponent ?? (
				(() => null)
			) as any, // Type Acrobatics
		};
	}, [type]);

	const componentDataAtom = useMemo(() => focusAtom(component, o => o.prop("data")), [component]);

	return (
		<CollapsiblePaper
			icon={<Icon />}
			title={<Trans t={label} />}
			onDelete={onDelete}
		>
			<EditComponent data={componentDataAtom} />
		</CollapsiblePaper>
	);
};
