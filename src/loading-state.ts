import { BehaviorSubject, Observable } from "rxjs";
import type { LoadingStateSnapshot } from "./loading-state.snapshot";
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

  getSnapshot(): LoadingStateSnapshot<T> {
    return this.snapshot.getValue();
  }

  getData(): T | undefined {
    const value = this.getSnapshot();
    if (
      value.type === LoadingStateType.Loading ||
      value.type === LoadingStateType.Success
    ) {
      return value.data;
    }

    throw new Error(`Illegal state - not allowed to retrieve data`);
  }

  getError(): any {
    const value = this.getSnapshot();
    if (value.type === LoadingStateType.Error) {
      return value.error;
    }

    throw new Error(`Illegal state - not allowed to retrieve error`);
  }

  updateData(newData?: T) {
    if (this.isSuccess() || this.isLoading()) {
      this.snapshot.next({
        type: LoadingStateType.Loading,
        data: newData,
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
      data: (this.getSnapshot() as any).data,
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
    return this.getSnapshot().type;
  }

  isNotStarted(): boolean {
    return this.getSnapshot().type === LoadingStateType.NotStarted;
  }

  isLoading(): boolean {
    return this.getSnapshot().type === LoadingStateType.Loading;
  }

  isError(): boolean {
    return this.getSnapshot().type === LoadingStateType.Error;
  }

  isSuccess(): boolean {
    return this.getSnapshot().type === LoadingStateType.Success;
  }
}
