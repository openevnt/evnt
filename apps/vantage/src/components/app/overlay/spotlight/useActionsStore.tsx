import { create } from "zustand";

export interface Action {
	label?: string;
	icon?: React.ReactNode;
	disabled?: boolean;
	category?: string;
	execute?: () => void;
	special?: {
		href?: string;
		color?: string;
	};
};

export interface ActionsStore {
	actions: Record<string, Action>;
};

export const useActionsStore = create<ActionsStore>(() => ({
	actions: {},
}));
