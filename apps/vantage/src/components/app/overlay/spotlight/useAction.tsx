import { useId } from "@mantine/hooks";
import { useActionsStore, type Action } from "./useActionsStore";
import { useEffect } from "react";

export type ProvidableAction = Action & {
	id?: string;
	deps?: React.DependencyList;
};

export const useProvideAction = (
	action: ProvidableAction,
) => {
	const generatedId = useId();
	const actionId = action.id ?? generatedId;

	useEffect(() => {
		if (!action.disabled) useActionsStore.setState(state => ({
			actions: {
				...state.actions,
				[actionId]: action,
			},
		}));

		return () => {
			useActionsStore.setState(state => {
				const newActions = { ...state.actions };
				delete newActions[actionId];
				return { actions: newActions };
			});
		};
	}, action.deps ?? []);

	return null;
};

export const useProvideActionList = (
	actions: ProvidableAction[],
) => {
	const generatedIdPrefix = useId();

	useEffect(() => {
		actions.forEach((action, i) => {
			const generatedId = `${generatedIdPrefix}-${i}`;
			const actionId = action.id ?? generatedId;

			if (!action.disabled) useActionsStore.setState(state => ({
				actions: {
					...state.actions,
					[actionId]: action,
				},
			}));
		});

		return () => {
			useActionsStore.setState(state => {
				const newActions = { ...state.actions };
				actions.forEach((action, i) => {
					const generatedId = `${generatedIdPrefix}-${i}`;
					const actionId = action.id ?? generatedId;
					delete newActions[actionId];
				});
				return { actions: newActions };
			});
		};
	}, [generatedIdPrefix]);

	return null;
};

export const useResolvedAction = (id: string) => {
	return useActionsStore(state => state.actions[id]) ?? null;
};

