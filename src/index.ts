import { Subject } from 'rxjs';
import * as objectPath from 'object-path';
import uuid from './util/uuid';

export const useStore = function<Type extends Object>(init: Type) {
  const store$ = init || {};
  const setStoreSubject$ = new Subject<{ path: string, value: any }>();
  const listeners = new Map<string, Subject<{ path: string, value: any }>>();
  const totalListenersList: Map<string, Array<string>> = new Map();

  setStoreSubject$.subscribe(({ path, value }) => {
    // get path from expression evaluator
    // temporarily using library to complete my code
    listeners.get(path)!.next({ path, value });
  })

  function setData<T>(path: string, value: T): void {
    objectPath.set(store$, path, value);
    if (listeners.has(path)) {
      setStoreSubject$.next({ path, value });
    }
  }

  function getData(path: string) {
    return objectPath.get(store$, path)
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