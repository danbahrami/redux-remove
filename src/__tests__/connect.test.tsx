import React from "react";
import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { connect, createStateManager } from "../lib";
import { CombinedDispatch, CombinedState } from "../lib/types";
import { actions, likesReducer, userReducer } from "./fixtures";

type AvatarProps = {
    name: string;
    color: string;
    size: "s" | "m" | "l";
    onEdit: () => void;
};

const Avatar: React.FC<AvatarProps> = ({ name, color, size, onEdit }) => (
    <div>
        <span data-testid="avatar" className={`color-${color} size-${size}`}>
            {name}
        </span>
        <button onClick={onEdit}>Edit</button>
    </div>
);

const initialUserState = { forename: "Susan", surname: "Barnes" };
const initialLikesState = { count: 5 };

const userManager = createStateManager(userReducer, initialUserState);
const likesManager = createStateManager(likesReducer, initialLikesState);

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <userManager.Provider>
        <likesManager.Provider>{children}</likesManager.Provider>
    </userManager.Provider>
);

describe("connect()", () => {
    test("When no factory functions are provided the component gets passed ownProps", () => {
        const WrappedAvatar = connect({
            user: userManager,
        })()(Avatar);

        const { container, getByTestId } = render(
            <WrappedAvatar
                name="John"
                color="blue"
                size="s"
                onEdit={() => {}}
            />,
            { wrapper },
        );

        const avatar = getByTestId("avatar");

        expect(container).toContainElement(avatar);
        expect(avatar).toHaveClass("color-blue");
        expect(avatar).toHaveClass("size-s");
        expect(avatar).toHaveTextContent("John");
    });

    test("the component gets passed props from mapStateToProps", () => {
        const connector = connect({ user: userManager })(
            (state, ownProps: AvatarProps) => ({
                name: `${ownProps.name} ${state.user.surname}`,
                color: "red",
            }),
        );

        const WrappedAvatar = connector(Avatar);

        const { container, getByTestId } = render(
            <WrappedAvatar
                name="John"
                size="m"
                onEdit={() => {}}
                color="blue"
            />,
            { wrapper },
        );

        const avatar = getByTestId("avatar");

        expect(container).toContainElement(avatar);
        expect(avatar).toHaveClass("color-red");
        expect(avatar).toHaveClass("size-m");
        expect(avatar).toHaveTextContent("John Barnes");
    });

    test("the component gets passed props from mapDispatchToProps", async () => {
        const WrappedAvatar = connect({ user: userManager })(
            (state) => ({
                name: `${state.user.forename} ${state.user.surname}`,
            }),
            (dispatch) => ({
                onEdit: () => {
                    dispatch.user(actions.setForename("Alex"));
                    dispatch.user(actions.setSurname("Higgins"));
                },
            }),
        )(Avatar);

        const { getByTestId, getByRole } = render(
            <WrappedAvatar size="l" color="red" />,
            { wrapper },
        );

        expect(getByTestId("avatar")).toHaveTextContent("Susan Barnes");

        userEvent.click(getByRole("button"));

        await waitFor(() => {
            expect(getByTestId("avatar")).toHaveTextContent("Alex Higgins");
        });
    });

    describe("when a mergeProps function is passed", () => {
        test("it overrides props based on mergeProps", async () => {
            type OwnProps = Pick<AvatarProps, "color" | "size">;

            const mapStateToProps = (
                state: CombinedState<{ user: typeof userManager }>,
            ) => ({
                name: `${state.user.forename} ${state.user.surname}`,
            });

            const mapDispatchToProps = (
                dispatch: CombinedDispatch<{ user: typeof userManager }>,
            ) => ({
                onEdit: () => {
                    dispatch.user(actions.setForename("Alex"));
                    dispatch.user(actions.setSurname("Higgins"));
                },
            });

            const mergeProps = (
                stateProps: ReturnType<typeof mapStateToProps>,
                dispatchProps: ReturnType<typeof mapDispatchToProps>,
                ownProps: OwnProps,
            ) => ({
                name: `Ms. ${stateProps.name}`,
                ...dispatchProps,
                color: ownProps.color,
            });

            const WrappedAvatar = connect({ user: userManager })(
                mapStateToProps,
                mapDispatchToProps,
                mergeProps,
            )(Avatar);

            const { getByTestId, getByRole } = render(
                <WrappedAvatar color="blue" size="s" />,
                { wrapper },
            );

            const avatar = getByTestId("avatar");

            expect(avatar).toHaveClass("color-blue");
            expect(avatar).toHaveClass("size-undefined");
            expect(avatar).toHaveTextContent("Ms. Susan Barnes");

            userEvent.click(getByRole("button"));

            await waitFor(() => {
                expect(getByTestId("avatar")).toHaveTextContent("Alex Higgins");
            });
        });
    });

    describe("when multiple managers are passed", () => {
        test("it combines their state values", () => {
            const WrappedAvatar = connect({
                user: userManager,
                likes: likesManager,
            })((state) => ({
                name: `${state.user.forename} (likes ${state.likes.count} things)`,
            }))(Avatar);

            const { getByTestId } = render(
                <WrappedAvatar color="blue" size="m" onEdit={vi.fn()} />,
                { wrapper },
            );

            const avatar = getByTestId("avatar");

            expect(avatar).toHaveClass("color-blue");
            expect(avatar).toHaveClass("size-m");
            expect(avatar).toHaveTextContent("Susan (likes 5 things)");
        });

        test("it provides dispatch functions for each context reducer", async () => {
            const WrappedAvatar = connect({
                user: userManager,
                likes: likesManager,
            })(
                (state) => ({
                    name: `${state.user.forename} (likes ${state.likes.count} things)`,
                }),
                (dispatch) => ({
                    onEdit: () => {
                        dispatch.likes(actions.like());
                        dispatch.user(actions.setForename("Alex"));
                    },
                }),
            )(Avatar);

            const { getByTestId, getByRole } = render(
                <WrappedAvatar color="blue" size="l" />,
                { wrapper },
            );

            const avatar = getByTestId("avatar");

            expect(avatar).toHaveTextContent("Susan (likes 5 things)");

            userEvent.click(getByRole("button"));

            await waitFor(() => {
                expect(getByTestId("avatar")).toHaveTextContent(
                    "Alex (likes 6 things)",
                );
            });
        });
    });
});
