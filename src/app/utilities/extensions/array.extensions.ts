declare global {
  interface Array<T> {
    distinct(selector?: (item: T) => string | number): T[];
  }
}

Array.prototype.distinct = function (selector?: (item: any) => string | number) {
  if (this.length === 0) return this;
  let uniqueKeys = [...new Set(this.map(selector))];
  return uniqueKeys.map((_uniqueKey, index) => this[index]);
}

export { };
