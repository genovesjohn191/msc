import { NgApexchartsModule } from 'ng-apexcharts';

import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { StatusMessageModule } from '@app/shared/status-message/status-message.module';

import { ChartDataService } from '../chart-data.service';
import { HorizontalBarChartComponent } from './horizontal-bar-chart.component';

describe('HorizontalBarChartComponent', () => {

  /** Stub Services/Components */
  let component: HorizontalBarChartComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        HorizontalBarChartComponent
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
      let fixture = TestBed.createComponent(HorizontalBarChartComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-horizontal-bar-chart element`, () => {
      expect(component).toBeTruthy();
    });

    it(`should set the datalabels offsetX value to 0`, () => {
      expect(component.options.dataLabels.offsetX).toBe(0);
    });

    it(`should set the height of the chart based on the user-defined height`, () => {
      component.config = {
        height: '390px'
      };
      expect(component.options.chart.height).toBe('390px');
    });

    it(`should set the height to auto if height is not defined`, () => {
      expect(component.options.chart.height).toBe('auto');
    });

    it(`should set the bar height to 85% if bar height is not defined`, () => {
      expect(component.options.plotOptions.bar.barHeight).toBe('85%');
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
          name: "Avg CPU %",
          xValue: "Aug 2021",
          yValue: 6.52
        },
        {
          name: "Avg File System % Used",
          xValue: "Aug 2021",
          yValue: 41.36
        }
      ];

      let expectedSeries = [
        { name: 'Avg CPU %', data: [ 6.52 ] },
        { name: 'Avg File System % Used', data: [ 41.36 ] }
      ]
      expect(component.options.series).toEqual(expectedSeries);
    });
  });
});
