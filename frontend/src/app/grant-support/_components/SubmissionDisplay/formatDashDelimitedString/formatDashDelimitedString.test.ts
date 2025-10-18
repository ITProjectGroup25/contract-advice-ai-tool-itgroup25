import { formatDashDelimitedString } from "./formatDashDelimitedString";

describe("formatDashDelimitedString", () => {
  test("converts dash-delimited string to title case", () => {
    expect(formatDashDelimitedString("post-award")).toBe("Post Award");
  });

  test("handles multiple dashes", () => {
    expect(formatDashDelimitedString("first-name-last-name")).toBe(
      "First Name Last Name"
    );
  });

  test("converts all caps to proper title case", () => {
    expect(formatDashDelimitedString("ALL-CAPS-TEXT")).toBe("All Caps Text");
  });

  test("handles single word without dashes", () => {
    expect(formatDashDelimitedString("single")).toBe("Single");
  });

  test("handles empty string", () => {
    expect(formatDashDelimitedString("")).toBe("");
  });

  test("handles mixed case input", () => {
    expect(formatDashDelimitedString("MiXeD-CaSe-WoRdS")).toBe(
      "Mixed Case Words"
    );
  });

  test("handles string with trailing dash", () => {
    expect(formatDashDelimitedString("trailing-dash-")).toBe("Trailing Dash ");
  });

  test("handles string with leading dash", () => {
    expect(formatDashDelimitedString("-leading-dash")).toBe(" Leading Dash");
  });

  test("handles consecutive dashes", () => {
    expect(formatDashDelimitedString("double--dash")).toBe("Double  Dash");
  });

  test("handles long strings", () => {
    expect(formatDashDelimitedString("one-two-three-four-five")).toBe(
      "One Two Three Four Five"
    );
  });

  test("preserves single character words", () => {
    expect(formatDashDelimitedString("a-b-c")).toBe("A B C");
  });

  test("handles lowercase input", () => {
    expect(formatDashDelimitedString("contact-details")).toBe(
      "Contact Details"
    );
  });
});
