import { MonoTypeOperatorFunction, Observable } from "rxjs";
import type { LoadingState } from "./loading-state";

// Add the ability to type the loadingState, without forcing TS to infer the operator type from this reference
type NoInfer<T> = [T][T extends any ? 0 : never];

export function connectToLoadingState<Data>(
  loadingState: LoadingState<NoInfer<Data>>
): MonoTypeOperatorFunction<Data> {
  return function (source: Observable<Data>): Observable<Data> {
    return new Observable<Data>((subscriber) => {
      loadingState.setLoading();

      const innerSubscription = source.subscribe({
        next: (value: Data) => {
          loadingState.updateData(value);
          subscriber.next(value);
        },

        error: (error: any) => {
          loadingState.setError(error);
          subscriber.error(error);
        },

        complete: () => {
          loadingState.setSuccess(loadingState.getData());
          subscriber.complete();
        },
      });

      const tearDown = () => {
        innerSubscription.unsubscribe();

        // Reset to not-started if loading was cancelled
        if (loadingState.isLoading()) {
          loadingState.setNotStarted();
        }
      };

      return tearDown;
    });
  };
}
