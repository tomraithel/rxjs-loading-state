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
 * Handles transitions between different loading state and holds the context data that is related to the current state.
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

  /**
   * Update data while in loading state
   * @param {T} newData
   */
  update(newData?: T) {
    if (!this.isLoading()) {
      throw new Error(
        `Update is only allowed during ${LoadingState.Loading} state`
      );
    }

    this._data = newData;
    this._state$.next(LoadingState.Loading);
  }

  /**
   * Starts loading
   */
  start() {
    if (this.isLoading()) {
      throw new IllegalStateTransitionError(
        `Transition from ${this.state} to ${LoadingState.Loading} not allowed`
      );
    }

    this._state$.next(LoadingState.Loading);
  }

  /**
   * Transition to success state
   * @param {T} data
   */
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

  /**
   * Transition to error state
   * @param {any} error
   */
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

  /**
   * Resets machine to not started
   */
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

  /**
   * @returns {Boolean} True if machine if loading has not been started or reset
   */
  isNotStarted(): boolean {
    return this.state === LoadingState.NotStarted;
  }

  /**
   * @returns {Boolean} True if machine is in loading state
   */
  isLoading(): boolean {
    return this.state === LoadingState.Loading;
  }

  /**
   *
   * @returns {Boolean} True if machine is in error state
   */
  isError(): boolean {
    return this.state === LoadingState.Error;
  }

  /**
   * @returns {Boolean} True if machine is in success state
   */
  isSuccess(): boolean {
    return this.state === LoadingState.Success;
  }

  /**
   * Factory to create a new machine in error state
   * @param {any} error
   * @returns {LoadingStateMachine<T>} The new LoadingStateMachine
   */
  public static asError<T>(error: any) {
    const state = new LoadingStateMachine<T>();
    state.start();
    state.fail(error);
    return state;
  }

  /**
   * Factory to create a new machine in success state
   * @param {T} data
   * @returns {LoadingStateMachine<T>} The new LoadingStateMachine
   */
  public static asSuccess<T>(data: T) {
    const state = new LoadingStateMachine<T>();
    state.start();
    state.succeed(data);
    return state;
  }

  /**
   * Factory to create a new machine in loading state
   * @param {T | undefined} data
   * @returns {LoadingStateMachine<T>} The new LoadingStateMachine
   */
  public static asLoading<T>(data: T | undefined = undefined) {
    const state = new LoadingStateMachine<T>();
    state.start();
    state.update(data);
    return state;
  }
}
