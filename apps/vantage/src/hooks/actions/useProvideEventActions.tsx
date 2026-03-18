import { useProvideActionList } from "../../components/app/overlay/spotlight/useAction";
import { UtilEventSource, type EventSource } from "../../db/models/event-source";
import { handleAsyncCopy, handleCopy } from "../../lib/util/copy";
import { EventResolver } from "../../db/event-resolver";
import { IconBraces, IconClipboard, IconCode, IconEdit, IconJson, IconMarkdown, IconQrcode, IconReload, IconShare, IconTrash } from "@tabler/icons-react";
import { EventActions } from "../../lib/actions/event-actions";
import { useNavigate } from "@tanstack/react-router";
import { Code } from "@mantine/core";
import { QRCode } from "../../lib/util/qrcode";
import { modals } from "@mantine/modals";
import { DataDB } from "../../db/data-db";
import { PDSlsIcon } from "../../lib/resources/PDSlsIcon";
import { AsyncLoader } from "../../components/data/AsyncLoader";
import { openConfirmModal, withConfirmation } from "../../lib/util/confirm";

export const EventActionFactory = {
	All: ({
		source,
		navigate,
	}: {
		source: EventSource;
		navigate: ReturnType<typeof useNavigate>;
	}) => [
			EventActionFactory.Edit(navigate, source),
			EventActionFactory.CopyShareLink(source),
			EventActionFactory.CopyMarkdownLink(source),
			EventActionFactory.ShareLinkQRCode(source),
			EventActionFactory.CopySource(source),
			EventActionFactory.CopyJSON(source),
			EventActionFactory.ViewJSON(source),
			EventActionFactory.RefetchData(source),
			EventActionFactory.CopyEmbedLink(source),
			EventActionFactory.ViewOnPDS(source),
			EventActionFactory.Delete(source),
		],

	Edit: (navigate: ReturnType<typeof useNavigate>, source: EventSource) => ({
		label: "Edit",
		icon: <IconEdit />,
		disabled: !UtilEventSource.isEditable(source),
		category: "Event",
		execute: () => navigate({
			to: "/edit",
			search: {
				source,
			},
		}),
	}),
	CopyShareLink: (source: EventSource) => ({
		label: "Copy Share Link",
		icon: <IconShare />,
		disabled: !UtilEventSource.isFromNetwork(source),
		category: "Event",
		execute: handleCopy(
			EventActions.getShareLink(source) ?? "",
			"Event share link copied to clipboard",
		),
		id: "copy-event-share-link",
		deps: [source],
	}),
	CopyMarkdownLink: (source: EventSource) => ({
		label: "Copy Markdown Link",
		icon: <IconMarkdown />,
		disabled: !UtilEventSource.isFromNetwork(source),
		category: "Event",
		execute: handleAsyncCopy(
			async () => {
				const data = (await DataDB.get(source))?.data;
				const name = data?.name["en"] ?? data?.name[Object.keys(data.name)[0]!] ?? "Event";
				return `[${name}](${EventActions.getShareLink(source)!})`;
			},
			"Event share link copied to clipboard",
		),
		id: "copy-event-markdown-link",
		deps: [source],
	}),
	ShareLinkQRCode: (source: EventSource) => ({
		label: "Share (QR)",
		icon: <IconQrcode />,
		disabled: !UtilEventSource.isFromNetwork(source),
		category: "Event",
		execute: () => modals.open({
			size: "md",
			children: (
				<QRCode value={EventActions.getShareLink(source)} />
			),
		}),
		id: "share-link-qrcode",
		deps: [source],
	}),
	CopySource: (source: EventSource) => ({
		label: UtilEventSource.isAt(source) ? "Copy at-URI" : "Copy Source",
		icon: <IconClipboard />,
		disabled: !UtilEventSource.isFromNetwork(source),
		category: "Event",
		execute: handleCopy(
			source,
			"Event source copied to clipboard",
		),
		id: "copy-event-source",
		deps: [source],
	}),
	CopyJSON: (source: EventSource) => ({
		label: "Copy JSON",
		category: "Event",
		icon: <IconBraces />,
		execute: handleAsyncCopy(
			async (): Promise<string> => JSON.stringify((await DataDB.get(source))?.data, null, 2) ?? "",
			"Event JSON copied to clipboard",
		),
		id: "copy-event-json",
		deps: [source],
	}),
	ViewJSON: (source: EventSource) => ({
		label: "View JSON",
		category: "Event",
		icon: <IconJson />,
		execute: () => modals.open({
			size: "xl",
			title: "Event JSON Data",
			children: (
				<AsyncLoader fetcher={() => DataDB.get(source)}>
					{(data) => (
						<Code block>
							{JSON.stringify(data?.data, null, 2) ?? "No data"}
						</Code>
					)}
				</AsyncLoader>
			),
		}),
		id: "view-event-json",
		deps: [source],
	}),
	RefetchData: (source: EventSource) => ({
		label: "Refetch",
		category: "Event",
		icon: <IconReload />,
		disabled: !UtilEventSource.isFromNetwork(source),
		execute: () => EventResolver.update(source),
		id: "refetch-event",
		deps: [source],
	}),
	CopyEmbedLink: (source: EventSource) => ({
		label: "Copy Embed Link",
		category: "Event",
		icon: <IconCode />,
		disabled: !UtilEventSource.isFromNetwork(source),
		execute: handleCopy(
			EventActions.getEmbedLink(source) ?? "",
			"Event embed link copied to clipboard",
		),
		id: "copy-event-embed-link",
		deps: [source],
	}),
	ViewOnPDS: (source: EventSource) => ({
		label: "View on pds.ls",
		category: "Event",
		icon: <PDSlsIcon />,
		disabled: UtilEventSource.getType(source) !== "at",
		execute: () => window.open(`https://pds.ls/${source}`, "_blank"),
		special: {
			href: `https://pds.ls/${source}`,
		},
	}),
	Delete: (source: EventSource) => ({
		label: UtilEventSource.isLocal(source) ? "Delete" : "Remove",
		category: "Event",
		icon: <IconTrash />,
		disabled: UtilEventSource.isAt(source),
		execute: () => openConfirmModal(
			UtilEventSource.isLocal(source) ? "Are you sure you want to delete this event?" : "Are you sure you want to stop following this event?",
			() => EventActions.deleteEvent(source),
		),
		id: "delete-event",
		special: {
			color: "red",
		},
		deps: [source],
	}),
};

export const useProvideEventActions = ({
	source,
}: {
	source: EventSource;
}) => {
	const navigate = useNavigate();
	useProvideActionList(EventActionFactory.All({
		source,
		navigate,
	}));
};
