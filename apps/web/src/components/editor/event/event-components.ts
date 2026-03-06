import type { KnownEventComponent, Translations } from "@evnt/schema";
import { IconExternalLink, IconLink, IconPhoto } from "@tabler/icons-react";
import type { FC } from "react";
import type { EditAtom } from "../edit-atom";
import { EditComponentLink } from "./components/EditComponentLink";
import { EditComponentSource } from "./components/EditComponentSource";
import { EditComponentSplashMedia } from "./components/EditComponentSplashMedia";

export const EventComponentRegistry: {
	[Type in KnownEventComponent["type"]]?: {
		label: Translations;
		desc?: Translations;
		icon: FC<{ size?: number }> | any; // Stupid typescript
		createData?: KnownEventComponent;
		editComponent?: FC<{ data: EditAtom<(KnownEventComponent & { type: Type })["data"]> }>;
	};
} = {
	link: {
		label: { en: "Link" },
		desc: { en: "Registration page, livestream, competition forms etc." },
		icon: IconLink,
		createData: { type: "link", data: { url: "" } },
		editComponent: EditComponentLink,
	},
	source: {
		label: { en: "Source" },
		desc: { en: "Canonical source of the event; official website, social media page etc." },
		icon: IconExternalLink,
		createData: { type: "source", data: { url: "" } },
		editComponent: EditComponentSource,
	},
	splashMedia: {
		label: { en: "Splash Media" },
		desc: { en: "Main media representing the event, shown in the header and event cards." },
		icon: IconPhoto,
		createData: { type: "splashMedia", data: { media: { sources: [] }, roles: [] } },
		editComponent: EditComponentSplashMedia,
	},
};
