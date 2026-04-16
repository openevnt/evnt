import type { Address, PhysicalVenue } from "@evnt/schema";
import { Deatom, DeatomOptional, type EditAtom } from "../edit-atom";
import { Button, Grid, Group, Input, Select, SimpleGrid, Stack, Text, Tooltip } from "@mantine/core";
import { ClearableTextInput } from "../../base/input/ClearableTextInput";
import { focusAtom } from "jotai-optics";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import COUNTRY_CODES from "../../../lib/resources/country-codes.json";
import { UtilCountryCode } from "../../../lib/util/country-code";
import { useLocaleStore } from "../../../stores/useLocaleStore";

export const EditVenuePhysical = ({ data }: { data: EditAtom<PhysicalVenue> }) => {
	// const hasAddress = useAtomValue(useMemo(() => atom((get) => !!get(data).address), [data]));
	// const addAddress = useSetAtom(useMemo(() => atom(null, (get, set) => {
	// 	set(data, prev => ({
	// 		...prev,
	// 		address: {},
	// 	}));
	// }), [data]));
	const deleteAddress = useSetAtom(useMemo(() => atom(null, (get, set) => {
		set(data, prev => ({
			...prev,
			address: undefined,
		}));
	}), [data]));

	const addressAtom = useMemo(() => focusAtom(data, o => o.prop("address").valueOr({})) as EditAtom<Address>, [data]);

	return (
		<Stack>
			<EditAddress
				data={addressAtom}
				onDelete={deleteAddress}
			/>
			{/* {hasAddress ? (
			) : (
				<Button onClick={addAddress}>Add Address Details</Button>
			)} */}
		</Stack>
	)
};

export const EditAddress = ({
	data,
	onDelete,
}: {
	data: EditAtom<Address>;
	onDelete?: () => void;
}) => {
	const countryCodeAtom = useMemo(() => focusAtom(data, o => o.prop("countryCode")), [data]);
	const postalCodeAtom = useMemo(() => focusAtom(data, o => o.prop("postalCode")), [data]);
	const addrAtom = useMemo(() => focusAtom(data, o => o.prop("addr")), [data]);

	return (
		<Stack>
			<Group>
				<Text fw="bold">Address</Text>
				{onDelete && (
					<Button
						onClick={onDelete}
						size="compact-xs"
						color="gray"
					>
						Clear
					</Button>
				)}
			</Group>

			<Stack gap={4}>
				<Stack gap={0}>
					<Input.Label>Full Address</Input.Label>
					<Input.Description>
						Street address, city, state/province, etc.
					</Input.Description>
				</Stack>
				<DeatomOptional
					component={ClearableTextInput}
					atom={addrAtom}
					set={() => ""}
					placeholder="123 Main St, Anytown, NY 12345"
				/>
			</Stack>

			<Grid>
				<Grid.Col span={6}>
					<Deatom
						component={CountryCodePicker}
						atom={countryCodeAtom}
					/>
				</Grid.Col>
				<Grid.Col span={6}>
					<Stack gap={4}>
						<Stack gap={0}>
							<Input.Label>Postal Code</Input.Label>
						</Stack>
						<DeatomOptional
							component={ClearableTextInput}
							atom={postalCodeAtom}
							set={() => ""}
							placeholder="12345"
						/>
					</Stack>
				</Grid.Col>
			</Grid>
		</Stack>
	)
};

export const CountryCodePicker = ({
	value,
	onChange,
}: {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
}) => {
	const userLanguage = useLocaleStore(store => store.language);

	return (
		<Stack gap={4}>
			<Stack gap={0}>
				<Input.Label>Country</Input.Label>
			</Stack>
			<Select
				data={COUNTRY_CODES.map(code => ({
					value: code,
					label: `${UtilCountryCode.toEmoji(code)} ${UtilCountryCode.getLabel(code, userLanguage)}`,
				}))}
				value={value ?? null}
				onChange={v => onChange(v || undefined)}
				placeholder="Set Country Code"
				searchable
				clearable
			/>
		</Stack>
	);
};
