import { MonoTypeOperatorFunction, Observable } from "rxjs";
import type { LoadingStateMachine } from "./loading-state-machine";

// Add the ability to type the LoadingStateMachine, without forcing TS to infer the operator type from this reference
type NoInfer<T> = [T][T extends any ? 0 : never];

export function trackLoadingBy<Data>(
  LoadingStateMachine: LoadingStateMachine<NoInfer<Data>>
): MonoTypeOperatorFunction<Data> {
  return function (source: Observable<Data>): Observable<Data> {
    return new Observable<Data>((subscriber) => {
      LoadingStateMachine.start();

      const innerSubscription = source.subscribe({
        next: (value: Data) => {
          LoadingStateMachine.update(value);
          subscriber.next(value);
        },

        error: (error: any) => {
          LoadingStateMachine.fail(error);
          subscriber.error(error);
        },

        complete: () => {
          LoadingStateMachine.succeed(LoadingStateMachine.data);
          subscriber.complete();
        },
      });

      const tearDown = () => {
        innerSubscription.unsubscribe();

        // Reset to not-started if loading was cancelled
        if (LoadingStateMachine.isLoading()) {
          LoadingStateMachine.reset();
        }
      };

      return tearDown;
    });
  };
}
