# path-reactive-state-management

## Introduction
Have you ever encountered performance issues in large applications that use state management libraries? One common issue is that most state management libraries require immutability, where even a single property update requires the whole object to be updated, which can trigger unnecessary updates in components that rely on other properties. This can lead to delays in applications with a large number of components, such as design or web editors.

To solve this problem, we developed the path-reactive-state-management library. This state management library takes advantage of the reactive programming paradigm and allows you to listen to changes in a specific path, rather than updating the entire object. It provides a global store object, like most state management libraries, but it works via listeners to a path. For example, you can add a listener to a path called `Store.x.y` and give a callback, and every time someone mutates the value in the path, the callback is called.

The library is designed to work seamlessly with React and uses the popular RxJS library for listening to changes. It also provides a hook called `useStore` that allows you to easily create and manage state objects. By using this library, you can significantly reduce unnecessary computations and delays in your application, making it faster and more efficient.

## Why Use This Library:

`path-reactive-state-management` is a powerful and flexible library for managing application state in any JavaScript-based application. Its use of paths allows for precise targeting of specific portions of the application state, making it easy to keep track of changes and trigger specific actions when those changes occur.

This library is particularly well-suited for applications that require real-time updates or complex data structures, as it provides a range of listener functions that can be used to trigger callbacks when changes occur. The library is also framework-agnostic, meaning that it can be used in any application that can consume a JavaScript library.

Additionally, the library is designed to be simple and easy to use, with a set of straightforward functions for manipulating application state. Its use of TypeScript ensures that it is strongly-typed and easy to integrate into larger codebases, while its comprehensive test suite ensures that it is stable and reliable.

Overall, `path-reactive-state-management` is an excellent choice for developers looking for a flexible, powerful, and easy-to-use library for managing application state.

## Installation

You can install `path-reactive-state-management` via NPM:
```
npm install path-reactive-state-management
```
## Getting Started

### How to use the package ?

First, install the package using npm, Then, in your code, import useStore from the package:
```
import { useStore } from  'path-reactive-state-management'; 
```
Next, create an initial state object:
```
const initialState = {
  counter: 0,
  message: 'Hello World!',
};
```
Now, call `useStore` and pass in the initial state and a path prefix:
```
const { setData, getData, addListener, store } = useStore(initialState, 'MyStore');
```
The `useStore` hook takes three arguments: `init`, `pathPrefix`, and `TokenValueExtractor[]`.

The first argument `init` is the initial value for the store object. You can pass any object you want to use as the initial state.

The second argument `pathPrefix` is a string that serves as an identifier for the store being created. This is useful to identify multiple stores in your application and you need to specify which store is to be used.

The third argument `TokenValueExtractor[]` is an optional array of TokenValueExtractors. These are used when you have some advanced use cases for extracting values from the store.

When using the `useStore` hook, you can create multiple instances of the store by providing a unique `pathPrefix` argument to each instance. This allows you to create separate stores for different parts of your application, while still using the same underlying `setData` and `getData` functions.

One advantage of this approach is that it can help prevent naming collisions and make it easier to reason about the state of your application. For example, you could have one store for user authentication, another for product data, and yet another for the current theme of your application.

Another advantage is that it can simplify the process of sharing state between components. By using the same instance of a store in multiple components, you can ensure that they all have access to the same state. And by using separate instances for different parts of your application, you can avoid unnecessary re-renders and improve performance.



Once you have passed these arguments, `useStore` returns an object with a set of methods and the current state of the store.

The below indicates the signature of useStore method
```
useStore: <Type extends Object>(init: Type, pathPrefix: string, ...tve: TokenValueExtractor[]) => {
    setData: <T>(path: string, value: T, deleteKey?: boolean) => void;
    getData: (path: string, ...tve: Array<TokenValueExtractor>) => any;
    addListener: (callback: (path: string, value: any) => void, ...path: Array<string>) => () => void;
    addListenerAndCallImmediately: (callImmediately: boolean, callback: (path: string, value: any) => void, ...path: Array<string>) => () => void;
    addListenerWithChildrenActivity: (callback: (path: string, value: any) => void, ...path: Array<string>) => () => void;
    addListenerAndCallImmediatelyWithChildrenActivity: (callImmediately: boolean, callback: (path: string, value: any) => void, ...path: Array<string>) => () => void;
    store: Type;
}
```
#### setData
```
setData: <T>(path: string, value: T, deleteKey?: boolean) => void;
```
`setData` is a method that allows you to set the value of a particular key within the store.
#### Parameters
 - `path` (string): This is the path to the property within the store that you want to set. The path should start with the path prefix of the store you want to access. For example, if you have two stores with the path prefixes "Bamboo." and "Store.", and you want to set the value of a property called "foo" in the "Bamboo" store, the path would be "Bamboo.foo". You can also use array syntax to access elements of an array by their index, for example "Bamboo.arr[0]" would access the first element of an array called "arr" in the "Bamboo" store.
 -  `value` (any): This is the value you want to set for the specified key in the store. It can be any valid JavaScript value, including primitive types (strings, numbers, booleans), objects, and arrays.
