import {
    FunctionComponent,
    ReactNode,
    Reducer,
    createContext,
    useReducer,
} from "react";
import type { ContextValue, StateManager } from "./types";
import { useContextOrThrow } from "./useContextOrThrow";

export const createStateManager = <TState, TAction>(
    reducer: Reducer<TState, TAction>,
    initialState: TState,
): StateManager<TState, TAction> => {
    const context = createContext<ContextValue<TState, TAction>>({
        state: initialState,
        dispatch: () => initialState,
    });

    const Provider: FunctionComponent<{ children: ReactNode }> = ({
        children,
    }) => {
        const [state, dispatch] = useReducer(reducer, initialState);

        return (
            <context.Provider value={{ state, dispatch }}>
                {children}
            </context.Provider>
        );
    };
    Provider.displayName = `ReduxRemoveProvider`;

    return {
        Provider,
        Consumer: context.Consumer,
        useState: () => useContextOrThrow(context).state,
        useDispatch: () => useContextOrThrow(context).dispatch,
        useSelector: (fn) => fn(useContextOrThrow(context).state),
    };
};
