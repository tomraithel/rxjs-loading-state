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
    s.start();
    expect(s.isLoading()).toEqual(true);
  });

  it("should transition from error to loading", () => {
    const s = new LoadingState();
    s.start();
    s.fail(null);
    s.start();
    expect(s.isLoading()).toEqual(true);
    expect(s.getSnapshot()).toEqual({
      type: LoadingStateType.Loading,
    } as LoadingStateSnapshot<string>);
  });

  it("should transition from success to loading with data", () => {
    const s = new LoadingState();
    s.start();
    s.succeed("foo");
    s.start();
    expect(s.isLoading()).toEqual(true);
    expect(s.getSnapshot()).toEqual({
      type: LoadingStateType.Loading,
      data: "foo",
    } as LoadingStateSnapshot<string>);
  });

  it("should throw error if transition from loading to loading", () => {
    const s = new LoadingState();
    expect(() => {
      s.start();
      s.start();
    }).toThrowError();
  });

  it("should transition from loading to success", () => {
    const s = new LoadingState<string>();
    s.start();
    s.succeed("foo");
    expect(s.isSuccess()).toEqual(true);
    expect(s.getSnapshot()).toEqual({
      type: LoadingStateType.Success,
      data: "foo",
    } as LoadingStateSnapshot<string>);
  });

  it("should throw error if transition from success to success", () => {
    const s = new LoadingState();
    expect(() => {
      s.start();
      s.succeed("fii");
      s.succeed("fii");
    }).toThrowError();
  });

  it("should transition from loading to error", () => {
    const s = new LoadingState();
    s.start();
    s.fail(new Error("foo"));
    expect(s.isError()).toEqual(true);
    expect(s.getSnapshot()).toEqual({
      type: LoadingStateType.Error,
      error: new Error("foo"),
    });
  });

  it("should throw error if transition from error to error", () => {
    const s = new LoadingState();
    expect(() => {
      s.start();
      s.fail(null);
      s.fail(null);
    }).toThrowError();
  });

  it("should throw error if resetting during notStarted state", () => {
    const s = new LoadingState();
    expect(() => {
      s.reset();
    }).toThrowError();
  });

  it("should successfully reset in loading state", () => {
    const s = new LoadingState();
    s.start();
    s.reset();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should successfully reset in success state", () => {
    const s = new LoadingState<string>({
      type: LoadingStateType.Success,
      data: "foo",
    });
    s.reset();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should successfully reset in error state", () => {
    const s = new LoadingState<string>({
      type: LoadingStateType.Error,
      error: {},
    });
    s.reset();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should throw an error if reset is called in notStarted state", () => {
    const s = new LoadingState();
    expect(() => {
      s.reset();
    }).toThrowError();
  });

  it("should set the notStarted state correctly (cancelling a loading state)", () => {
    const s = new LoadingState();
    s.start();
    s.reset();
    expect(s.isNotStarted()).toEqual(true);
  });

  it("should return the error if in error state", () => {
    const s = new LoadingState();
    s.start();
    s.fail("something went wrong");
    expect(s.getError()).toEqual("something went wrong");
  });

  it("should return undefined getError is called when not in loading state", () => {
    const s = new LoadingState();
    s.start();
    expect(s.getError()).toBe(undefined);
  });

  it("should emit loading states on subscription", () => {
    const s = new LoadingState<number>();
    let states: LoadingStateSnapshot<number>[] = [];
    s.asObservable().subscribe((v) => {
      states.push(v);
    });
    s.start();

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
    s.start();

    const expectedEmittedStates: LoadingStateSnapshot<number>[] = [
      {
        type: LoadingStateType.NotStarted,
      },
    ];
    expect(states).toEqual(expectedEmittedStates);
  });
});