- `deleteKey` (boolean, optional): This parameter is optional. If it is set to `true` and the value you are setting is either `null` or `undefined`, the property being accessed by `path` will be removed from the store. If `deleteKey` is not specified or set to `false`, the property will be set to the provided value.

Here is an example usage of `setData`:

```
const { setData } = useStore({ foo: 42 }, "Bamboo");

// Set the value of "foo" to 43
setData("Bamboo.foo", 43);

// Remove the "foo" property from the store
setData("Bamboo.foo", null, true);

```
In this example, we first create a store using the `useStore` hook with an initial value of `{ foo: 42 }` and a path prefix of "Bamboo". We then call `setData` to set the value of the "foo" property to 43. Finally, we call `setData` again with `null` and `true` to remove the "foo" property from the store.


#### getData
```
getData(path: string, ...tve: Array<TokenValueExtractor>): any;
```
This function retrieves data from the store at the given `path`.

#### Parameters:

-   `path` (required): The path to the data to be retrieved from the store. The path should include the prefix of the store being accessed.
-   `tve` (optional): An array of `TokenValueExtractor` objects to be used for extracting the value at the given `path`. By default, the function will use the default `TokenValueExtractor`.

#### Return Value:

The value stored at the specified `path`, or `undefined` if the `path` does not exist in the store.

#### Example Usage:
```
const { getData } = useStore({ foo: { bar: 1 } }, "example");
const value = getData("example.foo.bar");
console.log(value); // Output: 1
```

In the example above, `getData` retrieves the value of `example.foo.bar` from the store. If `example.foo.bar` does not exist, the function returns `undefined`.

> A Token Value Extractor is a class that can be used to extract a value from a path that is outside the current store. By creating a Token Value Extractor, the user can write their own logic on how to access a path in a different store, thereby allowing for greater flexibility in data retrieval. The `getValueInternal` method in the Token Value Extractor can be overridden to define custom logic for accessing the data. If users have further questions on Token Value Extractors or the kirun-js library in general, they can visit the project's Github repository at [https://github.com/fincity-india/nocode-kirun](https://github.com/fincity-india/nocode-kirun).

### addListener
```
addListener(callback: (path: string, value: any) => void, path: string, ...extractors: Array<TokenValueExtractor>): () => void
```

This method adds a listener for a particular path in the store. The callback function will be called whenever the value of the specified path is updated.

-   `callback`: A function that will be called whenever the value of the specified path is updated. The function takes two arguments, the path and the new value.
-   `path`: The path to listen for updates on.
-   `extractors`: An optional array of `TokenValueExtractor` instances that will be used to extract values from paths in other stores.

Returns a function that can be called to unsubscribe the listener.

### addListenerAndCallImmediately

```
addListenerAndCallImmediately(callImmediately: boolean, callback: (path: string, value: any) => void, path: string, ...extractors: Array<TokenValueExtractor>): () => void
```

This method adds a listener for a particular path in the store. The callback function will be called whenever the value of the specified path is updated.

-   `callImmediately`: A boolean that indicates whether or not the callback function should be called immediately with the current value of the path.
-   `callback`: A function that will be called whenever the value of the specified path is updated. The function takes two arguments, the path and the new value.
-   `path`: The path to listen for updates on.
-   `extractors`: An optional array of `TokenValueExtractor` instances that will be used to extract values from paths in other stores.

Returns a function that can be called to unsubscribe the listener.

### addListenerWithChildrenActivity
```
addListenerWithChildrenActivity(callback: (path: string, value: any) => void, path: string): () => void
```

Adds a listener to the store that will be triggered whenever the specified path or any of its children paths are changed. The listener callback will receive the path and the current value at that path.

-   `callback`: A function that will be called whenever the specified path or any of its children paths are changed.
-   `path`: The path to watch for changes. Any changes to this path or any of its children paths will trigger the listener.

Returns a function that can be called to unsubscribe the listener.

### addListenerAndCallImmediatelyWithChildrenActivity
```
addListenerAndCallImmediatelyWithChildrenActivity(callImmediately: boolean, callback: (path: string, value: any) => void, path: string): () => void
```

Adds a listener to the store that will be triggered whenever the specified path or any of its children paths are changed. The listener callback will receive the path and the current value at that path. If `callImmediately` is `true`, the listener will also be called immediately with the current value at the specified path.

-   `callImmediately`: A boolean indicating whether to call the listener immediately with the current value at the specified path.
-   `callback`: A function that will be called whenever the specified path or any of its children paths are changed.
-   `path`: The path to watch for changes. Any changes to this path or any of its children paths will trigger the listener.

Returns a function that can be called to unsubscribe the listener.

Now that we have a better understanding of the `useStore` hook, let's look at a simple example of how to use it.

```
// store.ts
import { createStore } from "path-reactive-state-management";

const { addListener, setData } = useStore({ count: 0 }, '');

export { addListener, setData };

// Counter.tsx
import { addListener, setData } from "./store";

function Counter() {
  const { setData, addListener } = useStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsubscribe = addListener((path, newCount) => {
      setCount(newCount);
    }, "count");

    return unsubscribe;
  }, [addListener]);

  const handleClick = () => {
    setData("count", count + 1);
  };

  return (
    <div>
      <h2>Counter</h2>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}

export default Counter;

```


