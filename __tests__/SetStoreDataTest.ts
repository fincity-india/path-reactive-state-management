import { StoreExtractor, setStoreData } from "../src";

test("Check set data", () => {
  const value = undefined;

  const internal = { value };

  const map = new Map([
    ["Internal.", new StoreExtractor(internal, "Internal.")],
  ]);

  setStoreData("Internal.value", internal, "Hello", "Internal", map);

  console.log(internal.value);
});
