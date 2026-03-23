declare module "virtual:instances" {
	export const instances: InstancesManifest;

	export interface InstancesManifest {
		instances: InstanceInfo[];
	}

	export interface InstanceInfo {
		url: string;
		name?: string;
		description?: string;
		redirectTo?: string;
		faviconUrl?: string;
		faviconRadius?: number;
		capabilities: string[];
	}
}