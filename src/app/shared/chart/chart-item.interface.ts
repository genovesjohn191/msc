export type ChartColorFuncType<TData> = (itemFunc: TData) => string;

export interface ChartItem {
  id?: string;
  name: string;
  xValue: any;
  yValue: any;
}
