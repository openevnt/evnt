export namespace LanguagesComponent {
	export interface LanguageInfo {
		code: string;
	};
};

export interface LanguagesComponent {
	$type: "directory.evnt.component.languages";
	languages: LanguagesComponent.LanguageInfo[];
};
