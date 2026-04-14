import type { Translations } from "@evnt/schema";
import { useTranslations } from "../../stores/useLocaleStore";

export const Trans = ({
    t,
}: {
    t?: Translations | null;
}) => {
    const resolve = useTranslations();

    return (
        <>
            {resolve(t)}
        </>
    );
};
