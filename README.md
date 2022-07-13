<center style="max-width: 500px; margin: 0 auto;">

# rxjs-loading-state

[![rxjs-loading-state](https://circleci.com/gh/tomraithel/rxjs-loading-state.svg?style=shield)](https://app.circleci.com/pipelines/github/tomraithel/rxjs-loading-state)

**rxjs-loading-state** eliminates manual state management for loading and error states by transforming `Observables` into a `LoadingState`.

</center>

## Table of contents:

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [TL;DR](#tldr)
  - [What is a LoadingState?](#what-is-a-loading-state)
- [API](#api)
  - [LoadingState](#loading-state)
    - [getObject()](#getobject)
    - [getAll()](#getall)
    - [put()](#put)
    - [putObject()](#putobject)
    - [remove()](#remove)
    - [removeAll()](#removeall)

## <a name="getting-started"></a> Getting started

### <a name="installation"></a> How to install?

Installation via NPM:

```bash
npm install rxjs-loading-state --save
```

### <a name="tldr"></a> TL;DR

You create a `LoadingState` object and connect it to your observable. This object now reflects the loading state of your observable:

```ts
// Create a LoadingState object
const loadingState = new LoadingState<number>();

// Create an observable that finishes after 1000ms and connect it to the loadingState
const loadData$ = of(42).pipe(delay(1000), connectToLoadingState(loadingState));

// As long as no one is subscribed, loading state is in "notStarted" state
loadingState.getType(); // "notStarted"

// After subscription, loading state transitions to "loading" state
loadData$.subscribe();
loadingState.getType(); // "loading"

// After 2s the Observable is completed and loadingState transitioned to "success"
setTimeout(() => {
  loadingState.getType(); // "success"
}, 2000);
```

### <a name="what-is-a-loading-state"></a> What is a `LoadingState`?

The `LoadingState` class is a small state-machine that consists of four states it can be in:

| Type         | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `NotStarted` | Loading has not been started.yet.                            |
| `Loading`    | Data is getting loaded. Could be the first load or a reload. |
| `Error`      | An error occurred during loading.                            |
| `Success`    | Data has successfully been loaded.                           |

## <a name="api"></a> API

### <a name="loading-state"></a> LoadingState

```typescript
constructor(initialValue: LoadingStateSnapshot<T>)
```

#### asObservable

Returns an Observable that contains the state changes

```typescript
asObservable(): Observable<LoadingStateSnapshot<T>>
```

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
