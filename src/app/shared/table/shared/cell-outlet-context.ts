/**
 * Celloutlet context to be inserted in the specified cell
 *
 * `@Note` the $implicit variable should be there since
 * this will serve as the binding for the directive in the
 * html DOM. e.g: "Let row" {row.object}
 */
export interface CellOutletContext<T> {
  $implicit: T;
  index?: number;
  count?: number;
  first?: boolean;
  last?: boolean;
  even?: boolean;
  odd?: boolean;
}
