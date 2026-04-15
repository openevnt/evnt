import { Button, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";

export const ServiceWorkerPrompt = () => {
	useEffect(() => {
		const refresh = registerSW({
			onNeedRefresh: () => {
				notifications.show({
					title: "Update Available",
					autoClose: false,
					message: (
						<Stack gap="xs" align="start">
							<Text>A new version of the app is available.</Text>
							<Button
								variant="light"
								onClick={() => refresh()}
								size="compact-sm"
							>
								Update
							</Button>
						</Stack>
					),
					color: "green",
				});
			},

			onOfflineReady: () => console.log("App is ready to work offline"),

			onRegisteredSW: () => console.log("Service worker registered"),
			onRegisterError: (error) => console.error("Service worker registration failed", error),
		});
	}, []);

	return null;
};