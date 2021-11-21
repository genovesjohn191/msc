import {
  ChartColorFuncType,
  ChartItem
} from '@app/shared';

import { BillingOperationViewModel } from './billing-operation-viewmodel';

export class BillingOperationData<TData> {
  public summaryItems: TData[];
  public seriesItems: TData[][];
  public chartItems: ChartItem[];
  public chartColors: ChartColorFuncType<TData>[];

  public getViewModelFunc: (item: TData) => BillingOperationViewModel;
  public getTitleFunc: (item: BillingOperationViewModel) => string;
  public getNameFunc: (item: string) => string;
}
