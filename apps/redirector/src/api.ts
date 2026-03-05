const LocalStorageKey = "event-redirector:instance-url";
export const getInstanceUrl = () => localStorage.getItem(LocalStorageKey);
export const setInstanceUrl = (url: string) => localStorage.setItem(LocalStorageKey, url);
export const clearInstanceUrl = () => localStorage.removeItem(LocalStorageKey);

export const BroadcastChannelKey = "event-redirector:instance-url-updates";

export const DeveloperModeKey = "event-redirector:developer-mode";
export const IsDeveloperMode = (localStorage.getItem(DeveloperModeKey) === "true") || new URLSearchParams(window.location.search).has("dev");

export const debug = (IsDeveloperMode || new URLSearchParams(window.location.search).has("debug"))
	? (...a: any[]) => console.debug("%c[event.nya.pub]", "color: blue; font-weight: bold;", ...a)
	: () => { };
