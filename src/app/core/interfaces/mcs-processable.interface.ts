export interface IMcsProcessable<T> {
  updateEntityState(entity: T): void;
  clearEntityState(entity: T): void;
}
