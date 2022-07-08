# rxjs-loading-state

**rxjs-loading-state** eliminates manual state management for loading and error states by transforming `Observables` into a `LoadingState`.

### TL;DR

Loading State handling comes in two flavours:

- a mutable LoadingState as a side-effect
- a pure map operator without side-effects

Example:

```ts
// Some observable that finishes after 2000ms
const dummyData$ = of(42).pipe(delay(2000));

// Option 1 - with side-effects:
// Create a LoadingState Object and connect it to the Observable
const loadingState = new LoadingState<number>();
dummyData$.pipe(connectToLoadingState(loadingState)).subscribe();

// Option 2 - no side-effects:
// Map the original Observable to a LoadingStateSnapshot
dummyData$
  .pipe(mapToLoadingStateSnapshot())
  .subscribe((snapShot: LoadingStateSnapshot) => {
    console.log(snapShot.type);
  });
```

### How to install?

```bash
npm install rxjs-loading-state --save
```

### What is a `LoadingState`?

The `LoadingState` class is a small state-machine that consists of four states it can be in:

| Type         | Description                       |
| ------------ | --------------------------------- |
| `NotStarted` | Loading has not started yet.      |
| `Loading`    | Data is being loaded or re-loaded |
| `Error`      | An error occurred during loading  |
| `Success`    | Data has successfully been loaded |

<div align="center">
    <img alt="date-fns" title="date-fns" src="./docs/state-machine.png" width="300" />
</div>

[![rxjs-loading-state](https://circleci.com/gh/tomraithel/rxjs-loading-state.svg?style=shield)](https://app.circleci.com/pipelines/github/tomraithel/rxjs-loading-state)

README: TODO :/

```
const fetchMachine = Machine({
  id: "LoadingState",
  initial: "notStarted",
  context: {
    retries: 0,
  },
  states: {
    notStarted: {
      on: {
        subscribe: "loading",
      },
    },
    loading: {
      on: {
        next: "loading",
        complete: "success",
        unsubscribe: "notStarted",
        error: "error",
      },
    },
    success: {
      on: {
        subscribe: "loading",
      },
    },
    error: {
      on: {
        subscribe: "loading",
      },
    },
  },
});
```
