const like = () => ({ type: "LIKE" });
const dislike = () => ({ type: "DISLIKE" });
const setLikesCount = (x) => ({ type: "SET_LIKES_COUNT", payload: x });
const setForename = (x) => ({ type: "SET_FORENAME", payload: x });
const setSurname = (x) => ({ type: "SET_SURNAME", payload: x });

export const actions = {
  like,
  dislike,
  setLikesCount,
  setForename,
  setSurname,
};

export const likesReducer = (state, action) => {
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

export const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_FORENAME":
      return { ...state, forename: action.payload };

    case "SET_SURNAME":
      return { ...state, surname: action.payload };

    default:
      return state;
  }
};
