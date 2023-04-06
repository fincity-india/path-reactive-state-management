import { from, Subject } from "rxjs";
import {
  Expression,
  ExpressionEvaluator,
  isNullValue,
  TokenValueExtractor,
} from "@fincity/kirun-js";
import uuid from "./util/uuid";
import { StoreExtractor } from "./StoreExtractor";
import { setStoreData } from "./SetData";

export const useStore = function <Type extends Object>(
  init: Type,
  pathPrefix: string,
  ...tve: TokenValueExtractor[]
) {
  const store$ = init || {};
  const setStoreSubject$ = new Subject<{ path: string; value: any }>();
  const listeners = new Map<
    string,
    Subject<{ path: string; value: any; set: Set<any> }>
  >();
  const totalListenersList: Map<string, Array<string>> = new Map();
  const tokenExtractors = (tve ?? []).map(
    (e): [string, TokenValueExtractor] => [e.getPrefix(), e]
  );

  const extractionMap = new Map<string, TokenValueExtractor>([
    ...tokenExtractors,
    [`${pathPrefix}.`, new StoreExtractor(store$, `${pathPrefix}.`)],
  ]);

  setStoreSubject$.subscribe(({ path }) => {
    const set = new Set();
    Array.from(listeners.entries())
      .filter(([p]) => {
        const chkParents = p[0] === "*";
        const chkPath = chkParents ? p.substring(1) : p;
        if (
          path == chkPath ||
          chkPath.startsWith(path + ".") ||
          chkPath.startsWith(path + "[")
        )
          return true;

        return (
          chkParents &&
          (path.startsWith(`${chkPath}.`) || path.startsWith(`${chkPath}[`))
        );
      })
      .forEach(([p, sub]) => {
        const actualPath = p[0] === "*" ? p.substring(1) : p;
        sub.next({ path: actualPath, value: getData(actualPath, ...tve), set });
      });
  });

  function setData<T>(
    path: string,
    value: T,
    deleteKey: boolean = false
  ): void {
    setStoreData(path, store$, value, pathPrefix, extractionMap, deleteKey);
    setStoreSubject$.next({ path, value });
  }

  function getData(path: string, ...tve: Array<TokenValueExtractor>) {
    let ev: ExpressionEvaluator = new ExpressionEvaluator(path);
    if (tve.length) {
      const tokenExtractors = (tve ?? []).map(
        (e): [string, TokenValueExtractor] => [e.getPrefix(), e]
      );
      return ev.evaluate(new Map([...extractionMap, ...tokenExtractors]));
    }
    return ev.evaluate(extractionMap);
  }

  function addListener(
    callback: (path: string, value: any) => void,
    ...path: Array<string>
  ) {
    return addListenerAndCallImmediately(false, callback, ...path);
  }

  function addListenerAndCallImmediately(
    callImmedieately: boolean,
    callback: (path: string, value: any) => void,
    ...path: Array<string>
  ) {
    return addListenerWithAllOptions(
      callImmedieately,
      false,
      callback,
      ...path
    );
  }

  function addListenerWithChildrenActivity(
    callback: (path: string, value: any) => void,
    ...path: Array<string>
  ) {
    return addListenerAndCallImmediatelyWithChildrenActivity(
      false,
      callback,
      ...path
    );
  }

  function addListenerAndCallImmediatelyWithChildrenActivity(
    callImmedieately: boolean,
    callback: (path: string, value: any) => void,
    ...path: Array<string>
  ) {
    return addListenerWithAllOptions(callImmedieately, true, callback, ...path);
  }

  function addListenerWithAllOptions(
    callImmedieately: boolean,
    callForAllChildrenActivity: boolean,
    callback: (path: string, value: any) => void,
    ...path: Array<string>
  ) {
    const subs = new Array<Function>();
    for (let i = 0; i < path.length; i++) {
      if (isNullValue(path[i])) continue;
      const key = uuid();
      let subject: Subject<{ path: string; value: any; set: Set<any> }>;
      const curPath = callForAllChildrenActivity ? "*" + path[i] : path[i];
      if (listeners.has(curPath)) {
        subject = listeners.get(curPath)!;
      } else {
        subject = new Subject();
        listeners.set(curPath, subject);
      }
      totalListenersList.set(curPath, [
        ...(totalListenersList.get(curPath) || []),
        key,
      ]);
      const subscription = subject.subscribe(({ path, value, set }) => {
        if (set.has(callback)) return;
        set.add(callback);
        callback(path, value);
      });
      if (callImmedieately)
        subject.next({
          path: curPath,
          value: getData(
            curPath[0] === "*" ? curPath.substring(1) : curPath,
            ...tve
          ),
          set: new Set(),
        });
      subs.push(() => {
        subscription.unsubscribe();
        totalListenersList.set(
          curPath,
          (totalListenersList.get(curPath) || []).filter((e) => e !== key)
        );
        if (
          !totalListenersList.get(curPath)?.length &&
          listeners.get(curPath)
        ) {
          listeners.get(curPath)!.complete();
          listeners.delete(curPath);
        }
      });
    }
    return () => subs.forEach((e) => e());
  }

  return {
    setData,
    getData,
    addListener,
    addListenerAndCallImmediately,
    addListenerWithChildrenActivity,
    addListenerAndCallImmediatelyWithChildrenActivity,
    store: store$,
  };
};

export * from "./SetData";
export * from "./StoreExtractor";
