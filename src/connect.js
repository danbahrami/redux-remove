import React from "react";

// const buildStateFromManager = manager => {
//   if (!)
// }
const getPropPipeline = (mapStateToProps) => {
  return (state, ownProps) => {
    let finalProps = ownProps;

    if (mapStateToProps) {
      finalProps = mapStateToProps(state, ownProps);
    }

    return finalProps;
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
      if (state) {
        state = { [manager.name]: state };
      }

      const propPipeline = getPropPipeline(mapStateToProps);

      return <Component {...propPipeline(state, props)} />;
    };

    return WrappedComponent;
  };

export default connect;
