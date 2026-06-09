export * from "./types/Translations";
export * from "./types/PartialDate";
export * from "./types/Media";
export * from "./types/MediaSource";
export * from "./schemas/venue/Venue";
export * from "./schemas/OpenEvnt";
export * from "./schemas/instance/EventInstance";
export * from "./schemas/instance/EventActivity";
export * from "./schemas/enums/EventStatus";
export * from "./schemas/venue/PhysicalVenue";
export * from "./schemas/venue/OnlineVenue";
export * from "./schemas/venue/UnknownVenue";
export * from "./schemas/components/EventComponent";
export * from "./schemas/components/LinkComponent";
export * from "./schemas/components/SourceComponent";
export * from "./schemas/components/SplashMediaComponent";
export * from "./schemas/components/BlueSkyRichtextComponent";
export * from "./schemas/components/LanguagesComponent";
export * from "./schemas/components/MarkdownComponent";

// All canonical types come from @evnt/types
export * from "@evnt/types";

import type { $NSID } from "./schemas/OpenEvnt";
import type { OpenEvnt } from "@evnt/types";
import type { } from "@atcute/lexicons/ambient";
declare module "@atcute/lexicons/ambient" {
	interface Records {
		[$NSID]: OpenEvnt & { $type: typeof $NSID };
	}
}
