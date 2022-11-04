import { Injector } from '@angular/core';
import { McsReportingService } from '@app/core';
import {
  ChartColorFuncType,
  ChartItem,
  StdCurrencyFormatPipe,
  StdDateFormatPipe
} from '@app/shared';
import {
  compareDates,
  hashString,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { billingColors } from '../models';

export const KEY_SEPARATOR = ':';
export const PROJECT_TEXT = '(Projected)';

export abstract class BillingOperationBase<TUserItem> {
  protected readonly translate: TranslateService;
  protected readonly currencyPipe: StdCurrencyFormatPipe;
  protected readonly datePipe: StdDateFormatPipe;
  protected readonly reportingService: McsReportingService;

  constructor(
    injector: Injector
  ) {
    this.translate = injector.get(TranslateService);
    this.currencyPipe = injector.get(StdCurrencyFormatPipe);
    this.datePipe = injector.get(StdDateFormatPipe);
    this.reportingService = injector.get(McsReportingService);
  }

  protected abstract mapToChartItem(item: TUserItem): ChartItem;

  protected isDateGreaterThanExpiry(timestamp: number): boolean {
    let octoberDate = new Date();
    octoberDate.setFullYear(2021, 9, 31);
    return compareDates(new Date(timestamp), octoberDate) !== -1;
  }

  protected buildChartItems(items: TUserItem[], sortFunc?: (a: TUserItem, b: TUserItem) => number): ChartItem[] {
    if (isNullOrEmpty(items)) { return null; }

    // Sort items first
    if (sortFunc) {
      items?.sort((first, second) => sortFunc(first, second));
    }

    let chartItems = new Array<ChartItem>();
    items.forEach(billingService => {
      if (isNullOrEmpty(billingService)) { return; }
      chartItems.push(this.mapToChartItem(billingService));
    });
    return this.reportingService.fillMissingChartItems(chartItems);
  }

  protected buildSeriesItems(
    chartItems: ChartItem[],
    items: TUserItem[],
    compareFunc: (item: TUserItem, chart: ChartItem) => boolean
  ): TUserItem[][] {
    // Group them first by their service names
    let seriesItems: TUserItem[][] = [];
    let seriesIndex = 0;

    let seriesMap = new Map<string, ChartItem[]>();
    chartItems?.forEach(chartItem => {
      let serviceFound = items.find(service => compareFunc(service, chartItem));

      let chartItemsFound = seriesMap.get(chartItem.name);
      if (!isNullOrEmpty(chartItemsFound)) {
        let arrayKeys = [...seriesMap.keys()];
        let mapIndex = 0;

        for (const key of arrayKeys) {
          if (key === chartItem.name) { break; }
          ++mapIndex;
        }

        seriesItems[mapIndex][chartItemsFound.length] = serviceFound;
        chartItemsFound.push(chartItem);
        return;
      }

      let chartItemList = new Array<ChartItem>();
      chartItemList.push(chartItem);
      seriesMap.set(chartItem.name, chartItemList);

      // Initialize billing series multi array, we always set the pointindex 0 here
      seriesItems[seriesIndex] = [];
      seriesItems[seriesIndex][0] = serviceFound;
      seriesIndex++;
    });
    return seriesItems;
  }

  protected buildChartColors(chartItems: ChartItem[]): ChartColorFuncType<TUserItem>[] {
    if (isNullOrEmpty(chartItems)) { return; }

    let chartNames = chartItems?.map(item => item.name) || [];
    let uniqueNames = [...new Set(chartNames)].filter(name => !isNullOrUndefined(name));
    if (isNullOrEmpty(uniqueNames)) { return; }

    // Use predefined colours for each item
    // If predefined colours run out, hashes each distinct name and uses it as seed for hex colour generation
    let createdColors = uniqueNames?.map((name, nameIndex) => {
      return (nameIndex < billingColors.length) ? billingColors[nameIndex++] : hashString(name).toHex();
    });
    return createdColors.map((color, index) => itemFunc => color);
  }
}
