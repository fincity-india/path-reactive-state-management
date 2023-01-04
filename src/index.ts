import { from, Subject } from "rxjs";
import {
  Expression,
  ExpressionEvaluator,
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
      .filter(
        ([p]) =>
          path == p || p.startsWith(path + ".") || p.startsWith(path + "[")
      )
      .forEach(([p, sub]) =>
        sub.next({ path: p, value: getData(p, ...tve), set })
      );
  });

  function setData<T>(path: string, value: T): void {
    setStoreData(path, store$, value, pathPrefix, extractionMap);
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
    const subs = new Array<Function>();
    for (let i = 0; i < path.length; i++) {
      const key = uuid();
      let subject: Subject<{ path: string; value: any; set: Set<any> }>;
      if (listeners.has(path[i])) {
        subject = listeners.get(path[i])!;
      } else {
        subject = new Subject();
        listeners.set(path[i], subject);
      }
      totalListenersList.set(path[i], [
        ...(totalListenersList.get(path[i]) || []),
        key,
      ]);
      const subscription = subject.subscribe(({ path, value, set }) => {
        if (set.has(callback)) return;
        set.add(callback);
        callback(path, value);
      });
      if (callImmedieately)
        subject.next({
          path: path[i],
          value: getData(path[i], ...tve),
          set: new Set(),
        });
      subs.push(() => {
        subscription.unsubscribe();
        totalListenersList.set(
          path[i],
          (totalListenersList.get(path[i]) || []).filter((e) => e !== key)
        );
        if (
          !totalListenersList.get(path[i])?.length &&
          listeners.get(path[i])
        ) {
          listeners.get(path[i])!.complete();
          listeners.delete(path[i]);
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
    store: store$,
  };
};

export * from "./SetData";
export * from "./StoreExtractor";
