import { Subject } from 'rxjs';
import { Expression, ExpressionEvaluator, TokenValueExtractor } from '@fincity/kirun-js';
import uuid from './util/uuid';
import { StoreExtractor } from './StoreExtractor';
import { setStoreData } from './SetData';

export const useStore = function<Type extends Object>(init: Type, pathPrefix: string) {
  const store$ = init || {};
  const setStoreSubject$ = new Subject<{ path: string, value: any }>();
  const listeners = new Map<string, Subject<{ path: string, value: any }>>();
  const totalListenersList: Map<string, Array<string>> = new Map();

  setStoreSubject$.subscribe(({ path, value }) => {
    listeners.get(path)!.next({ path, value });
  })

  function setData<T>(path: string, value: T): void {
    setStoreData(path, store$, value, pathPrefix);
    if (listeners.has(path)) {
      setStoreSubject$.next({ path, value });
    }
  }

  function getData(path: string) {
    let ev: ExpressionEvaluator = new ExpressionEvaluator(path);
    return ev.evaluate(new Map<string, TokenValueExtractor>([[`${pathPrefix}.`, new StoreExtractor(store$, `${pathPrefix}.`)]]));
  }

  function addListener(path: string, callback: () => void) {
    const key = uuid();
    let subject: Subject<{ path: string, value: any }>;
    if (listeners.has(path)) {
      subject = listeners.get(path)!;
    } else {
      subject = new Subject();
      listeners.set(path, subject);
    }
    totalListenersList.set(path, [...totalListenersList.get(path) || [], key]);
    const subscription = subject.subscribe(callback)
    return () => {
      subscription.unsubscribe();
      totalListenersList.set(path, (totalListenersList.get(path) || []).filter(e => e !== key));
      if (!totalListenersList.get(path)?.length && listeners.get(path)) {
        listeners.get(path)!.complete();
        listeners.delete(path);
      }
    };
  }

  return {
    setData,
    getData,
    addListener
  }

}