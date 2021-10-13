import React from "react";
import { MissingManagerError } from "./error";

const getPropPipeline = (mapStateToProps, mapDispatchToProps, mergeProps) => {
  return (state, dispatch, ownProps) => {
    let finalProps = ownProps;
    let stateProps = {};
    let dispatchProps = {};

    if (mapStateToProps) {
      stateProps = mapStateToProps(state, ownProps);
    }

    if (mapDispatchToProps) {
      dispatchProps = mapDispatchToProps(dispatch, ownProps);
    }

    if (mergeProps) {
      return mergeProps(stateProps, dispatchProps, ownProps);
    }

    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
    };
  };
};

const emptyManager = {
  useState: () => undefined,
};

const RecursiveConsumer = ({ children, managers, state, dispatch }) => {
  const manager = managers[0];
  const Consumer = manager.Consumer;
  const remainingManagers = managers.slice(1);

  return (
    <Consumer>
      {(value) => {
        if (!value) {
          throw new MissingManagerError(manager.name);
        }

        const nextState = {
          ...state,
          [manager.name]: value.state,
        };

        const nextDispatch = (action) => {
          dispatch(action);
          value.dispatch(action);
        };

        if (remainingManagers.length === 0) {
          return children({ state: nextState, dispatch: nextDispatch });
        }

        return (
          <RecursiveConsumer
            state={nextState}
            dispatch={nextDispatch}
            managers={remainingManagers}
          >
            {children}
          </RecursiveConsumer>
        );
      }}
    </Consumer>
  );
};

const connect =
  (managers) =>
  (mapStateToProps, mapDispatchToProps, mergeProps) =>
  (Component) => {
    const WrappedComponent = (props) => {
      const propPipeline = getPropPipeline(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
      );

      if (!managers) {
        return <Component {...propPipeline({}, () => {}, props)} />;
      }

      const _managers = Array.isArray(managers) ? managers : [managers];

      return (
        <RecursiveConsumer managers={_managers} state={{}} dispatch={() => {}}>
          {({ state, dispatch }) => (
            <Component {...propPipeline(state, dispatch, props)} />
          )}
        </RecursiveConsumer>
      );
    };

    return WrappedComponent;
  };

export default connect;
