import { catchError, from, Observable, of, Subject, throwError } from "rxjs";
import { connectToLoadingState } from "./connect-to-loading-state.operator";
import { LoadingStateSubject } from "./loading-state.subject";

describe("connectToLoadingState", () => {
  let loadingState: LoadingStateSubject<number>;

  beforeEach(() => {
    loadingState = new LoadingStateSubject<number>();
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

  it("should have error state if error occurred", () => {
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
