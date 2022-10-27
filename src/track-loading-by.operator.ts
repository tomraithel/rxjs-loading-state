import { MonoTypeOperatorFunction, Observable } from "rxjs";
import type { LoadingStateMachine } from "./loading-state-machine";

// Add the ability to type the LoadingStateMachine, without forcing TS to infer the operator type from this reference
type NoInfer<T> = [T][T extends any ? 0 : never];

export type DataMapper<IncomingData, Data> = (value: IncomingData) => Data;

export function trackLoadingBy<IncomingData, Data>(
  loadingStateMachine: LoadingStateMachine<NoInfer<Data>>,
  mapper?: DataMapper<IncomingData, Data>
): MonoTypeOperatorFunction<IncomingData>;

/**
 * Tracks an observable, by emitting loading events to the passed in state machine
 * @param {LoadingStateMachine<Data>} loadingStateMachine
 */
export function trackLoadingBy<Data>(
  loadingStateMachine: LoadingStateMachine<NoInfer<Data>>,
  mapper: DataMapper<any, any> = (v) => v
): MonoTypeOperatorFunction<Data> {
  return function (source: Observable<Data>): Observable<Data> {
    return new Observable<Data>((subscriber) => {
      loadingStateMachine.start();

      const innerSubscription = source.subscribe({
        next: (value: Data) => {
          loadingStateMachine.update(mapper(value));
          subscriber.next(value);
        },

        error: (error: any) => {
          loadingStateMachine.fail(error);
          subscriber.error(error);
        },

        complete: () => {
          loadingStateMachine.succeed(loadingStateMachine.data);
          subscriber.complete();
        },
      });

      const tearDown = () => {
        innerSubscription.unsubscribe();

        // Reset to not-started if loading was cancelled
        if (loadingStateMachine.isLoading()) {
          loadingStateMachine.reset();
        }
      };

      return tearDown;
    });
  };
}
