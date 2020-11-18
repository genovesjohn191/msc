import { Injectable } from '@angular/core';
import { ChartItem } from './chart-item.interface';
import { isNullOrEmpty } from '@app/utilities';

interface Series {
  name: string;
  data: number[];
}

export interface ChartData {
  categories: string[];
  series: Series[];
}

export interface PieChartData {
  series: number[];
}

@Injectable()
export class ChartDataService {
  public convertToApexChartData(rawData: ChartItem[]): ChartData {
    let chartData: ChartData = { categories: [], series: [] };
    let counter: number = 0;

    rawData.forEach(item => {
      // Add the label
      let newXAxis = chartData.categories.indexOf(item.xValue) < 0;
      if (newXAxis) {
        chartData.categories.push(item.xValue);
      }

      // Add the dataset
      let existingDataset = chartData.series.find((x) => x.name === item.name);
      let newDataSet = isNullOrEmpty(existingDataset);
      if (newDataSet) {
        chartData.series.push({ name: item.name, data: [item.yValue] });
        counter++;
      } else {
        existingDataset.data.push(item.yValue);
      }
    });

    return chartData;
  }

  public convertToPieApexChartData(rawData: number[]): PieChartData {
    let chartData: PieChartData = { series: [] };
    let series: number[] = Object.values(rawData);

    chartData.series.push(...series);
    return chartData;
  }
}
