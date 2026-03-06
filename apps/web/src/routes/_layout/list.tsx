import { createFileRoute } from "@tanstack/react-router"
import { useLayersStore } from "../../db/useLayersStore";
import { useMemo } from "react";
import { useEventQueries } from "../../db/useEventQuery";
import { applyEventFilters, EventFilters } from "../../lib/filter/event-filters";
import { Accordion, ActionIcon, Button, Checkbox, Collapse, Combobox, Group, Indicator, Input, InputBase, Paper, SegmentedControl, Stack, TextInput, useCombobox } from "@mantine/core";
import { EventsGrid } from "../../components/content/event-grid/EventsGrid";
import type { Layer } from "../../db/models/layer";
import z from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { useDisclosure } from "@mantine/hooks";
import { applyEventSorters, EventSorters } from "../../lib/filter/event-sorters";
import { useLocaleStore } from "../../stores/useLocaleStore";

const SearchParamsSchema = z.object({
	search: z.string().optional(),
	layers: z.string().array().optional(),
	relativity: z.enum(["past", "future", "all"]).optional(),
	sortBy: z.enum(["name", "instanceStart", "none"]).optional(),
});

const defaultSearchParams = {
	search: "",
	layers: ["default"],
	relativity: "future" as const,
	sortBy: "instanceStart" as const,
} satisfies z.infer<typeof SearchParamsSchema>;

export const Route = createFileRoute("/_layout/list")({
	component: ListPage,
	validateSearch: zodValidator(SearchParamsSchema),
})

type SortBy = "name" | "instanceStart" | "none";

function ListPage() {
	const searchObject = Route.useSearch();
	const {
		search = defaultSearchParams.search,
		layers: layerIds = defaultSearchParams.layers,
		relativity = defaultSearchParams.relativity,
		sortBy = defaultSearchParams.sortBy,
	} = searchObject;

	const [expanded, { toggle: toggleExpanded }] = useDisclosure(false);

	const navigate = Route.useNavigate();
	const userLanguage = useLocaleStore(store => store.language);

	const updateSearch = (newValues: Partial<z.infer<typeof SearchParamsSchema>>) => {
		navigate({
			search: (prev) => {
				let o = { ...prev };
				for (const key in newValues) {
					if (newValues[key as keyof typeof newValues] === defaultSearchParams[key as keyof typeof defaultSearchParams]) {
						delete o[key as keyof typeof o];
					} else {
						o[key as keyof typeof o] = newValues[key as keyof typeof newValues] as any;
					}
				}
				return o;
			},
		});
	};

	const layers = useLayersStore(store => store.layers);

	const sources = useMemo(() => {
		return Array.from(new Set(
			Array.from(layerIds).map(id => layers[id]?.data.events || []).flat()
		));
	}, [layers, layerIds])

	const allQueries = useEventQueries(sources);
	const filtered = applyEventFilters(allQueries, [
		(search && search.length > 0) ? EventFilters.Search(search) : EventFilters.None,
		relativity === "future" ? EventFilters.AfterDate(new Date()) : EventFilters.None,
		relativity === "past" ? EventFilters.BeforeDate(new Date()) : EventFilters.None,
	]);
	const sorted = applyEventSorters(filtered, [
		sortBy === "name" ? EventSorters.Name(userLanguage) : EventSorters.None,
		sortBy === "instanceStart" ? EventSorters.InstanceStart : EventSorters.None,
	])
	const finalList = sorted;

	const top = "calc(var(--app-shell-header-height, 0px) + var(--app-shell-padding) + var(--safe-area-inset-top))";
	return (
		<Stack>
			<Paper pos="sticky" top={top} p={4} withBorder shadow="md" style={{ zIndex: 5 }}>
				<Stack gap={0}>
					<Group gap={4}>
						<TextInput
							placeholder="Search events..."
							value={search}
							onChange={(event) => updateSearch({ search: event.currentTarget.value })}
							flex={1}
						/>
						<Indicator
							disabled={!Object.keys(searchObject).length}
						>
							<ActionIcon
								onClick={toggleExpanded}
								size="input-sm"
								variant="light"
								color="gray"
							>
								<Accordion.Chevron style={{
									transform: !expanded ? "rotate(0deg)" : "rotate(-180deg)",
									transition: "transform 150ms ease",
								}} />
							</ActionIcon>
						</Indicator>
					</Group>
					<Collapse expanded={expanded}>
						<Group gap={4} mt={4}>
							<Stack gap={0}>
								<Input.Label>
									Filters
								</Input.Label>
								<Group gap={4}>
									<RelativitySelect
										value={relativity}
										onChange={(value) => updateSearch({ relativity: value })}
									/>
								</Group>
							</Stack>
							<Stack gap={0}>
								<Input.Label>
									Sort
								</Input.Label>
								<Group gap={4}>
									<SegmentedControl<SortBy>
										data={[
											{ label: "Name", value: "name" },
											{ label: "Date", value: "instanceStart" },
											{ label: "None", value: "none" },
										]}
										value={sortBy}
										onChange={(value) => updateSearch({ sortBy: value })}
									/>
								</Group>
							</Stack>
							<Stack gap={0}>
								<Input.Label>
									Actions
								</Input.Label>
								<Group gap={4}>
									<Button
										onClick={() => updateSearch(defaultSearchParams)}
										variant="light"
										color="gray"
									>
										Clear Query
									</Button>
								</Group>
							</Stack>
						</Group>
					</Collapse>
				</Stack>
			</Paper>

			<EventsGrid queries={finalList} />
		</Stack >
	)
}

export const LayersSelect = ({
	layers,
	onChange,
	value,
}: {
	layers: Record<string, Layer>;
	value: string[];
	onChange: (values: string[]) => void;
}) => {
	const combobox = useCombobox();

	const options = Object.keys(layers).map((layerId) => (
		<Combobox.Option value={layerId} key={layerId}>
			<Group gap={4} wrap="nowrap">
				<Checkbox
					checked={value.includes(layerId)}
					readOnly
				/>

				{layerId}
			</Group>
		</Combobox.Option>
	));

	return (
		<Combobox
			store={combobox}
			onOptionSubmit={(id) => {
				onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
			}}
			width="max-content"
		>
			<Combobox.Target>
				<Indicator
					label={value.length}
					size={16}
					color="gray.7"
					disabled={value.length <= 1}
					offset={4}
				>
					<InputBase
						component="button"
						type="button"
						pointer
						rightSection={<Combobox.Chevron />}
						rightSectionPointerEvents="none"
						onClick={() => combobox.toggleDropdown()}
					>
						{value.length === 1 ? value[0] : "Layers..."}
					</InputBase>
				</Indicator>
			</Combobox.Target>
			<Combobox.Dropdown>
				<Combobox.Options>
					{options}
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);
};

export type Relativity = "past" | "future" | "all";
export const RelativitySelect = ({
	value,
	onChange,
}: {
	value: Relativity;
	onChange: (value: Relativity) => void;
}) => {
	return (
		<SegmentedControl<Relativity>
			data={[
				{ label: "Past", value: "past" },
				{ label: "All", value: "all" },
				{ label: "Future", value: "future" },
			]}
			value={value}
			onChange={onChange}
		/>
	)
}
