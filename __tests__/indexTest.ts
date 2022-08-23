import { useStore } from "../src";

describe("Reactive-management-tests", () => {
  test("Get data gets data", () => {
    const { getData } = useStore(
      { a: { b: 10, c: ["a", 2, { d: "Hello" }] } },
      "Bamboo"
    );
    expect(getData("Bamboo.a.c[2].d")).toBe("Hello");
    expect(getData("Bamboo.a.c[Bamboo.a.c[1]].d")).toBe("Hello");
  });

  test("Get data gets data", () => {
    const { getData } = useStore(
      { a: { b: 10, c: ["a", 2, { d: "Hello" }] } },
      "Bamboo"
    );
    expect(getData("Bamboo.a.c[2].d")).toBe("Hello");
    expect(getData("Bamboo.a.c[Bamboo.a.c[1]].d")).toBe("Hello");
  });

  test("Set data sets data", () => {
    const { getData, setData } = useStore(
      { a: { b: 10, c: ["a", 2, { d: "Hello" }] } },
      "Bamboo"
    );
    expect(getData("Bamboo.a.c[2].d")).toBe("Hello");
    setData("Bamboo.a.d.e[0]", "Hello World");
    expect(getData("Bamboo.a.d.e[0]")).toBe("Hello World");
  });

  test("Add path listener", () => {
    const mockCallback = jest.fn().mockImplementation(() => {});
    const { setData, addListener } = useStore(
      { a: { b: 10, c: ["a", 2, { d: "Hello" }] } },
      "Bamboo"
    );
    const unsubscribe = addListener("Bamboo.a.c[2].d", mockCallback);
    setData("Bamboo.a.c[2].d", "Hello World");
    setData("Bamboo.a.c[2].d", "Hello World!");
    expect(mockCallback.mock.calls.length).toBe(2);
    expect(mockCallback.mock.calls[0][0]).toEqual({
      path: "Bamboo.a.c[2].d",
      value: "Hello World",
    });
    unsubscribe();
    setData("Bamboo.a.c[2].d", "Hello World");
    //If the subscription was not unsubscribed it would've been 3
    expect(mockCallback.mock.calls.length).toBe(2);
  });
});
