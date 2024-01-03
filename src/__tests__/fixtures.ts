import { Reducer } from "react";

type LikesAction =
    | { type: "LIKE" }
    | { type: "DISLIKE" }
    | { type: "SET_LIKES_COUNT"; payload: number };

type UserAction =
    | { type: "SET_FORENAME"; payload: string }
    | { type: "SET_SURNAME"; payload: string };

type Action = LikesAction | UserAction;

type ActionCreator<TType extends Action["type"], TPayload = void> = (
    payload: TPayload,
) => Extract<Action, { type: TType }>;

const like: ActionCreator<"LIKE"> = () => ({ type: "LIKE" });
const dislike: ActionCreator<"DISLIKE"> = () => ({ type: "DISLIKE" });
const setLikesCount: ActionCreator<"SET_LIKES_COUNT", number> = (x) => ({
    type: "SET_LIKES_COUNT",
    payload: x,
});
const setForename: ActionCreator<"SET_FORENAME", string> = (x) => ({
    type: "SET_FORENAME",
    payload: x,
});
const setSurname: ActionCreator<"SET_SURNAME", string> = (x) => ({
    type: "SET_SURNAME",
    payload: x,
});

export const actions = {
    like,
    dislike,
    setLikesCount,
    setForename,
    setSurname,
};

export const likesReducer: Reducer<{ count: number }, LikesAction> = (
    state,
    action,
) => {
    switch (action.type) {
        case "LIKE":
            return { count: state.count + 1 };

        case "DISLIKE":
            return { count: state.count - 1 };

        case "SET_LIKES_COUNT":
            return { count: action.payload };

        default:
            return state;
    }
};

export const userReducer: Reducer<
    { forename: string; surname: string },
    UserAction
> = (state, action) => {
    switch (action.type) {
        case "SET_FORENAME":
            return { ...state, forename: action.payload };

        case "SET_SURNAME":
            return { ...state, surname: action.payload };

        default:
            return state;
    }
};
