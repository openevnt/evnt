export interface Instance {
	name: string;
	description: string;
	url: string;
}

export interface InstancesJson {
	instances: Instance[];
}
