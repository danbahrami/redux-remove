import React from "react";

const connect =
  (managers) =>
  (mapStateToProps, mapDispatchToProps, mergeProps) =>
  (Component) => {
    const WrappedComponent = (props) => {
      return <Component {...props} />;
    };

    return WrappedComponent;
  };

export default connect;
