import type { LinkComponent } from "./LinkComponent";
import type { SourceComponent } from "./SourceComponent";
import type { SplashMediaComponent } from "./SplashMediaComponent";

export interface ComponentTypes {
	"directory.evnt.component.source": SourceComponent;
	"directory.evnt.component.link": LinkComponent;
	"directory.evnt.component.splashMedia": SplashMediaComponent;
};

export type KnownComponent = ComponentTypes[keyof ComponentTypes];
export type UnknownComponent = { $type: string & { _brand?: never } } & Record<string, unknown>;

export type Component<Type extends (keyof ComponentTypes | (string & {})) = keyof ComponentTypes> =
	Type extends keyof ComponentTypes ? ComponentTypes[Type] : UnknownComponent;

export type AnyComponent = Component<keyof ComponentTypes | (string & {})>;
