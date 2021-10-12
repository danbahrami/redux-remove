import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { createStateManager } from "../src";
import { actions, likesReducer } from "./__shared";

const likesManager = createStateManager("likes", likesReducer, { count: 5 });

const LikeButton = () => {
  const likes = likesManager.useSelector((s) => s.count);
  const dispatch = likesManager.useDispatch();

  return (
    <div>
      <span>{likes} likes</span>
      <button onClick={() => dispatch(actions.like())}>Like</button>
      <button onClick={() => dispatch(actions.dislike())}>Dislike</button>
      <button onClick={() => dispatch(actions.setLikesCount(-99))}>
        Hack the system
      </button>
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
