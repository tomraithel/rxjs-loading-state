import { LoadingState, LoadingStateType } from "./loading-state";
import { LoadingStateSubject } from "./loading-state.subject";

describe("LoadingState", () => {
  it("should have default state", () => {
    const ls = new LoadingStateSubject();
    expect(ls.isNotStarted()).toEqual(true);
  });

  it("should transition from not started to loading", () => {
    const ls = new LoadingStateSubject();
    ls.setLoading();
    expect(ls.isLoading()).toEqual(true);
  });

  it("should transition from error to loading", () => {
    const ls = new LoadingStateSubject();
    ls.setLoading();
    ls.setError(null);
    ls.setLoading();
    expect(ls.isLoading()).toEqual(true);
    expect(ls.getStateValue()).toEqual({
      type: LoadingStateType.Loading,
    } as LoadingState<string>);
  });

  it("should transition from success to loading with data", () => {
    const ls = new LoadingStateSubject();
    ls.setLoading();
    ls.setSuccess("foo");
    ls.setLoading();
    expect(ls.isLoading()).toEqual(true);
    expect(ls.getStateValue()).toEqual({
      type: LoadingStateType.Loading,
      data: "foo",
    } as LoadingState<string>);
  });

  it("should throw error if transition from loading to loading", () => {
    const ls = new LoadingStateSubject();
    expect(() => {
      ls.setLoading();
      ls.setLoading();
    }).toThrowError();
  });

  it("should transition from loading to success", () => {
    const ls = new LoadingStateSubject<string>();
    ls.setLoading();
    ls.setSuccess("foo");
    expect(ls.isSuccess()).toEqual(true);
    expect(ls.getStateValue()).toEqual({
      type: LoadingStateType.Success,
      data: "foo",
    } as LoadingState<string>);
  });

  it("should throw error if transition from success to success", () => {
    const ls = new LoadingStateSubject();
    expect(() => {
      ls.setLoading();
      ls.setSuccess("fii");
      ls.setSuccess("fii");
    }).toThrowError();
  });

  it("should transition from loading to error", () => {
    const ls = new LoadingStateSubject();
    ls.setLoading();
    ls.setError(new Error("foo"));
    expect(ls.isError()).toEqual(true);
    expect(ls.getStateValue()).toEqual({
      type: LoadingStateType.Error,
      error: new Error("foo"),
    });
  });

  it("should throw error if transition from error to error", () => {
    const ls = new LoadingStateSubject();
    expect(() => {
      ls.setLoading();
      ls.setError(null);
      ls.setError(null);
    }).toThrowError();
  });

  it("should throw error if resetting during loading state", () => {
    const ls = new LoadingStateSubject();
    ls.setLoading();
    expect(() => {
      ls.reset();
    }).toThrowError();
  });

  it("should successfully reset in any state", () => {
    const ls = new LoadingStateSubject<string>({
      type: LoadingStateType.Success,
      data: "foo",
    });
    ls.reset();
    expect(ls.isNotStarted()).toEqual(true);
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
});
