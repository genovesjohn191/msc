import { NgApexchartsModule } from 'ng-apexcharts';

import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { StatusMessageModule } from '@app/shared/status-message/status-message.module';

import { ChartDataService } from '../chart-data.service';
import { VerticalBarChartComponent } from './vertical-bar-chart.component';

describe('VerticalBarChartComponent', () => {

  /** Stub Services/Components */
  let component: VerticalBarChartComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        VerticalBarChartComponent
      ],
      imports: [
        CoreTestingModule,
        ServicesTestingModule,
        NgApexchartsModule,
        StatusMessageModule
      ],
      providers: [
        ChartDataService
      ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(VerticalBarChartComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-vertical-bar-chart element`, () => {
      expect(component).toBeTruthy();
    });

    it(`should set the datalabels offsetX value to 0`, () => {
      expect(component.options.dataLabels.offsetX).toBe(0);
    });

    it(`should set the height of the chart based on the user-defined height`, () => {
      component.config = {
        height: '500px'
      };
      expect(component.options.chart.height).toBe('500px');
    });

    it(`should set the height to auto if height is not defined`, () => {
      expect(component.options.chart.height).toBe('auto');
    });

    it(`should set the bar height to 85% if bar height is not defined`, () => {
      expect(component.options.plotOptions.bar.barHeight).toBe('100%');
    });

    it(`should set the type of the chart based on the user-defined type`, () => {
      component.config = {
        type: 'bar'
      };
      expect(component.options.chart.type).toBe('bar');
    });

    it(`should set the series of the chart based on the given data`, () => {
      component.data = [
        {
          name: "Standard D8 v3",
          xValue: "Aug 2021",
          yValue: 4
        },
        {
          name: "Standard E4ds v4",
          xValue: "Aug 2021",
          yValue: 1
        },
        {
          name: "Standard E4s v3",
          xValue: "Aug 2021",
          yValue: 1
        },
        {
          name: "Standard B2ms",
          xValue: "Sep 2021",
          yValue: 1
        },
        {
          name: "Standard D8 v3",
          xValue: "Sep 2021",
          yValue: 4
        },
      ];

      let expectedSeries = [
        {
          data: [4, 4],
          name: "Standard D8 v3"
        },
        {
          data: [1],
          name: "Standard E4ds v4"
        },
        {
          data: [1],
          name: "Standard E4s v3"
        },
        {
          data: [1],
          name: "Standard B2ms"
        }
      ]
      expect(component.options.series).toEqual(expectedSeries);
    });

    it(`should show the datalabels of the chart if datalabels is set to true`, () => {
      component.config = {
        dataLabels: {
          enabled: true
        }
      };
      expect(component.options.dataLabels.enabled).toBe(true);
    });

    it(`should show the datalabels of the chart if datalabels is set to false`, () => {
      component.config = {
        dataLabels: {
          enabled: false
        }
      };
      expect(component.options.dataLabels.enabled).toBe(false);
    });
  });
});
