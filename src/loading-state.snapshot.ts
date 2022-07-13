import type { LoadingStateType } from "./loading-state.type";

export interface LoadingStateSnapshotNotStarted {
  type: LoadingStateType.NotStarted;
}

export interface LoadingStateSnapshotLoading<T> {
  type: LoadingStateType.Loading;
  data: T | undefined; // Could be set, if existing data is reloaded
}

export interface LoadingStateSnapshotSuccess<T> {
  type: LoadingStateType.Success;
  data: T | undefined;
}

export interface LoadingStateSnapshotError {
  type: LoadingStateType.Error;
  error: any; // Javascript Error object
}

export type LoadingStateSnapshot<T> =
  | LoadingStateSnapshotNotStarted
  | LoadingStateSnapshotLoading<T>
  | LoadingStateSnapshotSuccess<T>
  | LoadingStateSnapshotError;
