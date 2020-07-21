import { Injectable } from '@angular/core';
import { ChartItem } from './chart-item.interface';
import { isNullOrEmpty } from '@app/utilities';

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
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
  };

  private _colors: string[] = [
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
    this._colorMap.red,
    this._colorMap.orange,
    this._colorMap.yellow,
    this._colorMap.green,
    this._colorMap.blue,
    this._colorMap.purple,
    this._colorMap.grey,
  ];

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
