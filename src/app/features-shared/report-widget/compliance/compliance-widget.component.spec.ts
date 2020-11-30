import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { of } from 'rxjs';

import { ComplianceWidgetComponent } from './compliance-widget.component';

describe('ComplianceWidgetComponent', () => {
  let component: ComplianceWidgetComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ComplianceWidgetComponent
      ], imports: [
        CoreTestingModule,
        ServicesTestingModule
      ],providers: [
        McsReportingService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ComplianceWidgetComponent, {
      set: {
        template: `<div>ComplianceWidgetComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ComplianceWidgetComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  describe('dataLabelFormatter()', () => {
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

  describe('complianceSeries()', () => {
    describe('when count is 0', () => {
      it('should remove data from the series', () => {
        const results$ = of({
          resources: [
            {
              'state': 'Compliant',
              'count': 0
            },
            {
              'state': 'Non-compliant',
              'count': 30
            }
          ]
        });
        results$.subscribe((results) => {
           component.resources= component.complianceSeries(results.resources);
        })

        let expectedResult = [30];
        expect(component.resources).toEqual(expectedResult);
      });
    });

    describe('when count not equal to 0', () => {
      it('should add data from the series', () => {
        const results$ = of({
          resources: [
            {
              'state': 'Compliant',
              'count': 20
            },
            {
              'state': 'Non-compliant',
              'count': 30
            }
          ]
        });
        results$.subscribe((results) => {
           component.resources= component.complianceSeries(results.resources);
        })

        let expectedResult = [20, 30];
        expect(component.resources).toEqual(expectedResult);
      });
    });

    describe('when count less than 0', () => {
      it('should remove data from the series', () => {
        const results$ = of({
          resources: [
            {
              'state': 'Compliant',
              'count': -20
            },
            {
              'state': 'Non-compliant',
              'count': 30
            }
          ]
        });
        results$.subscribe((results) => {
           component.resources= component.complianceSeries(results.resources);
        })

        let expectedResult = [30];
        expect(component.resources).toEqual(expectedResult);
      });
    });
  });

  describe('complianceLabels()', () => {
    describe('when label is null', () => {
      it('should remove from the labels', () => {
        const results$ = of({
          resources: [
            {
              'state': null,
              'count': 20
            },
            {
              'state': 'Non-compliant',
              'count': 30
            }
          ]
        });
        results$.subscribe((results) => {
           component.chartLabels= component.complianceLabels(results.resources);
        })

        let expectedResult = ['Non-compliant'];
        expect(component.chartLabels).toEqual(expectedResult);
      });
    });

    describe('when label isnt null', () => {
      it('should be added from the labels', () => {
        const results$ = of({
          resources: [
            {
              'state': 'Compliant',
              'count': 20
            },
            {
              'state': 'Non-compliant',
              'count': 30
            }
          ]
        });
        results$.subscribe((results) => {
           component.chartLabels= component.complianceLabels(results.resources);
        })

        let expectedResult = ['Compliant', 'Non-compliant']
        expect(component.chartLabels).toEqual(expectedResult);
      });
    });
  });

  describe('resourceCompliancePercentage()', () => {
    describe('when value is 0', () => {
      it('should return 0', () => {
        component.resourceCompliance = {
          resourceCompliancePercentage: 0,
          compliantResources: 20,
          totalResources: 100,
          resources: [],
          nonCompliantInitiatives: 20,
          totalInitiatives: 30,
          nonCompliantPolicies: 50,
          totalPolicies: 20,
          resourceChartItem: []
        };

        expect(component.resourceCompliancePercentage).toBe(0);
      });
    });

    describe('when value is positive', () => {
      it('should return positive percentage value', () => {
        component.resourceCompliance = {
          resourceCompliancePercentage: 30.67,
          compliantResources: 20,
          totalResources: 100,
          resources: [],
          nonCompliantInitiatives: 20,
          totalInitiatives: 30,
          nonCompliantPolicies: 50,
          totalPolicies: 20,
          resourceChartItem: []
        };

        expect(component.resourceCompliancePercentage).toBe(31);
      });
    });

    describe('when value is negative', () => {
      it('should return 0', () => {
        component.resourceCompliance = {
          resourceCompliancePercentage: -40,
          compliantResources: 20,
          totalResources: 100,
          resources: [],
          nonCompliantInitiatives: 20,
          totalInitiatives: 30,
          nonCompliantPolicies: 50,
          totalPolicies: 20,
          resourceChartItem: []
        };

        expect(component.resourceCompliancePercentage).toBe(0);
      });
    });
  });
});
