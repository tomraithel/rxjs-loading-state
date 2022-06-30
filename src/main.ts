import { BehaviorSubject, MonoTypeOperatorFunction, Observable } from "rxjs";

export interface LoadingStateNotStarted {
  type: LoadingStateType.NotStarted;
}
export interface LoadingStateLoading<T> {
  type: LoadingStateType.Loading;
  data: T | undefined; // Could be set, if existing data is reloaded
}

export interface LoadingStateSuccess<T> {
  type: LoadingStateType.Success;
  data: T | undefined;
}

export interface LoadingStateError {
  type: LoadingStateType.Error;
  error: any; // Javascript Error object
}

export type LoadingStateValue<T> =
  | LoadingStateNotStarted
  | LoadingStateLoading<T>
  | LoadingStateSuccess<T>
  | LoadingStateError;

export enum LoadingStateType {
  NotStarted = "notStarted",
  Loading = "loading",
  Error = "error",
  Success = "success",
}

// Add the ability to type the loadingState, without forcing TS to infer the operator type from this reference
type NoInfer<T> = [T][T extends any ? 0 : never];

export function connectToLoadingState<Data>(
  loadingState: LoadingState<NoInfer<Data>>
): MonoTypeOperatorFunction<Data> {
  return function (source: Observable<Data>): Observable<Data> {
    return new Observable<Data>((subscriber) => {
      let lastValue: Data;
      loadingState.setLoading();
      const innerSubscription = source.subscribe({
        next: (value: Data) => {
          lastValue = value;
          loadingState.updateValue(value);
          subscriber.next(value);
        },

        error: (error: any) => {
          loadingState.setError(error);
          subscriber.error(error);
        },

        complete: () => {
          loadingState.setSuccess(lastValue);
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

export class LoadingState<T> {
  private state: BehaviorSubject<LoadingStateValue<T>>;

  constructor(
    initialValue: LoadingStateValue<T> = { type: LoadingStateType.NotStarted }
  ) {
    this.state = new BehaviorSubject<LoadingStateValue<T>>(initialValue);
  }

  getStateValue() {
    return this.state.getValue();
  }

  getState(): Observable<LoadingStateValue<T>> {
    return this.state.asObservable();
  }

  getData(): T | undefined {
    const value = this.getStateValue();
    if (
      value.type === LoadingStateType.Loading ||
      value.type === LoadingStateType.Success
    ) {
      return value.data;
    }

    throw new Error(`Illegal state - not allowed to retrieve data`);
  }

  getError(): any {
    const value = this.getStateValue();
    if (value.type === LoadingStateType.Error) {
      return value.error;
    }

    throw new Error(`Illegal state - not allowed to retrieve error`);
  }

  updateValue(newValue?: T) {
    if (this.isSuccess() || this.isLoading()) {
      this.state.next({
        type: LoadingStateType.Loading,
        data: newValue,
      });
    }
  }

  reset() {
    if (this.isLoading()) {
      throw new Error("Can´t reset loading state while loading");
    }

    this.state.next({
      type: LoadingStateType.NotStarted,
    });
  }

  setLoading() {
    if (this.isLoading()) {
      throw new Error(
        `Illegal state transition ${this.getType()} -> ${
          LoadingStateType.Loading
        }`
      );
    }

    this.state.next({
      type: LoadingStateType.Loading,
      data: (this.getStateValue() as any).data,
    });
  }

  setSuccess(data?: T) {
    if (!this.isLoading()) {
      throw new Error(
        `Illegal state transition ${this.getType()} -> ${
          LoadingStateType.Success
        }`
      );
    }

    this.state.next({ type: LoadingStateType.Success, data });
  }

  setError(error: any) {
    if (!this.isLoading()) {
      throw new Error(
        `Illegal state transition ${this.getType()} -> ${
          LoadingStateType.Error
        }`
      );
    }

    this.state.next({ type: LoadingStateType.Error, error });
  }

  setNotStarted() {
    if (!this.isLoading()) {
      throw new Error(
        `Illegal state transition ${this.getType()} -> ${
          LoadingStateType.NotStarted
        }`
      );
    }

    this.state.next({ type: LoadingStateType.NotStarted });
  }

  getType(): LoadingStateType {
    return this.getStateValue().type;
  }

  isNotStarted(): this is BehaviorSubject<LoadingStateNotStarted> {
    return this.getStateValue().type === LoadingStateType.NotStarted;
  }

  isLoading(): this is BehaviorSubject<LoadingStateLoading<T>> {
    return this.getStateValue().type === LoadingStateType.Loading;
  }

  isError(): this is BehaviorSubject<LoadingStateError> {
    return this.getStateValue().type === LoadingStateType.Error;
  }

  isSuccess(): this is BehaviorSubject<LoadingStateSuccess<T>> {
    return this.getStateValue().type === LoadingStateType.Success;
  }
}
