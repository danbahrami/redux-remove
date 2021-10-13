import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { connect, createStateManager } from "../src";
import { userReducer, likesReducer, actions } from "./__shared";

const Avatar = ({ name, color, size, onEdit }) => (
  <div>
    <span data-testid="avatar" className={`color-${color} size-${size}`}>
      {name}
    </span>
    <button onClick={onEdit}>Edit</button>
  </div>
);

const initialUserState = { forename: "Susan", surname: "Barnes" };
const initialLikesState = { count: 5 };

const userManager = createStateManager("user", userReducer, initialUserState);
const likesManager = createStateManager(
  "likes",
  likesReducer,
  initialLikesState
);

describe("connect()", () => {
  it("is an HOC factory", () => {
    const WrappedAvatar = connect(userManager)()(Avatar);

    const { container, getByTestId } = render(
      <userManager.Provider>
        <div>
          <WrappedAvatar name="John" color="blue" size="45" />
        </div>
      </userManager.Provider>
    );

    const avatar = getByTestId("avatar");

    expect(container).toContainElement(avatar);
    expect(avatar).toHaveClass("color-blue");
    expect(avatar).toHaveClass("size-45");
    expect(avatar).toHaveTextContent("John");
  });

  describe("when only a mapStateToProps function is passed", () => {
    it("overrides props based on mapStateToProps", () => {
      const mapStateToProps = (state, ownProps) => ({
        name: `${ownProps.name} ${state.user.surname}`,
        color: "red",
      });

      const WrappedAvatar = connect(userManager)(mapStateToProps)(Avatar);

      const { container, getByTestId } = render(
        <userManager.Provider>
          <div>
            <WrappedAvatar name="John" color="blue" size="45" />
          </div>
        </userManager.Provider>
      );

      const avatar = getByTestId("avatar");

      expect(container).toContainElement(avatar);
      expect(avatar).toHaveClass("color-red");
      expect(avatar).toHaveClass("size-45");
      expect(avatar).toHaveTextContent("John Barnes");
    });
  });

  describe("when a mapDispatchToProps function is passed", () => {
    it("overrides props based on mapDispatchToProps", () => {
      const mapStateToProps = (state) => ({
        name: `${state.user.forename} ${state.user.surname}`,
      });

      const mapDispatchToProps = (dispatch, ownProps) => ({
        onEdit: () => {
          dispatch(actions.setForename("Alex"));
          dispatch(actions.setSurname("Higgins"));
        },
      });

      const WrappedAvatar = connect(userManager)(
        mapStateToProps,
        mapDispatchToProps
      )(Avatar);

      const { container, getByTestId, getByRole } = render(
        <userManager.Provider>
          <div>
            <WrappedAvatar name="John" color="blue" size="45" />
          </div>
        </userManager.Provider>
      );

      let avatar = getByTestId("avatar");

      expect(avatar).toHaveClass("color-blue");
      expect(avatar).toHaveClass("size-45");
      expect(avatar).toHaveTextContent("Susan Barnes");

      userEvent.click(getByRole("button"));

      avatar = getByTestId("avatar");

      expect(avatar).toHaveClass("color-blue");
      expect(avatar).toHaveClass("size-45");
      expect(avatar).toHaveTextContent("Alex Higgins");
    });
  });

  describe("when a mergeProps function is passed", () => {
    it("overrides props based on mergeProps", () => {
      const mapStateToProps = (state) => ({
        name: `${state.user.forename} ${state.user.surname}`,
      });

      const mapDispatchToProps = (dispatch, ownProps) => ({
        onEdit: () => {
          dispatch(actions.setForename("Alex"));
          dispatch(actions.setSurname("Higgins"));
        },
      });

      const mergeProps = (stateProps, dispatchProps, ownProps) => ({
        name: `Ms. ${stateProps.name}`,
        ...dispatchProps,
        color: ownProps.color,
      });

      const WrappedAvatar = connect(userManager)(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
      )(Avatar);

      const { container, getByTestId, getByRole } = render(
        <userManager.Provider>
          <div>
            <WrappedAvatar name="John" color="blue" size="45" />
          </div>
        </userManager.Provider>
      );

      let avatar = getByTestId("avatar");

      expect(avatar).toHaveClass("color-blue");
      expect(avatar).toHaveClass("size-undefined");
      expect(avatar).toHaveTextContent("Ms. Susan Barnes");

      userEvent.click(getByRole("button"));

      avatar = getByTestId("avatar");

      expect(avatar).toHaveClass("color-blue");
      expect(avatar).toHaveClass("size-undefined");
      expect(avatar).toHaveTextContent("Ms. Alex Higgins");
    });
  });

  describe("when multiple managers are passed", () => {
    it("combines their state values", () => {
      const mapStateToProps = (state, props) => ({
        name: `${state.user.forename} (likes ${state.likes.count} things)`,
      });

      const WrappedAvatar = connect([userManager, likesManager])(
        mapStateToProps
      )(Avatar);

      const { container, getByTestId, getByRole } = render(
        <userManager.Provider>
          <likesManager.Provider>
            <div>
              <WrappedAvatar name="John" color="blue" size="45" />
            </div>
          </likesManager.Provider>
        </userManager.Provider>
      );

      let avatar = getByTestId("avatar");

      expect(avatar).toHaveClass("color-blue");
      expect(avatar).toHaveClass("size-45");
      expect(avatar).toHaveTextContent("Susan (likes 5 things)");
    });

    it("calls dispatch on every context reducer", () => {
      const mapStateToProps = (state, props) => ({
        name: `${state.user.forename} (likes ${state.likes.count} things)`,
      });

      const mapDispatchToProps = (dispatch) => ({
        onEdit: () => {
          dispatch(actions.like());
          dispatch(actions.setForename("Alex"));
        },
      });

      const WrappedAvatar = connect([userManager, likesManager])(
        mapStateToProps,
        mapDispatchToProps
      )(Avatar);

      const { container, getByTestId, getByRole } = render(
        <userManager.Provider>
          <likesManager.Provider>
            <div>
              <WrappedAvatar color="blue" size="45" />
            </div>
          </likesManager.Provider>
        </userManager.Provider>
      );

      let avatar = getByTestId("avatar");

      expect(avatar).toHaveTextContent("Susan (likes 5 things)");

      userEvent.click(getByRole("button"));

      avatar = getByTestId("avatar");

      expect(avatar).toHaveTextContent("Alex (likes 6 things)");
    });
  });

  describe("when no managers are passed", () => {
    it("still functions but state is empty", () => {
      const mapStateToProps = (state, props) => ({
        ...props,
        ...state,
      });

      const mapDispatchToProps = (dispatch) => ({
        onEdit: () => {
          dispatch(actions.setForename("Alex"));
        },
      });

      const WrappedAvatar = connect()(mapStateToProps, mapDispatchToProps)(
        Avatar
      );

      const { container, getByTestId, getByRole } = render(
        <userManager.Provider>
          <div>
            <WrappedAvatar name="John" color="blue" size="45" />
          </div>
        </userManager.Provider>
      );

      let avatar = getByTestId("avatar");

      expect(avatar).toHaveClass("color-blue");
      expect(avatar).toHaveClass("size-45");
      expect(avatar).toHaveTextContent("John");

      // check that dispatch actions does not blow up
      userEvent.click(getByRole("button"));
    });
  });
});
