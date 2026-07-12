import type { LinkComponent } from "./LinkComponent";
import type { SourceComponent } from "./SourceComponent";
import type { SplashMediaComponent } from "./SplashMediaComponent";
import type { LanguagesComponent } from "./LanguagesComponent";
import type { RichTextMarkdownComponent } from "./richtext/RichTextMarkdownComponent";
import type { RichTextBlueskyComponent } from "./richtext/RichTextBlueskyComponent";

export interface ComponentTypes {
	"directory.evnt.component.source": SourceComponent;
	"directory.evnt.component.link": LinkComponent;
	"directory.evnt.component.splashMedia": SplashMediaComponent;
	"directory.evnt.component.languages": LanguagesComponent;
	"directory.evnt.richtext.markdown": RichTextMarkdownComponent;
	"directory.evnt.richtext.bluesky": RichTextBlueskyComponent;
};

export type KnownComponent = ComponentTypes[keyof ComponentTypes];
export type UnknownComponent = { $type: string & { _brand?: never } } & Record<string, unknown>;

export type Component<Type extends (keyof ComponentTypes | (string & {})) = keyof ComponentTypes> =
	Type extends keyof ComponentTypes ? ComponentTypes[Type] : UnknownComponent;

export type AnyComponent = KnownComponent | UnknownComponent;
