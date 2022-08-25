import { Subject } from "rxjs";
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
  const listeners = new Map<string, Subject<{ path: string; value: any }>>();
  const totalListenersList: Map<string, Array<string>> = new Map();
  const tokenExtractors = (tve ?? []).map(
    (e): [string, TokenValueExtractor] => [e.getPrefix(), e]
  );

  const extractionMap = new Map<string, TokenValueExtractor>([
    ...tokenExtractors,
    [`${pathPrefix}.`, new StoreExtractor(store$, `${pathPrefix}.`)],
  ]);

  setStoreSubject$.subscribe(({ path, value }) => {
    listeners.get(path)!.next({ path, value });
  });

  function setData<T>(path: string, value: T): void {
    setStoreData(path, store$, value, pathPrefix, extractionMap);
    if (listeners.has(path)) {
      setStoreSubject$.next({ path, value });
    }
  }

  function getData(path: string) {
    let ev: ExpressionEvaluator = new ExpressionEvaluator(path);

    return ev.evaluate(extractionMap);
  }

  function addListener(
    path: string,
    callback: (path: string, value: any) => void
  ) {
    const key = uuid();
    let subject: Subject<{ path: string; value: any }>;
    if (listeners.has(path)) {
      subject = listeners.get(path)!;
    } else {
      subject = new Subject();
      listeners.set(path, subject);
    }
    totalListenersList.set(path, [
      ...(totalListenersList.get(path) || []),
      key,
    ]);
    const subscription = subject.subscribe(({ path, value }) =>
      callback(path, value)
    );
    return () => {
      subscription.unsubscribe();
      totalListenersList.set(
        path,
        (totalListenersList.get(path) || []).filter((e) => e !== key)
      );
      if (!totalListenersList.get(path)?.length && listeners.get(path)) {
        listeners.get(path)!.complete();
        listeners.delete(path);
      }
    };
  }

  return {
    setData,
    getData,
    addListener,
    store: store$,
  };
};
