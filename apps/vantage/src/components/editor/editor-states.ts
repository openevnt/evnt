import { create } from "zustand";

export interface EditorCollapseState {
	collapsed: string[];
}

export const useEditorCollapseState = create<EditorCollapseState>()((set, get) => ({
	collapsed: [] as string[],
}));


