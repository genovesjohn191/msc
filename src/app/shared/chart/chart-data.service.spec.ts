import {
  ChartData,
  ChartDataService,
  PieChartData
} from "./chart-data.service"
import { ChartItem } from "./chart-item.interface";

describe("ChartDataService", () => {
  let service: ChartDataService;

  beforeEach(() => {
    service = new ChartDataService();
  })

  it("should convert rawdata to ApexChart data", () => {
    let rawData: ChartItem[] = [
      { id: "idA", name: "nameA", xValue: "x", yValue: 100 },
      { id: "idB", name: "nameB", xValue: "xx", yValue: 50 },
      { id: "idB", name: "nameC", xValue: "x", yValue: 80 },
      { id: "idB", name: "nameD", xValue: "xxx", yValue: 70 }
    ];
    let expectedChartData: ChartData = {
      categories: ['x', 'xx', 'xxx'],
      series: [
        { name: 'nameA', data: [100] },
        { name: 'nameB', data: [50] },
        { name: 'nameC', data: [80] },
        { name: 'nameD', data: [70] }
      ]
    };

    expect(service.convertToApexChartData(rawData)).toEqual(expectedChartData);
  });

  it("should convert rawdata to PieApexChart data", () => {
    let rawData = [2, 4, 6, 8];
    let expectedPieChartData: PieChartData = { series: [2, 4, 6, 8] };

    expect(service.convertToPieApexChartData(rawData)).toEqual(expectedPieChartData);
  })
})