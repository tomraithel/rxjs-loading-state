import { BehaviorSubject, Observable } from "rxjs";
import {
  LoadingState,
  LoadingStateError,
  LoadingStateLoading,
  LoadingStateNotStarted,
  LoadingStateSuccess,
  LoadingStateType,
} from "./loading-state";

export class LoadingStateSubject<T> {
  private state: BehaviorSubject<LoadingState<T>>;

  constructor(
    initialValue: LoadingState<T> = { type: LoadingStateType.NotStarted }
  ) {
    this.state = new BehaviorSubject<LoadingState<T>>(initialValue);
  }

  getStateValue(): LoadingState<T> {
    return this.state.getValue();
  }

  getState(): Observable<LoadingState<T>> {
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
