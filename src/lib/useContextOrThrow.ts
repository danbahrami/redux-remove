import { Context, useContext } from "react";
import { MissingManagerError } from "./error";

export const useContextOrThrow = <T>(Context: Context<T>): T => {
    const context = useContext(Context);

    if (!context) {
        throw new MissingManagerError();
    }

    return context;
};
