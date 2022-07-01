import { BehaviorSubject, Observable } from "rxjs";
import type {
  LoadingStateSnapshot,
  LoadingStateSnapshotError,
  LoadingStateSnapshotLoading,
  LoadingStateSnapshotNotStarted,
  LoadingStateSnapshotSuccess,
} from "./loading-state.snapshot";
import { LoadingStateType } from "./loading-state.type";

export class LoadingState<T> {
  private snapshot: BehaviorSubject<LoadingStateSnapshot<T>>;

  constructor(
    initialValue: LoadingStateSnapshot<T> = {
      type: LoadingStateType.NotStarted,
    }
  ) {
    this.snapshot = new BehaviorSubject<LoadingStateSnapshot<T>>(initialValue);
  }

  asObservable(): Observable<LoadingStateSnapshot<T>> {
    return this.snapshot.asObservable();
  }

  getState(): LoadingStateSnapshot<T> {
    return this.snapshot.getValue();
  }

  getData(): T | undefined {
    const value = this.getState();
    if (
      value.type === LoadingStateType.Loading ||
      value.type === LoadingStateType.Success
    ) {
      return value.data;
    }

    throw new Error(`Illegal state - not allowed to retrieve data`);
  }

  getError(): any {
    const value = this.getState();
    if (value.type === LoadingStateType.Error) {
      return value.error;
    }

    throw new Error(`Illegal state - not allowed to retrieve error`);
  }

  updateValue(newValue?: T) {
    if (this.isSuccess() || this.isLoading()) {
      this.snapshot.next({
        type: LoadingStateType.Loading,
        data: newValue,
      });
    }
  }

  reset() {
    if (this.isLoading()) {
      throw new Error("Can´t reset loading state while loading");
    }

    this.snapshot.next({
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

    this.snapshot.next({
      type: LoadingStateType.Loading,
      data: (this.getState() as any).data,
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

    this.snapshot.next({ type: LoadingStateType.Success, data });
  }

  setError(error: any) {
    if (!this.isLoading()) {
      throw new Error(
        `Illegal state transition ${this.getType()} -> ${
          LoadingStateType.Error
        }`
      );
    }

    this.snapshot.next({ type: LoadingStateType.Error, error });
  }

  setNotStarted() {
    if (!this.isLoading()) {
      throw new Error(
        `Illegal state transition ${this.getType()} -> ${
          LoadingStateType.NotStarted
        }`
      );
    }

    this.snapshot.next({ type: LoadingStateType.NotStarted });
  }

  getType(): LoadingStateType {
    return this.getState().type;
  }

  isNotStarted(): this is BehaviorSubject<LoadingStateSnapshotNotStarted> {
    return this.getState().type === LoadingStateType.NotStarted;
  }

  isLoading(): this is BehaviorSubject<LoadingStateSnapshotLoading<T>> {
    return this.getState().type === LoadingStateType.Loading;
  }

  isError(): this is BehaviorSubject<LoadingStateSnapshotError> {
    return this.getState().type === LoadingStateType.Error;
  }

  isSuccess(): this is BehaviorSubject<LoadingStateSnapshotSuccess<T>> {
    return this.getState().type === LoadingStateType.Success;
  }
}
