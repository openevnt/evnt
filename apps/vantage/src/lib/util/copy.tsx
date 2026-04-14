import type { Translations } from "@evnt/schema";
import { notifications } from "@mantine/notifications";
import { Trans } from "../../components/content/Trans";

export const copyWithFeedback = async (
    text: string,
    feedback: Translations | string = "Copied to clipboard",
) => {
    try {
        await navigator.clipboard.writeText(text);
        if (feedback) {
            notifications.show({
                message: (typeof feedback === "string" ? feedback : <Trans t={feedback} />),
                color: "green",
            });
        }
    } catch (err) {
        console.error("Failed to copy text: ", err);
        notifications.show({
            title: "Copy failed",
            message: "Failed to copy text to clipboard.",
            color: "red",
        });
    }
};

export const handleCopy = (text: string, feedback?: string | Translations) => () => copyWithFeedback(text, feedback);

export const handleAsyncCopy = (
	getText: () => Promise<string>,
	feedback?: string | Translations,
) => async () => {
	const text = await getText();
	return copyWithFeedback(text, feedback);
}
