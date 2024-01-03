import connect from "./connect";
import { createStateManager } from "./createStateManager";
import { MissingManagerError } from "./error";
import type {
    CombinedDispatch,
    CombinedState,
    ProviderContext,
    StateManager,
} from "./types";

export { createStateManager, MissingManagerError, connect };

export type { ProviderContext, StateManager, CombinedDispatch, CombinedState };
