# Redux Remove

A library to help you slowly replace Redux with React Context. The main idea is that reducers are no longer composed into a single reducer and provider at the top level of your app. Instead each reducer is wrapped in a state manager that can be composed together so you only using the parts of your application logic that you need.

Aside from breaking apart application state into composable chunks, the aim is to keep the API as similar as possible to `redux` and `react-redux` to ease the migration away from Redux. Eventually you won't need this library at all either and it will walk away knowing its job is done.

## Getting started

In most Redux apps there is a single "Root" reducer that composes all your child reducers together.

```js
import { combineReducers } from "redux";
import userReducer from "/reducers/user";
import likesReducer from "/reducers/likes";

const rootReducer = combineReducers({
  user: userReducer,
  likes: likesReducer,
});
```

### Defining your state managers

At first you'll want to leave all your Redux code as it is. You'll start by wrapping each reducer in a state manager.

```js
// /state-managers/user.js
import { createStateManager } from "redux-remove";
import userReducer, { initialState } from "/reducers/user";

export const userManager = createStateManager(
  "user", // this is the name of the state, that will be explained later
  userReducer,
  initialState
);
```

### Putting your state into context

State managers have a context provider component. Any part or page of your app can compose only the providers it needs.

```jsx
import userManager from "/state-managers/user";
import likesManager from "/state-managers/likes";

const App = () => (
  <userManager.Provider>
    <likesManager.Provider>
      <Homepage />
    </likesManager.Provider>
  </userManager.Provider>
);
```

### Accessing state/dispatch into via hooks

Any component nested under the `<userManager.Provider>` component has access to the user state in context. The state can be accessed via a hook

```jsx
import userManager from "/state-managers/user";
import userActions from "/actions/user-actions";

const UserAvatar = () => {
  const dispatch = userManager.useDispatch();
  const username = userManager.useSelector((state) => state.name);

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

### Accessing state into via the connect() HOC

Redux Remove gives you a `connect()` HOC that looks very similar to React Redux. The difference is that you need to provide it the state managers it cares about. It will only have access to the state of those managers and when an action is dispatched, only those reducers will receive the action.

```js
import { connect } from "redux-remove";
import userManager from "/state-managers/user";

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
});

const withUser = connect(userManager)(
  mapStateToProps
  // mapDispatchToProps,
  // mergeProps
);
```

`mapStateToProps`, `mapDispatchToProps` and `mergeProps` all have the same API as before so it's easy to swap in Redux Remove as a replacement.

#### Composing multiple state managers in connect()

You'll notice in the example above that the user state was accessible as `state.user`. That's because we gave the state manager the name "user" when we defined it.

The example passes a single state manager to `connect()` but you can also pass multiple managers in an array. The state for each manager will appear in the state object, nested under the name of its manager.

```jsx
import { connect } from "redux-remove";
import userManager from "/state-managers/user";
import likesManager from "/state-managers/likes";

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
  likes: state.likes,
});

const withUserAndLikes = connect([userManager, likesManager])(mapStateToProps);
```

## Still todo

- Support dispatch middleware like `redux-thunk`
- Performance testing
