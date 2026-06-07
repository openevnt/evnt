import type { Media } from "../../types/Media";


export namespace SplashMediaComponent {
	export interface Roles {
		background: void;
		poster: void;
		banner: void;
	};

	export type SplashMediaRole = keyof Roles | (string & {});
};

export interface SplashMediaComponent {
	$type: "directory.evnt.component.splashMedia";
	roles: SplashMediaComponent.SplashMediaRole[];
	media: Media;
};
