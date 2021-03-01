import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { of } from 'rxjs';
import { McsReportingService } from '@app/core';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { ResourceHealthWidgetComponent } from './resource-health-widget.component';

describe('ResourceHealthWidgetComponent', () => {

  /** Stub Services/Components */
  let component: ResourceHealthWidgetComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ResourceHealthWidgetComponent
      ], imports: [
        CoreTestingModule,
        ServicesTestingModule
      ],providers: [
        McsReportingService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ResourceHealthWidgetComponent, {
      set: {
        template: `<div>SecurityWidgetComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ResourceHealthWidgetComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('datalabelFormatter()', () => {
    describe('when value is 0', () => {
      it('should return 0', () => {
        let expectedResult = '0'
        let actualResult = component.dataLabelFormatter(0);

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is positive', () => {
      it('should return positive percentage value', () => {
        let expectedResult = '50%'
        let actualResult = component.dataLabelFormatter(50);

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is negative', () => {
      it('should return 0', () => {
        let expectedResult = '0'
        let actualResult = component.dataLabelFormatter(-5);

        expect(actualResult).toBe(expectedResult);
      });
    });
  });

  describe('healthResourceSeries()', () => {
    describe('when count is 0', () => {
      it('should remove data from the series', () => {
        const results$ = of({
          resources: [
            {
              'description': 'Healthy',
              'count': 0
            },
            {
              'description': 'Unhealthy',
              'count': 30
            },
            {
              'description': 'Not Applicable',
              'count': 0
            }
          ]
        });
        results$.subscribe((results) => {
           component.chartSeries= component.healthResourceSeries(results.resources);
        })

        let expectedResult = [30];
        expect(component.chartSeries).toEqual(expectedResult);
      });
    });

    describe('when count not equal to 0', () => {
      it('should add data from the series', () => {
        const results$ = of({
          resources: [
            {
              'description': 'Healthy',
              'count': 20
            },
            {
              'description': 'Unhealthy',
              'count': 10
            },
            {
              'description': 'Not Applicable',
              'count': 50
            }
          ]
        });
        results$.subscribe((results) => {
           component.chartSeries= component.healthResourceSeries(results.resources);
        })

        let expectedResult = [20, 10, 50];
        expect(component.chartSeries).toEqual(expectedResult);
      });
    });
    describe('when count less than 0', () => {
      it('should remove data from the series', () => {
        const results$ = of({
          resources: [
            {
              'description': 'Healthy',
              'count': 20
            },
            {
              'description': 'Unhealthy',
              'count': -6
            },
            {
              'description': 'Not Applicable',
              'count': 50
            }
          ]
        });
        results$.subscribe((results) => {
           component.chartSeries= component.healthResourceSeries(results.resources);
        })

        let expectedResult = [20, 50];
        expect(component.chartSeries).toEqual(expectedResult);
      });
    });
  });

  describe('healthResourceLabels()', () => {
    describe('when label is null', () => {
      it('should remove from the labels', () => {
        const results$ = of({
          resources: [
            {
              'description': null,
              'count': 20
            },
            {
              'description': 'Unhealthy',
              'count': 30
            },
            {
              'description': 'Not Applicable',
              'count': 40
            }
          ]
        });
        results$.subscribe((results) => {
           component.chartLabels= component.healthResourceLabels(results.resources);
        })

        let expectedResult = ['Unhealthy', 'Not Applicable'];
        expect(component.chartLabels).toEqual(expectedResult);
      });
    });

    describe('when label isnt null', () => {
      it('should be added from the labels', () => {
        const results$ = of({
          resources: [
            {
              'description': 'Healthy',
              'count': 20
            },
            {
              'description': 'Unhealthy',
              'count': 30
            },
            {
              'description': 'Not Applicable',
              'count': 40
            }
          ]
        });
        results$.subscribe((results) => {
           component.chartLabels= component.healthResourceLabels(results.resources);
        })

        let expectedResult = ['Healthy', 'Unhealthy', 'Not Applicable'];
        expect(component.chartLabels).toEqual(expectedResult);
      });
    });
  });
});