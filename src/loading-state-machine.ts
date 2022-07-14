import { BehaviorSubject, Observable } from "rxjs";
import { LoadingState } from "./loading-state";

class IllegalStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IllegalStateTransitionError";
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

/**
 * @class LoadingStateMachine
 */
export class LoadingStateMachine<T> {
  private _state$: BehaviorSubject<LoadingState>;
  private _data: T | undefined;
  private _error: any;

  constructor() {
    this._state$ = new BehaviorSubject<LoadingState>(LoadingState.NotStarted);
  }

  /**
   * Creates a new observable that represents the current state of the machine
   *
   * @returns {Observable<LoadingState>} Observable that emits the machine state
   */
  asObservable(): Observable<LoadingState> {
    return this._state$.asObservable();
  }

  /**
   * Data of the current state. Depending on the current state, this may be undefined.
   */
  get data(): T | undefined {
    return this._data;
  }

  /**
   * Error of the current state. Depending on the current state, this may be undefined.
   */
  get error(): any {
    return this._error;
  }

  /**
   * The current LoadingState
   */
  get state(): LoadingState {
    return this._state$.getValue();
  }

  update(newData?: T) {
    if (!this.isLoading()) {
      throw new Error(
        `Update is only allowed during ${LoadingState.Loading} state`
      );
    }

    this._data = newData;
    this._state$.next(LoadingState.Loading);
  }

  start() {
    if (this.isLoading()) {
      throw new IllegalStateTransitionError(
        `Transition from ${this.state} to ${LoadingState.Loading} not allowed`
      );
    }

    this._state$.next(LoadingState.Loading);
  }

  succeed(data?: T) {
    if (!this.isLoading()) {
      throw new IllegalStateTransitionError(
        `Transition from ${this.state} to ${LoadingState.Success} not allowed`
      );
    }

    this._data = data;
    this._error = undefined;
    this._state$.next(LoadingState.Success);
  }

  fail(error: any) {
    if (!this.isLoading()) {
      throw new IllegalStateTransitionError(
        `Transition from ${this.state} to ${LoadingState.Error} not allowed`
      );
    }

    this._data = undefined;
    this._error = error;
    this._state$.next(LoadingState.Error);
  }

  reset() {
    if (this.isNotStarted()) {
      throw new IllegalStateTransitionError(
        `Transition from ${this.state} to ${LoadingState.NotStarted} not allowed`
      );
    }

    this._error = undefined;
    this._data = undefined;
    this._state$.next(LoadingState.NotStarted);
  }

  isNotStarted(): boolean {
    return this.state === LoadingState.NotStarted;
  }

  isLoading(): boolean {
    return this.state === LoadingState.Loading;
  }

  isError(): boolean {
    return this.state === LoadingState.Error;
  }

  isSuccess(): boolean {
    return this.state === LoadingState.Success;
  }

  public static asError(error: any) {
    const state = new LoadingStateMachine();
    state.start();
    state.fail(error);
    return state;
  }

  public static asSuccess<T>(data: T) {
    const state = new LoadingStateMachine<T>();
    state.start();
    state.succeed(data);
    return state;
  }

  public static asLoading<T>(data: T | undefined = undefined) {
    const state = new LoadingStateMachine<T>();
    state.start();
    state.update(data);
    return state;
  }
}
