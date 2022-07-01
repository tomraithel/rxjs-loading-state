import type { Subscription } from "rxjs";
import { LoadingState } from "./loading-state";
import type { LoadingStateSnapshot } from "./loading-state.snapshot";
import { LoadingStateType } from "./loading-state.type";

describe("LoadingState", () => {
  it("should have default state", () => {
    const s = new LoadingState();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should transition from not started to loading", () => {
    const s = new LoadingState();
    s.setLoading();
    expect(s.isLoading()).toEqual(true);
  });

  it("should transition from error to loading", () => {
    const s = new LoadingState();
    s.setLoading();
    s.setError(null);
    s.setLoading();
    expect(s.isLoading()).toEqual(true);
    expect(s.getState()).toEqual({
      type: LoadingStateType.Loading,
    } as LoadingStateSnapshot<string>);
  });

  it("should transition from success to loading with data", () => {
    const s = new LoadingState();
    s.setLoading();
    s.setSuccess("foo");
    s.setLoading();
    expect(s.isLoading()).toEqual(true);
    expect(s.getState()).toEqual({
      type: LoadingStateType.Loading,
      data: "foo",
    } as LoadingStateSnapshot<string>);
  });

  it("should throw error if transition from loading to loading", () => {
    const s = new LoadingState();
    expect(() => {
      s.setLoading();
      s.setLoading();
    }).toThrowError();
  });

  it("should transition from loading to success", () => {
    const s = new LoadingState<string>();
    s.setLoading();
    s.setSuccess("foo");
    expect(s.isSuccess()).toEqual(true);
    expect(s.getState()).toEqual({
      type: LoadingStateType.Success,
      data: "foo",
    } as LoadingStateSnapshot<string>);
  });

  it("should throw error if transition from success to success", () => {
    const s = new LoadingState();
    expect(() => {
      s.setLoading();
      s.setSuccess("fii");
      s.setSuccess("fii");
    }).toThrowError();
  });

  it("should transition from loading to error", () => {
    const s = new LoadingState();
    s.setLoading();
    s.setError(new Error("foo"));
    expect(s.isError()).toEqual(true);
    expect(s.getState()).toEqual({
      type: LoadingStateType.Error,
      error: new Error("foo"),
    });
  });

  it("should throw error if transition from error to error", () => {
    const s = new LoadingState();
    expect(() => {
      s.setLoading();
      s.setError(null);
      s.setError(null);
    }).toThrowError();
  });

  it("should throw error if resetting during loading state", () => {
    const s = new LoadingState();
    s.setLoading();
    expect(() => {
      s.reset();
    }).toThrowError();
  });

  it("should successfully reset in any state", () => {
    const s = new LoadingState<string>({
      type: LoadingStateType.Success,
      data: "foo",
    });
    s.reset();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should throw an error if setNotStarted is called in invalid state", () => {
    const s = new LoadingState();
    expect(() => {
      s.setNotStarted();
    }).toThrowError();
  });

  it("should set the notStarted state correctly (cancelling a loading state)", () => {
    const s = new LoadingState();
    s.setLoading();
    s.setNotStarted();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should return the error if in error state", () => {
    const s = new LoadingState();
    s.setLoading();
    s.setError("something went wrong");
    expect(s.getError()).toEqual("something went wrong");
  });

  it("should throw an error if getError is called when not in loading state", () => {
    const s = new LoadingState();
    s.setLoading();
    expect(() => {
      s.getError();
    }).toThrow();
  });

  it("should emit loading states on subscription", () => {
    const s = new LoadingState<number>();
    let states: LoadingStateSnapshot<number>[] = [];
    s.asObservable().subscribe((v) => {
      states.push(v);
    });
    s.setLoading();

    const expectedEmittedStates: LoadingStateSnapshot<number>[] = [
      {
        type: LoadingStateType.NotStarted,
      },
      {
        type: LoadingStateType.Loading,
        data: undefined,
      },
    ];
    expect(states).toEqual(expectedEmittedStates);
  });

  it("should unsubscribe from previous subscription", () => {
    const s = new LoadingState<number>();
    let states: LoadingStateSnapshot<number>[] = [];
    const subscription: Subscription = s.asObservable().subscribe((v) => {
      states.push(v);
    });
    subscription.unsubscribe();
    s.setLoading();

    const expectedEmittedStates: LoadingStateSnapshot<number>[] = [
      {
        type: LoadingStateType.NotStarted,
      },
    ];
    expect(states).toEqual(expectedEmittedStates);
  });
});
