export interface LoadingStateNotStarted {
  type: LoadingStateType.NotStarted;
}
export interface LoadingStateLoading<T> {
  type: LoadingStateType.Loading;
  data: T | undefined; // Could be set, if existing data is reloaded
}

export interface LoadingStateSuccess<T> {
  type: LoadingStateType.Success;
  data: T | undefined;
}

export interface LoadingStateError {
  type: LoadingStateType.Error;
  error: any; // Javascript Error object
}

export type LoadingState<T> =
  | LoadingStateNotStarted
  | LoadingStateLoading<T>
  | LoadingStateSuccess<T>
  | LoadingStateError;

export enum LoadingStateType {
  NotStarted = "notStarted",
  Loading = "loading",
  Error = "error",
  Success = "success",
}
