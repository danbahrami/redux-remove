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

const createStateManager = (name, reducer, initialState) => {
  const Context = React.createContext();

  const Provider = createProvider(reducer, initialState, Context);

  const useSelector = (fn) => {
    const { state } = React.useContext(Context);
    return fn(state);
  };

  const useDispatch = () => {
    return React.useContext(Context).dispatch;
  };

  return {
    Provider,
    useSelector,
    useDispatch,
    name,
  };
};

export default createStateManager;
