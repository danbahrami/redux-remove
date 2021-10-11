import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { connect } from "../src";

const Avatar = ({ name, color, size }) => (
  <div data-testid="avatar" className={`color-${color} size-${size}`}>
    {name}
  </div>
);

describe("connect()", () => {
  it("is an HOC factory", () => {
    const WrappedAvatar = connect()()(Avatar);

    const { container, getByTestId } = render(
      <WrappedAvatar name="john" color="blue" size="45" />
    );

    const avatar = getByTestId("avatar");

    expect(container).toContainElement(avatar);
    expect(avatar).toHaveClass("color-blue");
    expect(avatar).toHaveClass("size-45");
    expect(avatar).toHaveTextContent("john");
  });
});
