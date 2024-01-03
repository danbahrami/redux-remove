import React from "react";
import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { createStateManager } from "../lib";
import { actions, likesReducer } from "./fixtures";

const likesManager = createStateManager(likesReducer, { count: 5 });

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <likesManager.Provider>{children}</likesManager.Provider>
);

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
    test("it provides a reducer context", async () => {
        const { getAllByRole, getByText } = render(<LikeButton />, { wrapper });

        const buttons = getAllByRole("button");

        expect(getByText("5 likes")).toBeInTheDocument();

        // Let's click some buttons and chack that
        // the reducer is correctly updating state
        userEvent.click(buttons[0]);
        await waitFor(() => {
            expect(getByText("6 likes")).toBeInTheDocument();
        });

        userEvent.click(buttons[1]);
        await waitFor(() => {
            expect(getByText("5 likes")).toBeInTheDocument();
        });

        userEvent.click(buttons[2]);
        await waitFor(() => {
            expect(getByText("-99 likes")).toBeInTheDocument();
        });
    });
});
