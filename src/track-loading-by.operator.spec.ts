import { catchError, from, Observable, of, Subject, throwError } from "rxjs";
import { trackLoadingBy } from "./track-loading-by.operator";
import { LoadingStateMachine } from "./loading-state-machine";

describe("trackLoadingBy", () => {
  let loadingStateMachine: LoadingStateMachine<number>;

  beforeEach(() => {
    loadingStateMachine = new LoadingStateMachine<number>();
  });

  it("should have default state if stream not subscribed", () => {
    expect(loadingStateMachine.isNotStarted()).toEqual(true);
  });

  it("should have loading state, if subscribed but not completed", () => {
    const subject = new Subject<number>();
    const stream$ = subject.pipe(trackLoadingBy(loadingStateMachine));
    stream$.subscribe();
    expect(loadingStateMachine.isLoading()).toEqual(true);
  });

  it("should have success state if subscribed and completed", () => {
    const stream$ = from([1, 2, 3, 4]).pipe(
      trackLoadingBy(loadingStateMachine)
    );
    stream$.subscribe();
    expect(loadingStateMachine.isSuccess()).toEqual(true);
  });

  it("should have error state if error occurred", () => {
    const stream$ = (
      throwError(() => new Error("foo")) as Observable<number>
    ).pipe(
      trackLoadingBy(loadingStateMachine),
      catchError(() => {
        return of(1);
      })
    );
    stream$.subscribe();
    expect(loadingStateMachine.isError()).toEqual(true);
  });

  it("should update the value correctly during loading", (done) => {
    const stream$ = from([1, 2, 3, 4]).pipe(
      trackLoadingBy(loadingStateMachine)
    );

    stream$.subscribe({
      next: (value) => {
        expect(loadingStateMachine.data).toEqual(value);
      },
      complete: () => {
        expect(loadingStateMachine.isSuccess()).toEqual(true);
        expect(loadingStateMachine.data).toEqual(4);

        // Need a timeout to test the tests in next()
        setTimeout(() => {
          done();
        });
      },
    });
  });

  it("should update the value and apply a data mapper", (done) => {
    const stream$ = from(["1", "2", "3", "4"]).pipe(
      trackLoadingBy(loadingStateMachine, (data) => {
        return parseInt(data, 10) * 2;
      })
    );

    stream$.subscribe({
      next: (value) => {
        expect(loadingStateMachine.data).toEqual(parseInt(value, 10) * 2);
      },
      complete: () => {
        expect(loadingStateMachine.isSuccess()).toEqual(true);
        expect(loadingStateMachine.data).toEqual(8);

        // Need a timeout to test the tests in next()
        setTimeout(() => {
          done();
        });
      },
    });
  });

  it("should have notStarted state after subscription has been cancelled", () => {
    const subject = new Subject<number>();
    const stream$ = subject.pipe(trackLoadingBy(loadingStateMachine));
    const subscription = stream$.subscribe();
    expect(loadingStateMachine.isLoading()).toEqual(true);
    subscription.unsubscribe();
    expect(loadingStateMachine.isNotStarted()).toEqual(true);
  });

  it("should have no open subscribers after unsubscribe", () => {
    const subject = new Subject<number>();
    const stream$ = subject.pipe(trackLoadingBy(loadingStateMachine));
    const subscription = stream$.subscribe();
    subscription.unsubscribe();
    expect(subject.observed).toEqual(false);
  });
});
