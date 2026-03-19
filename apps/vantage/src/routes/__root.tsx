import { MantineProvider } from "@mantine/core";
import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { Notifications } from "@mantine/notifications";
import { contextModals } from "../components/app/modals/modals";
import { ModalsProvider } from "@mantine/modals";
import { QueryClientProvider } from "@tanstack/react-query";
import { DatesProvider } from "@mantine/dates";
import { useLocaleStore } from "../stores/useLocaleStore";
import { useMemo, type ComponentType, type PropsWithChildren } from "react";
import { queryClient } from "../query-client";
import { theme } from "../styles/theme";

export const Route = createRootRoute({
	component: RootPage,
	beforeLoad: async ({ search }) => {
		const intent = (search as {
			type?: "event",
			url?: string;
			at?: string;
			data?: any;
		});

		if (intent.type === "event") {
			const source = intent.at || intent.url;
			console.log("Opening event details for url", source);
			throw redirect({
				to: "/event",
				search: {
					source,
				},
			});
		};
	},
});

export function RootPage() {
	const userLanguage = useLocaleStore(store => store.language);

	const datesProviderSettings = useMemo(() => ({
		locale: userLanguage,
		consistentWeeks: true,
		firstDayOfWeek: 1,
	}), [userLanguage]);

	return (
		<ProviderStack
			providers={[
				[MantineProvider, { forceColorScheme: "dark", theme }],
				[QueryClientProvider, { client: queryClient }],
				[ModalsProvider, { modals: contextModals }],
				[DatesProvider, { settings: datesProviderSettings }],
			]}
		>
			<Notifications />
			<Outlet />
		</ProviderStack>
	);
}

type ProviderEntry<T = any> = [React.FC<T>, T];
interface ProviderStackProps<T extends ProviderEntry[]> extends PropsWithChildren {
	providers: [...T];
};
export const ProviderStack = <T extends ProviderEntry[]>({
	providers,
	children,
}: ProviderStackProps<T>) => {
	return (
		<>
			{providers.reduceRight((acc, [Provider, props]) => {
				return <Provider {...props}>{acc}</Provider>;
			}, children)}
		</>
	);
};
