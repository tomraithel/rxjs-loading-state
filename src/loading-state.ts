import { BehaviorSubject, Observable } from "rxjs";
import type { LoadingStateSnapshot } from "./loading-state.snapshot";
import { LoadingStateType } from "./loading-state.type";

class IllegalStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalStateTransitionError";
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

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

    return undefined;
  }

  getError(): any {
    const value = this.getSnapshot();
    if (value.type === LoadingStateType.Error) {
      return value.error;
    }

    return undefined;
  }

  update(newData?: T) {
    if (!this.isLoading()) {
      throw new Error(
        `Update is only allowed during ${LoadingStateType.Loading} state`
      );
    }

    this.snapshot.next({
      type: LoadingStateType.Loading,
      data: newData,
    });
  }

  start() {
    if (this.isLoading()) {
      throw new IllegalStateTransitionError(
        `Transition from ${this.getType()} to ${
          LoadingStateType.Loading
        } not allowed`
      );
    }

    this.snapshot.next({
      type: LoadingStateType.Loading,
      data: (this.getSnapshot() as any).data,
    });
  }

  succeed(data?: T) {
    if (!this.isLoading()) {
      throw new IllegalStateTransitionError(
        `Transition from ${this.getType()} to ${
          LoadingStateType.Success
        } not allowed`
      );
    }

    this.snapshot.next({ type: LoadingStateType.Success, data });
  }

  fail(error: any) {
    if (!this.isLoading()) {
      throw new IllegalStateTransitionError(
        `Transition from ${this.getType()} to ${
          LoadingStateType.Error
        } not allowed`
      );
    }

    this.snapshot.next({ type: LoadingStateType.Error, error });
  }

  reset() {
    if (this.isNotStarted()) {
      throw new IllegalStateTransitionError(
        `Transition from ${this.getType()} to ${
          LoadingStateType.NotStarted
        } not allowed`
      );
    }

    this.snapshot.next({
      type: LoadingStateType.NotStarted,
    });
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
