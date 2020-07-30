import { Injectable } from '@angular/core';
import { ChartItem } from './chart-item.interface';
import { isNullOrEmpty } from '@app/utilities';

interface ChartDataSet2 {
  name: string;
  data: number[];
}

interface ChartData2 {
  categories: string[];
  series: ChartDataSet2[];
}


interface ChartDataSet {
  label: string;
  backgroundColor: string;
  data: number[];
}

interface ChartData {
  labels: string[];
  datasets: ChartDataSet[];
}

@Injectable()
export class ChartDataService {

  private _colorMap = {
    red: 'rgb(255, 99, 132, 0.7)',
    orange: 'rgb(255, 159, 64, 0.7)',
    yellow: 'rgb(255, 205, 86, 0.7)',
    green: 'rgb(75, 192, 192, 0.7)',
    blue: 'rgb(0, 190, 216, 0.7)',
    purple: 'rgb(153, 102, 255, 0.7)',
    grey: 'rgb(201, 203, 207, 0.7)'
  };

  private _colors: string[] = [
    this._colorMap.blue,
    this._colorMap.orange,
    this._colorMap.yellow,
    this._colorMap.green,
    this._colorMap.red,
    this._colorMap.purple,
    this._colorMap.grey,
    this._colorMap.red,
    this._colorMap.orange,
    this._colorMap.yellow,
    this._colorMap.green,
    this._colorMap.blue,
    this._colorMap.purple,
    this._colorMap.grey,
    this._colorMap.red,
    this._colorMap.orange,
    this._colorMap.yellow,
    this._colorMap.green,
    this._colorMap.blue,
    this._colorMap.purple,
    this._colorMap.grey,
    this._colorMap.red,
    this._colorMap.orange,
    this._colorMap.yellow,
    this._colorMap.green,
    this._colorMap.blue,
    this._colorMap.purple,
    this._colorMap.grey,
  ];

  public convertToApexChartData(rawData: ChartItem[]): ChartData2 {
    let chartData: ChartData2 = { categories: [], series: [] };
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

  public convertToChartData(rawData: ChartItem[]): ChartData {
    let chartData: ChartData = { labels: [], datasets: [] };
    let counter: number = 0;

    rawData.forEach(item => {
      // Add the label
      let newXAxis = chartData.labels.indexOf(item.xValue) < 0;
      if (newXAxis) {
        chartData.labels.push(item.xValue);
      }

      // Add the dataset
      let existingDataset = chartData.datasets.find((x) => x.label === item.name);
      let newDataSet = isNullOrEmpty(existingDataset);
      if (newDataSet) {
        chartData.datasets.push({ label: item.name, backgroundColor: this._colors[counter], data: [item.yValue] });
        counter++;
      } else {
        existingDataset.data.push(item.yValue);
      }
    });

    return chartData;
  }

}
