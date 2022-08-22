import { setStoreData } from "../src/SetData";

test('setData - Test', () => {

    let store:any = {};

    setStoreData("Bamboo.a", store, 20, "Bamboo");
    expect(store.a).toBe(20);

    setStoreData("Bamboo.x.y[0]", store, 20, "Bamboo");
    console.log(store);
    expect(store.x.y[0]).toBe(20);
});