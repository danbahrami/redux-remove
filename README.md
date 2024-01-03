# Redux Remove

Redux Remove helps you gradually replace Redux with isolated state providers that are powered by React Context and `useReducer()`. The main idea is that reducers are no longer composed into a single reducer and provider at the top level of your app. Instead each reducer is wrapped in a state manager that can be composed together so you only using the parts of your application logic that you need.

Aside from breaking apart application state into composable chunks, the aim is to keep the API as similar as possible to `redux` and `react-redux` to ease the migration away from Redux. Eventually you won't need this library at all either and it will walk away knowing its job is done.

## Installation

```bash
# If you use npm:
npm install react-redux

# Or if you use Yarn:
yarn add react-redux
```

## Setup

In most Redux apps there is a single "Root" reducer that composes all your child reducers together.

```ts
import { combineReducers } from "redux";
import { likesReducer } from "/reducers/likes";
import { userReducer } from "/reducers/user";

const rootReducer = combineReducers({
    user: userReducer,
    likes: likesReducer,
});
```

### Defining your state managers

At first you'll want to leave all your Redux code as it is. You'll start by wrapping each reducer in a state manager. You can either write a new reducer from scratch or re-use the Redux reducer you already have.

```ts
import { createStateManager } from "redux-remove";
import { initialState, userReducer } from "/reducers/user";

export const userManager = createStateManager(userReducer, initialState);
```

### Putting your state into context

State managers have a context provider component. Any part or page of your app can compose only the providers it needs.

```tsx
import { likesManager } from "/state-managers/likes";
import { userManager } from "/state-managers/user";

const App = () => (
    <userManager.Provider>
        <likesManager.Provider>
            <Homepage />
        </likesManager.Provider>
    </userManager.Provider>
);
```

## Accessing state/dispatch via hooks

Any component nested under the `<userManager.Provider>` component has access to the user state in context. The state manager exposes state and dispatch via some hooks:

-   `useSelector(selectorFn)` accepts a selector function with receives the manager state and returns a value
-   `useDispatch()` returns the manager dispatch function

```tsx
import { userActions } from "/actions/user-actions";
import { userManager } from "/state-managers/user";

const Avatar = () => {
    const username = userManager.useSelector((state) => state.name);
    const dispatch = userManager.useDispatch();

    const renameUser = () => {
        dispatch(userActions.setUsername("Jimmy Spoons"));
    };

    return (
        <span>
            {username}
            <button onClick={renameUser}>Rename to "Jimmy Spoons"</button>
        </span>
    );
};
```

## The connect() HOC

Redux Remove gives you a `connect()` HOC that looks very similar to React Redux. The difference is that you need to provide it the state managers it cares about. It will only have access to the state of those managers.

Connect accepts the same three factory functions that React Redux does:

-   `mapStateToProps(state, ownProps): StateProps`
-   `mapDispatchToProps(dispatch, ownProps): DispatchProps`
-   `mergeProps(stateProps, dispatchProps, ownProps): MergeProps`

Let's look at a connector for a page component that combines data from two state managers `user` and `teams`.

### `mapStateToProps(state, ownProps): StateProps`

If we want to simply provide some state to the wrapped component we can pass a `mapStateToProps` function.

```ts
import { connect } from "redux-remove";
import { TeamPage } from "/components/TeamPage";
import { userManager } from "/state-managers/user";

const mapStateToProps = (state, ownProps) => ({
    user: state.user,
});

const ConnectedTeamPage = connect({ user: userManager, teams: teamsManager })(
    (state) => ({
        userName: state.user.name,
        teams: state.teams,
    }),
)(TeamPage);
```

Notice in the example above that the user state was accessible as `state.user` and the teams state was accessible as `state.teams`. The state is nested under the same keys that you use when passing the managers to `connect()`.

### `mapDispatchToProps(dispatch, ownProps): DispatchProps`

`mapDispatchToProps` is how we allow the wrapped component to dispatch actions to the state managers. The difference here from React Redux is that there is no longer one single `dispatch()` function that dispatches the action to every single reducer. Instead the `dispatch` argument is a map of dispatch functions, one for each manager you provide. This means that you must dispatch actions to each manager individually.

```ts
const ConnectedTeamPage = connect({ user: userManager, teams: teamManager })(
    undefined, // no need to pass mapStateToProps
    (dispatch) => ({
        joinTeam: (teamId: string) => {
            // tell the user manager the user has joined a team
            dispatch.user(actions.joinTeam(teamId));

            // tell the team manager the user has joined a team
            dispatch.team(actions.joinTeam(teamId));
        },
    }),
)(TeamPage);
```

### `mergeProps(stateProps, dispatchProps, ownProps): MergeProps`

`mergeProps` behaves exactly the same as React Redux and can be used to further combine the return values of `mapStateToProps` and `mapDispatchToProps`.

```ts
const ConnectedTeamPage = connect({ user: userManager, teams: teamManager })(
    (state) => ({
        userId: state.user.id,
        teams: state.teams,
    }),
    (dispatch) => ({
        joinTeam: (userId: string) => (teamId: string) => {
            dispatch.user(actions.joinTeam(teamId));
            dispatch.team(actions.joinTeam(teamId));
        },
    }),
    (stateProps, dispatchProps, ownProps) => ({
        ...ownProps,
        teams: stateProps.teams,
        joinTeam: dispatchProps.joinTeam(stateProps.userId),
    }),
)(TeamPage);
```

## Roadmap

-   Support dispatch middleware like `redux-thunk`
-   Performance testing
