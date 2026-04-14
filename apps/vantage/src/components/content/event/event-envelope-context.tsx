import { createContext, useContext, type PropsWithChildren } from "react";
import type { ResolvedEventEnvelope } from "~/db/models/resolved-event-envelope";

export interface ResolvedEventContext extends Omit<ResolvedEventEnvelope, "draft"> {
	isDraft?: boolean;
};

const ResolvedEventContext = createContext<ResolvedEventContext>({
	data: null,
});

export const useResolvedEvent = () => useContext(ResolvedEventContext);

export const ResolvedEventProvider = ({
	value,
	children,
}: PropsWithChildren<{ value: ResolvedEventEnvelope }>) => (
	<ResolvedEventContext.Provider value={{
		...value,
		isDraft: false,
	}}>
		{children}
	</ResolvedEventContext.Provider>
);
