import { setStoreData } from "../src/SetData";

test("setData - Test", () => {
  let store: any = {};

  setStoreData("Store.a", store, 20, "Store");
  expect(store.a).toBe(20);

  setStoreData("Store.x.y[0]", store, 20, "Store");
  expect(store.x.y[0]).toBe(20);

  setStoreData("Store.z[Store.x.y[0]]", store, 300, "Store");
  expect(store.z[20]).toBe(300);
});
