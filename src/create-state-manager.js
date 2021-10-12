import React from "react";

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

class MissingManagerError extends Error {
  constructor(name) {
    const message = `No ${name} manager found in context. This is probably because the component is not wrapped in the correct state provider.`;
    super(message);
  }
}

const useContextOrThrow = (Context) => {
  const context = React.useContext(Context);

  if (!context) {
    throw new MissingManagerError(name);
  }

  return context;
};

const createStateManager = (name, reducer, initialState) => {
  const Context = React.createContext();

  const Provider = createProvider(reducer, initialState, Context);

  const useState = () => useContextOrThrow(Context).state;
  const useDispatch = () => useContextOrThrow(Context).dispatch;
  const useSelector = (fn) => fn(useContextOrThrow(Context).state);

  return {
    name,
    Provider,
    useState,
    useDispatch,
    useSelector,
  };
};

export default createStateManager;
