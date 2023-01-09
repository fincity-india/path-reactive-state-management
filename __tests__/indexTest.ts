import { useStore } from "../src";
import { StoreExtractor } from "../src/StoreExtractor";

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
    const unsubscribe = addListener(mockCallback, "Bamboo.a.c[2].d");
    setData("Bamboo.a.c[2].d", "Hello World");
    setData("Bamboo.a.c[2].d", "Hello World!");
    expect(mockCallback.mock.calls.length).toBe(2);
    expect([
      mockCallback.mock.calls[0][0],
      mockCallback.mock.calls[0][1],
    ]).toEqual(["Bamboo.a.c[2].d", "Hello World"]);
    unsubscribe();
    setData("Bamboo.a.c[2].d", "Hello World");
    //If the subscription was not unsubscribed it would've been 3
    expect(mockCallback.mock.calls.length).toBe(2);
  });

  test("Add path listener with call immediately", () => {
    const mockCallback = jest.fn().mockImplementation(() => {});
    const { setData, addListenerAndCallImmediately } = useStore(
      { a: { b: 10, c: ["a", 2, { d: "Hello" }] } },
      "Bamboo"
    );
    const unsubscribe = addListenerAndCallImmediately(
      true,
      mockCallback,
      "Bamboo.a.c[2].d"
    );
    setData("Bamboo.a.c[2].d", "Hello World");
    setData("Bamboo.a.c[2].d", "Hello World!");
    expect(mockCallback.mock.calls.length).toBe(3);
    expect([
      mockCallback.mock.calls[0][0],
      mockCallback.mock.calls[0][1],
    ]).toEqual(["Bamboo.a.c[2].d", "Hello"]);
    unsubscribe();
    setData("Bamboo.a.c[2].d", "Hello World");
    //If the subscription was not unsubscribed it would've been 3
    expect(mockCallback.mock.calls.length).toBe(3);
  });

  test("Extra token extractor", () => {
    const { store } = useStore(
      { a: { b: 1, c: ["a", 2, { d: "Hello" }] } },
      "Bamboo"
    );

    const { getData, setData } = useStore(
      { a: { b: 10, c: ["a", 12, { d: "Hello" }] } },
      "Store",
      new StoreExtractor(store, "Bamboo.")
    );

    expect(getData("Store.a.c[Bamboo.a.b]")).toBe(12);
  });

  test("Set with Extra token extractor", () => {
    const { store } = useStore(
      { a: { b: 1, c: ["a", 2, { d: "Hello" }] } },
      "Bamboo"
    );

    const { getData, setData } = useStore(
      { a: { b: 10, c: ["a", 12, { d: "Hello" }] } },
      "Store",
      new StoreExtractor(store, "Bamboo.")
    );
    setData("Store.a.c[Bamboo.a.b]", 13);
    expect(getData("Store.a.c[Bamboo.a.b]")).toBe(13);
  });
});
