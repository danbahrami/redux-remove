import type {
    Consumer,
    Context,
    Dispatch,
    FunctionComponent,
    ReactNode,
} from "react";
import { InferableComponentEnhancerWithProps } from "react-redux";

export type BaseStateManager = StateManager<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type ContextValue<TState, TAction> = {
    state: TState;
    dispatch: Dispatch<TAction>;
};

export type ProviderContext<TState, TAction> = Context<
    ContextValue<TState, TAction>
>;

export type StateManager<TState, TAction> = {
    Provider: FunctionComponent<{ children: ReactNode }>;
    Consumer: Consumer<ContextValue<TState, TAction>>;
    useState: () => TState;
    useDispatch: () => Dispatch<TAction>;
    useSelector: <TOutput>(fn: (state: TState) => TOutput) => TOutput;
};

export type StateManagerMap<TManager extends BaseStateManager> = Record<
    string,
    TManager
>;

export type StateManagerAction<T> = T extends StateManager<
    unknown,
    infer Action
>
    ? Action
    : T;

export type CombinedState<TManagers extends Record<string, BaseStateManager>> =
    {
        [Property in keyof TManagers]: ReturnType<
            TManagers[Property]["useState"]
        >;
    };

export type CombinedDispatch<
    TManagers extends Record<string, BaseStateManager>,
> = {
    [Property in keyof TManagers]: ReturnType<
        TManagers[Property]["useDispatch"]
    >;
};

export type MapStateToProps<
    TManagers extends Record<string, BaseStateManager>,
    TStateProps,
    TOwnProps,
> = (state: CombinedState<TManagers>, ownProps: TOwnProps) => TStateProps;

export type MapDispatchToProps<
    TManagers extends Record<string, BaseStateManager>,
    TDispatchProps,
    TOwnProps,
> = (
    dispatch: CombinedDispatch<TManagers>,
    ownProps: TOwnProps,
) => TDispatchProps;

export type MergeProps<TStateProps, TDispatchProps, TMergedProps, TOwnProps> = (
    stateProps: TStateProps,
    dispatchProps: TDispatchProps,
    ownProps: TOwnProps,
) => TMergedProps;

export interface ConnectEnhancerFactory<
    TManagers extends Record<string, BaseStateManager>,
> {
    /**
     * No factory functions
     */
    (): InferableComponentEnhancerWithProps<{}, {}>;

    /**
     * mapStateToProps only
     */
    <TStateProps = {}, TOwnProps = {}>(
        mapStateToProps: MapStateToProps<TManagers, TStateProps, TOwnProps>,
    ): InferableComponentEnhancerWithProps<TStateProps, TOwnProps>;

    /**
     * mapDispatchToProps only
     */
    <TDispatchProps = {}, TOwnProps = {}>(
        mapStateToProps: null | undefined,
        mapDispatchToProps: MapDispatchToProps<
            TManagers,
            TDispatchProps,
            TOwnProps
        >,
    ): InferableComponentEnhancerWithProps<TDispatchProps, TOwnProps>;

    /**
     * mergeProps only
     */
    <TOwnProps = {}, TMergedProps = {}>(
        mapStateToProps: null | undefined,
        mapDispatchToProps: null | undefined,
        mergeProps: MergeProps<undefined, undefined, TMergedProps, TOwnProps>,
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

    /**
     * mapStateToProps and mapDispatchToProps
     */
    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}>(
        mapStateToProps: MapStateToProps<TManagers, TStateProps, TOwnProps>,
        mapDispatchToProps: MapDispatchToProps<
            TManagers,
            TDispatchProps,
            TOwnProps
        >,
    ): InferableComponentEnhancerWithProps<
        TStateProps & TDispatchProps,
        TOwnProps
    >;

    /**
     * mapStateToProps and mergeProps
     */
    <TStateProps = {}, TOwnProps = {}, TMergedProps = {}>(
        mapStateToProps: MapStateToProps<TManagers, TStateProps, TOwnProps>,
        mapDispatchToProps: null | undefined,
        mergeProps: MergeProps<TStateProps, undefined, TMergedProps, TOwnProps>,
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

    /**
     * mapDispatchToProps and mergeProps
     */
    <TDispatchProps = {}, TOwnProps = {}, TMergedProps = {}>(
        mapStateToProps: null | undefined,
        mapDispatchToProps: MapDispatchToProps<
            TManagers,
            TDispatchProps,
            TOwnProps
        >,
        mergeProps: MergeProps<
            undefined,
            TDispatchProps,
            TMergedProps,
            TOwnProps
        >,
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

    /**
     * all three factory functions
     */
    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, TMergedProps = {}>(
        mapStateToProps: MapStateToProps<TManagers, TStateProps, TOwnProps>,
        mapDispatchToProps: MapDispatchToProps<
            TManagers,
            TDispatchProps,
            TOwnProps
        >,
        mergeProps: MergeProps<
            TStateProps,
            TDispatchProps,
            TMergedProps,
            TOwnProps
        >,
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;
}

export type Connect = <TManagers extends Record<string, BaseStateManager>>(
    managers: TManagers,
) => ConnectEnhancerFactory<TManagers>;
