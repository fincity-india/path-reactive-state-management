import { useStore } from "../src";

describe("Parent path listener tests...", () => {
  test("x.a and x.b changes and listener on x will be called", () => {
    const mockCallback1 = jest.fn().mockImplementation(() => {});
    const { setData, addListenerWithChildrenActivity } = useStore(
      { a: { b: 10, c: ["a", 2, { d: "Hello" }] }, x: { a: 10, b: 20, c: 30 } },
      "Bamboo"
    );
    const unsubscribe1 = addListenerWithChildrenActivity(
      mockCallback1,
      "Bamboo.x"
    );
    setData("Bamboo.x.a", 15);
    expect(mockCallback1.mock.calls[0][0]).toBe("Bamboo.x");
    expect(mockCallback1.mock.calls[0][1]).toMatchObject({
      a: 15,
      b: 20,
      c: 30,
    });
    expect(mockCallback1.mock.calls.length).toBe(1);
    setData("Bamboo.x.b", 10);
    expect(mockCallback1.mock.calls.length).toBe(2);
    setData("Bamboo.x", { a: 15, b: 35, c: 40 });
    expect(mockCallback1.mock.calls.length).toBe(3);
    unsubscribe1();
    setData("Bamboo.x", { a: 25, b: 45, c: 50 });
    expect(mockCallback1.mock.calls.length).toBe(3);
  });

  test("Store validation triggers test", () => {
    const mockCallback1 = jest.fn().mockImplementation(() => {});
    const { setData, addListenerWithChildrenActivity } = useStore(
      { validationTriggers: {} },
      "Store"
    );
    const pageName = "textBox";
    const unsubscribe1 = addListenerWithChildrenActivity(
      mockCallback1,
      `Store.validationTriggers.${pageName}`
    );
    setData("Store.validationTriggers.textBox.123123123123", true);
    expect(mockCallback1.mock.calls.length).toBe(1);
    console.log(mockCallback1.mock.calls[0]);
  });
});
