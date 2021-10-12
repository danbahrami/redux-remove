import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { connect, createStateManager } from "../src";
import { userReducer, actions } from "./__shared";

const Avatar = ({ name, color, size, onEdit }) => (
  <div>
    <span data-testid="avatar" className={`color-${color} size-${size}`}>
      {name}
    </span>
    <button onClick={onEdit}>Edit</button>
  </div>
);

const initialState = { forename: "Susan", surname: "Barnes" };
const userManager = createStateManager("user", userReducer, initialState);

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
});
