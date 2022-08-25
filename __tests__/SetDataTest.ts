import { setStoreData } from "../src/SetData";
import { StoreExtractor } from "../src/StoreExtractor";

test("setData - Test", () => {
  let store: any = {};

  const map = new Map([["Store.", new StoreExtractor(store, `Store.`)]]);

  setStoreData("Store.a", store, 20, "Store", map);
  expect(store.a).toBe(20);

  setStoreData("Store.x.y[0]", store, 20, "Store", map);
  expect(store.x.y[0]).toBe(20);

  setStoreData("Store.z[Store.x.y[0]]", store, 300, "Store", map);
  expect(store.z[20]).toBe(300);
});
