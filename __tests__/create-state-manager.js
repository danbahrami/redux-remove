import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { createStateManager } from "../src";

const increment = () => ({ type: "INCREMENT" });
const decrement = () => ({ type: "DECREMENT" });
const setCount = (x) => ({ type: "SET_COUNT", payload: x });

const reducer = (state, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };

    case "DECREMENT":
      return { count: state.count - 1 };

    case "SET_COUNT":
      return { count: action.payload };

    default:
      return state;
  }
};

const likesManager = createStateManager("likes", reducer, { count: 5 });

const LikeButton = () => {
  const likes = likesManager.useSelector((s) => s.count);
  const dispatch = likesManager.useDispatch();

  return (
    <div>
      <span>{likes} likes</span>
      <button onClick={() => dispatch(increment())}>Like</button>
      <button onClick={() => dispatch(decrement())}>Dislike</button>
      <button onClick={() => dispatch(setCount(-99))}>Hack the system</button>
    </div>
  );
};

describe("createStateManager()", () => {
  it("provides a reducer context", () => {
    const { container, getByTestId, getAllByRole, rerender, getByText } =
      render(
        <likesManager.Provider>
          <div>
            <LikeButton />
          </div>
        </likesManager.Provider>
      );

    const buttons = getAllByRole("button");

    expect(getByText("5 likes")).toBeInTheDocument();

    // Let's click some buttons and chack that
    // the reducer is correctly updating state
    userEvent.click(buttons[0]);
    expect(getByText("6 likes")).toBeInTheDocument();

    userEvent.click(buttons[1]);
    expect(getByText("5 likes")).toBeInTheDocument();

    userEvent.click(buttons[2]);
    expect(getByText("-99 likes")).toBeInTheDocument();
  });

  it("exposes its name publically", () => {
    expect(likesManager.name).toBe("likes");
  });
});
