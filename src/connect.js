import React from "react";

const getPropPipeline = (mapStateToProps, mapDispatchToProps) => {
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

const connect =
  (manager = emptyManager) =>
  (mapStateToProps, mapDispatchToProps, mergeProps) =>
  (Component) => {
    const WrappedComponent = (props) => {
      let state = manager.useState();
      let dispatch = manager.useDispatch();
      if (state) {
        state = { [manager.name]: state };
      }

      const propPipeline = getPropPipeline(mapStateToProps, mapDispatchToProps);

      return <Component {...propPipeline(state, dispatch, props)} />;
    };

    return WrappedComponent;
  };

export default connect;
