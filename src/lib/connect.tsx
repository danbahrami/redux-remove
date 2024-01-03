import { ComponentType } from "react";
import {
    BaseStateManager,
    Connect,
    MapDispatchToProps,
    MapStateToProps,
    MergeProps,
} from "./types";
import {
    getPropPipeline,
    useCombinedDispatch,
    useCombinedState,
} from "./utils";

const connect =
    <TManagers extends Record<string, BaseStateManager>>(managers: TManagers) =>
    <
        TStateProps = {},
        TDispatchProps = {},
        TOwnProps = {},
        TMergedProps = TOwnProps & TStateProps & TDispatchProps,
    >(
        mapStateToProps?: MapStateToProps<TManagers, TStateProps, TOwnProps>,
        mapDispatchToProps?: MapDispatchToProps<
            TManagers,
            TDispatchProps,
            TOwnProps
        >,
        mergeProps?: MergeProps<
            TStateProps,
            TDispatchProps,
            TMergedProps,
            TOwnProps
        >,
    ) =>
    (Component: ComponentType<TMergedProps>) => {
        const WrappedComponent = (ownProps: TOwnProps) => {
            const state = useCombinedState(managers);
            const dispatch = useCombinedDispatch(managers);

            const props = getPropPipeline(
                mapStateToProps,
                mapDispatchToProps,
                mergeProps,
            )(state, dispatch, ownProps);

            return <Component {...(props as any)} />; // eslint-disable-line @typescript-eslint/no-explicit-any
        };

        return WrappedComponent;
    };

export default connect as Connect;
