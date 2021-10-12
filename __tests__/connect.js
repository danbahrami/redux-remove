import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { connect, createStateManager } from "../src";

const Avatar = ({ name, color, size }) => (
  <div data-testid="avatar" className={`color-${color} size-${size}`}>
    {name}
  </div>
);

const initialState = { surname: "Barnes" };
const userManager = createStateManager("user", (s) => s, initialState);

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
      expect(avatar).toHaveClass("size-undefined");
      expect(avatar).toHaveTextContent("John Barnes");
    });
  });
});
