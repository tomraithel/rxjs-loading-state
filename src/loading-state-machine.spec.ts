import type { Subscription } from "rxjs";
import { LoadingState } from "./loading-state";
import { LoadingStateMachine } from "./loading-state-machine";

describe("LoadingStateMachine", () => {
  it("should have default notStarted state", () => {
    const s = new LoadingStateMachine();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should transition from not started to loading", () => {
    const s = new LoadingStateMachine();
    s.start();
    expect(s.isLoading()).toEqual(true);
  });

  it("should transition from error to loading with error", () => {
    const s = new LoadingStateMachine();
    s.start();
    s.fail({ someError: true });
    s.start();
    expect(s.isLoading()).toEqual(true);
    expect(s.error).toEqual({ someError: true });
    expect(s.state).toEqual(LoadingState.Loading);
  });

  it("should transition from success to loading with data", () => {
    const s = new LoadingStateMachine();
    s.start();
    s.succeed("foo");
    s.start();
    expect(s.isLoading()).toEqual(true);
    expect(s.state).toEqual(LoadingState.Loading);
    expect(s.data).toEqual("foo");
  });

  it("should throw error if transition from loading to loading", () => {
    const s = new LoadingStateMachine();
    expect(() => {
      s.start();
      s.start();
    }).toThrowError();
  });

  it("should transition from loading to success and clear errors", () => {
    const s = new LoadingStateMachine<string>();
    s.start();
    s.fail({});
    s.start();
    s.succeed("foo");
    expect(s.isSuccess()).toEqual(true);
    expect(s.state).toEqual(LoadingState.Success);
    expect(s.data).toEqual("foo");
    expect(s.error).toEqual(undefined);
  });

  it("should throw error if transition from success to success", () => {
    const s = new LoadingStateMachine();
    expect(() => {
      s.start();
      s.succeed("fii");
      s.succeed("fii");
    }).toThrowError();
  });

  it("should transition from loading to error and clear data", () => {
    const s = new LoadingStateMachine();
    s.start();
    s.succeed("hello");
    s.start();
    s.fail(new Error("foo"));
    expect(s.isError()).toEqual(true);
    expect(s.state).toEqual(LoadingState.Error);
    expect(s.error).toEqual(new Error("foo"));
    expect(s.data).toEqual(undefined);
  });

  it("should throw error if transition from error to error", () => {
    const s = new LoadingStateMachine();
    expect(() => {
      s.start();
      s.fail(null);
      s.fail(null);
    }).toThrowError();
  });

  it("should throw error if resetting during notStarted state", () => {
    const s = new LoadingStateMachine();
    expect(() => {
      s.reset();
    }).toThrowError();
  });

  it("should successfully reset in loading state", () => {
    const s = new LoadingStateMachine();
    s.start();
    s.reset();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should successfully reset in success state", () => {
    const s = new LoadingStateMachine<string>();
    s.start();
    s.succeed("foo");
    s.reset();
    expect(s.isNotStarted()).toEqual(true);
    expect(s.data).toEqual(undefined);
  });

  it("should successfully reset in error state", () => {
    const s = new LoadingStateMachine<string>();
    s.start();
    s.fail({});
    s.reset();
    expect(s.isNotStarted()).toEqual(true);
    expect(s.error).toEqual(undefined);
  });

  it("should throw an error if reset is called in notStarted state", () => {
    const s = new LoadingStateMachine();
    expect(() => {
      s.reset();
    }).toThrowError();
  });

  it("should set the notStarted state correctly (cancelling a loading state)", () => {
    const s = new LoadingStateMachine();
    s.start();
    s.reset();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should return the error if in error state", () => {
    const s = new LoadingStateMachine();
    s.start();
    s.fail("something went wrong");
    expect(s.error).toEqual("something went wrong");
  });

  it("should return undefined getError is called when not in error state", () => {
    const s = new LoadingStateMachine();
    s.start();
    expect(s.error).toBe(undefined);
  });

  it("should emit loading states on subscription", () => {
    const s = new LoadingStateMachine<number>();
    let states: LoadingState[] = [];
    s.asObservable().subscribe((v) => {
      states.push(v);
    });
    s.start();

    const expectedEmittedStates: LoadingState[] = [
      LoadingState.NotStarted,
      LoadingState.Loading,
    ];
    expect(states).toEqual(expectedEmittedStates);
  });

  it("should unsubscribe from previous subscription", () => {
    const s = new LoadingStateMachine<number>();
    let states: LoadingState[] = [];
    const subscription: Subscription = s.asObservable().subscribe((v) => {
      states.push(v);
    });
    subscription.unsubscribe();
    s.start();

    const expectedEmittedStates: LoadingState[] = [LoadingState.NotStarted];
    expect(states).toEqual(expectedEmittedStates);
  });

  it("should have a factory to start in error state", () => {
    const s = LoadingStateMachine.asError({ error: true });
    expect(s.state).toEqual(LoadingState.Error);
    expect(s.error).toEqual({ error: true });
    expect(s.data).toEqual(undefined);
  });

  it("should have a factory to start in success state", () => {
    const s = LoadingStateMachine.asSuccess("foo");
    expect(s.state).toEqual(LoadingState.Success);
    expect(s.error).toEqual(undefined);
    expect(s.data).toEqual("foo");
  });

  it("should have a factory to start in loading state", () => {
    const s = LoadingStateMachine.asLoading();
    expect(s.state).toEqual(LoadingState.Loading);
    expect(s.error).toEqual(undefined);
    expect(s.data).toEqual(undefined);
  });

  it("should have a factory to start in loading state with data", () => {
    const s = LoadingStateMachine.asLoading("foo");
    expect(s.state).toEqual(LoadingState.Loading);
    expect(s.error).toEqual(undefined);
    expect(s.data).toEqual("foo");
  });
});
