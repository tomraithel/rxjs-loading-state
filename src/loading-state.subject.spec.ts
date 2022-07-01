import type { Subscription } from "rxjs";
import { LoadingState, LoadingStateType } from "./loading-state";
import { LoadingStateSubject } from "./loading-state.subject";

describe("LoadingState", () => {
  it("should have default state", () => {
    const subject = new LoadingStateSubject();
    expect(subject.isNotStarted()).toEqual(true);
  });

  it("should transition from not started to loading", () => {
    const subject = new LoadingStateSubject();
    subject.setLoading();
    expect(subject.isLoading()).toEqual(true);
  });

  it("should transition from error to loading", () => {
    const subject = new LoadingStateSubject();
    subject.setLoading();
    subject.setError(null);
    subject.setLoading();
    expect(subject.isLoading()).toEqual(true);
    expect(subject.getState()).toEqual({
      type: LoadingStateType.Loading,
    } as LoadingState<string>);
  });

  it("should transition from success to loading with data", () => {
    const subject = new LoadingStateSubject();
    subject.setLoading();
    subject.setSuccess("foo");
    subject.setLoading();
    expect(subject.isLoading()).toEqual(true);
    expect(subject.getState()).toEqual({
      type: LoadingStateType.Loading,
      data: "foo",
    } as LoadingState<string>);
  });

  it("should throw error if transition from loading to loading", () => {
    const subject = new LoadingStateSubject();
    expect(() => {
      subject.setLoading();
      subject.setLoading();
    }).toThrowError();
  });

  it("should transition from loading to success", () => {
    const subject = new LoadingStateSubject<string>();
    subject.setLoading();
    subject.setSuccess("foo");
    expect(subject.isSuccess()).toEqual(true);
    expect(subject.getState()).toEqual({
      type: LoadingStateType.Success,
      data: "foo",
    } as LoadingState<string>);
  });

  it("should throw error if transition from success to success", () => {
    const subject = new LoadingStateSubject();
    expect(() => {
      subject.setLoading();
      subject.setSuccess("fii");
      subject.setSuccess("fii");
    }).toThrowError();
  });

  it("should transition from loading to error", () => {
    const subject = new LoadingStateSubject();
    subject.setLoading();
    subject.setError(new Error("foo"));
    expect(subject.isError()).toEqual(true);
    expect(subject.getState()).toEqual({
      type: LoadingStateType.Error,
      error: new Error("foo"),
    });
  });

  it("should throw error if transition from error to error", () => {
    const subject = new LoadingStateSubject();
    expect(() => {
      subject.setLoading();
      subject.setError(null);
      subject.setError(null);
    }).toThrowError();
  });

  it("should throw error if resetting during loading state", () => {
    const subject = new LoadingStateSubject();
    subject.setLoading();
    expect(() => {
      subject.reset();
    }).toThrowError();
  });

  it("should successfully reset in any state", () => {
    const subject = new LoadingStateSubject<string>({
      type: LoadingStateType.Success,
      data: "foo",
    });
    subject.reset();
    expect(subject.isNotStarted()).toEqual(true);
  });

  it("should throw an error if setNotStarted is called in invalid state", () => {
    const subject = new LoadingStateSubject();
    expect(() => {
      subject.setNotStarted();
    }).toThrowError();
  });

  it("should set the notStarted state correctly (cancelling a loading state)", () => {
    const subject = new LoadingStateSubject();
    subject.setLoading();
    subject.setNotStarted();
    expect(subject.isNotStarted()).toEqual(true);
  });

  it("should return the error if in error state", () => {
    const subject = new LoadingStateSubject();
    subject.setLoading();
    subject.setError("something went wrong");
    expect(subject.getError()).toEqual("something went wrong");
  });

  it("should throw an error if getError is called when not in loading state", () => {
    const subject = new LoadingStateSubject();
    subject.setLoading();
    expect(() => {
      subject.getError();
    }).toThrow();
  });

  it("should emit loading states on subscription", () => {
    const subject = new LoadingStateSubject<number>();
    let states: LoadingState<number>[] = [];
    subject.asObservable().subscribe((v) => {
      states.push(v);
    });
    subject.setLoading();

    const expectedEmittedStates: LoadingState<number>[] = [
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
    const subject = new LoadingStateSubject<number>();
    let states: LoadingState<number>[] = [];
    const subscription: Subscription = subject.asObservable().subscribe((v) => {
      states.push(v);
    });
    subscription.unsubscribe();
    subject.setLoading();

    const expectedEmittedStates: LoadingState<number>[] = [
      {
        type: LoadingStateType.NotStarted,
      },
    ];
    expect(states).toEqual(expectedEmittedStates);
  });
});
