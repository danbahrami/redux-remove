import React from "react";
import { MissingManagerError } from "./error";

const createProvider =
  (reducer, initialState, context) =>
  ({ children }) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    return (
      <context.Provider value={{ state, dispatch }}>
        {children}
      </context.Provider>
    );
  };

const useContextOrThrow = (Context) => {
  const context = React.useContext(Context);

  if (!context) {
    throw new MissingManagerError(name);
  }

  return context;
};

const createStateManager = (name, reducer, initialState) => {
  const Context = React.createContext();

  const Consumer = Context.Consumer;
  const Provider = createProvider(reducer, initialState, Context);

  const useState = () => useContextOrThrow(Context).state;
  const useDispatch = () => useContextOrThrow(Context).dispatch;
  const useSelector = (fn) => fn(useContextOrThrow(Context).state);

  return {
    name,
    Provider,
    Consumer,
    useState,
    useDispatch,
    useSelector,
  };
};

export default createStateManager;
