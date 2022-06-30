import { catchError, from, Observable, of, Subject, throwError } from "rxjs";
import {
  connectToLoadingState,
  LoadingState,
  LoadingStateType,
  LoadingStateValue,
} from "./main";

describe("LoadingState", () => {
  it("should have default state", () => {
    const ls = new LoadingState();
    expect(ls.isNotStarted()).toEqual(true);
  });

  it("should transition from not started to loading", () => {
    const ls = new LoadingState();
    ls.setLoading();
    expect(ls.isLoading()).toEqual(true);
  });

  it("should transition from error to loading", () => {
    const ls = new LoadingState();
    ls.setLoading();
    ls.setError(null);
    ls.setLoading();
    expect(ls.isLoading()).toEqual(true);
    expect(ls.getStateValue()).toEqual({
      type: LoadingStateType.Loading,
    } as LoadingStateValue<string>);
  });

  it("should transition from success to loading with data", () => {
    const ls = new LoadingState();
    ls.setLoading();
    ls.setSuccess("foo");
    ls.setLoading();
    expect(ls.isLoading()).toEqual(true);
    expect(ls.getStateValue()).toEqual({
      type: LoadingStateType.Loading,
      data: "foo",
    } as LoadingStateValue<string>);
  });

  it("should throw error if transition from loading to loading", () => {
    const ls = new LoadingState();
    expect(() => {
      ls.setLoading();
      ls.setLoading();
    }).toThrowError();
  });

  it("should transition from loading to success", () => {
    const ls = new LoadingState<string>();
    ls.setLoading();
    ls.setSuccess("foo");
    expect(ls.isSuccess()).toEqual(true);
    expect(ls.getStateValue()).toEqual({
      type: LoadingStateType.Success,
      data: "foo",
    } as LoadingStateValue<string>);
  });

  it("should throw error if transition from success to success", () => {
    const ls = new LoadingState();
    expect(() => {
      ls.setLoading();
      ls.setSuccess("fii");
      ls.setSuccess("fii");
    }).toThrowError();
  });

  it("should transition from loading to error", () => {
    const ls = new LoadingState();
    ls.setLoading();
    ls.setError(new Error("foo"));
    expect(ls.isError()).toEqual(true);
    expect(ls.getStateValue()).toEqual({
      type: LoadingStateType.Error,
      error: new Error("foo"),
    });
  });

  it("should throw error if transition from error to error", () => {
    const ls = new LoadingState();
    expect(() => {
      ls.setLoading();
      ls.setError(null);
      ls.setError(null);
    }).toThrowError();
  });

  it("should throw error if resetting during loading state", () => {
    const ls = new LoadingState();
    ls.setLoading();
    expect(() => {
      ls.reset();
    }).toThrowError();
  });

  it("should successfully reset in any state", () => {
    const ls = new LoadingState<string>({
      type: LoadingStateType.Success,
      data: "foo",
    });
    ls.reset();
    expect(ls.isNotStarted()).toEqual(true);
  });

  it("should throw an error if setNotStarted is called in invalid state", () => {
    const subject = new LoadingState();
    expect(() => {
      subject.setNotStarted();
    }).toThrowError();
  });

  it("should set the notStarted state correctly (cancelling a loading state)", () => {
    const subject = new LoadingState();
    subject.setLoading();
    subject.setNotStarted();
    expect(subject.isNotStarted()).toEqual(true);
  });

  it("should return the error if in error state", () => {
    const subject = new LoadingState();
    subject.setLoading();
    subject.setError("something went wrong");
    expect(subject.getError()).toEqual("something went wrong");
  });

  it("should throw an error if getError is called when not in loading state", () => {
    const subject = new LoadingState();
    subject.setLoading();
    expect(() => {
      subject.getError();
    }).toThrow();
  });
});

describe("connectToLoadingState", () => {
  let loadingState: LoadingState<number>;
  beforeEach(() => {
    loadingState = new LoadingState<number>();
  });

  it("should have default state if stream not subscribed", () => {
    expect(loadingState.isNotStarted()).toEqual(true);
  });

  it("should have loading state, if subscribed but not completed", () => {
    const subject = new Subject<number>();
    const stream$ = subject.pipe(connectToLoadingState(loadingState));
    stream$.subscribe();
    expect(loadingState.isLoading()).toEqual(true);
  });

  it("should have success state if subscribed and completed", () => {
    const stream$ = from([1, 2, 3, 4]).pipe(
      connectToLoadingState(loadingState)
    );
    stream$.subscribe();
    expect(loadingState.isSuccess()).toEqual(true);
  });

  it("should have error state if error occured", () => {
    const stream$ = (
      throwError(() => new Error("foo")) as Observable<number>
    ).pipe(
      connectToLoadingState(loadingState),
      catchError(() => {
        return of(1);
      })
    );
    stream$.subscribe();
    expect(loadingState.isError()).toEqual(true);
  });

  it("should update the value correctly during loading", (done) => {
    const stream$ = from([1, 2, 3, 4]).pipe(
      connectToLoadingState(loadingState)
    );

    stream$.subscribe({
      next: (value) => {
        expect(loadingState.getData()).toEqual(value);
      },
      complete: () => {
        expect(loadingState.isSuccess()).toEqual(true);
        expect(loadingState.getData()).toEqual(4);

        // Need a timeout to test the tests in next()
        setTimeout(() => {
          done();
        });
      },
    });
  });

  it("should have notStarted state after subscription has been cancelled", () => {
    const subject = new Subject<number>();
    const stream$ = subject.pipe(connectToLoadingState(loadingState));
    const subscription = stream$.subscribe();
    expect(loadingState.isLoading()).toEqual(true);
    subscription.unsubscribe();
    expect(loadingState.isNotStarted()).toEqual(true);
  });

  it("should have no open subscribers after unsubscribe", () => {
    const subject = new Subject<number>();
    const stream$ = subject.pipe(connectToLoadingState(loadingState));
    const subscription = stream$.subscribe();
    subscription.unsubscribe();
    expect(subject.observed).toEqual(false);
  });
});
