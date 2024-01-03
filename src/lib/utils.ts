import {
    BaseStateManager,
    CombinedDispatch,
    CombinedState,
    MapDispatchToProps,
    MapStateToProps,
    MergeProps,
    StateManagerMap,
} from "./types";

export const useCombinedState = <
    TManagers extends StateManagerMap<BaseStateManager>,
>(
    managers: TManagers,
) => {
    return Object.keys(managers).reduce(
        (acc, key) => ({
            ...acc,
            [key]: managers[key].useState(),
        }),
        {},
    ) as CombinedState<TManagers>;
};

export const useCombinedDispatch = <
    TManagers extends StateManagerMap<BaseStateManager>,
>(
    managers: TManagers,
) => {
    return Object.keys(managers).reduce(
        (acc, key) => ({
            ...acc,
            [key]: managers[key].useDispatch(),
        }),
        {},
    ) as CombinedDispatch<TManagers>;
};

export const getPropPipeline = <
    TManagers extends Record<string, BaseStateManager>,
    TOwnProps,
    TStateProps = {},
    TDispatchProps = {},
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
) => {
    return (
        combinedState: CombinedState<TManagers>,
        combinedDispatch: CombinedDispatch<TManagers>,
        ownProps: TOwnProps,
    ) => {
        let stateProps = {} as TStateProps;
        let dispatchProps = {} as TDispatchProps;

        if (mapStateToProps) {
            stateProps = mapStateToProps(combinedState, ownProps);
        }

        if (mapDispatchToProps) {
            dispatchProps = mapDispatchToProps(combinedDispatch, ownProps);
        }

        if (mergeProps) {
            return mergeProps(stateProps, dispatchProps, ownProps);
        } else {
            return {
                ...ownProps,
                ...stateProps,
                ...dispatchProps,
            } as TMergedProps;
        }
    };
};
