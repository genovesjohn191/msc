import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { of } from 'rxjs';
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
        template: `<div>SecurityAndComplianceWidgetComponent Template</div>`
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
  describe('addResourceHealth()', () => {
    describe('when values are negative', () => {
      it('empty should return true', () => {
        const results$ = of({
          'healthyResourceCount': -1,
          'unhealthyResourceCount': -3,
          'notApplicableResourceCount': -1
        });

        results$.subscribe((results) => {
          component.empty = component.addResourceHealth(results);
        })
        expect(component.empty).toBe(true);
      });
    });

    describe('when values are positive', () => {
      it('empty should return false', () => {
        const results$ = of({
          'healthyResourceCount': 1,
          'unhealthyResourceCount': 2,
          'notApplicableResourceCount': 3
        });

        results$.subscribe((results) => {
          component.empty = component.addResourceHealth(results);
        })
        expect(component.empty).toBe(false);
      });
    });

    describe('when values are all 0', () => {
      it('empty should return false', () => {
        const results$ = of({
          'healthyResourceCount': 0,
          'unhealthyResourceCount': 0,
          'notApplicableResourceCount': 0
        });

        results$.subscribe((results) => {
          component.empty = component.addResourceHealth(results);
        })
        expect(component.empty).toBe(true);
      });
    });

    describe('when values are positive/negative and sum is greater than 0', () => {
      it('empty should return false', () => {
        const results$ = of({
          'healthyResourceCount': -1,
          'unhealthyResourceCount': -2,
          'notApplicableResourceCount': 8
        });

        results$.subscribe((results) => {
          component.empty = component.addResourceHealth(results);
        })
        expect(component.empty).toBe(false);
      });
    });

    describe('when values are positive/negative and sum is less than 0', () => {
      it('empty should return true', () => {
        const results$ = of({
          'healthyResourceCount': -1,
          'unhealthyResourceCount': -7,
          'notApplicableResourceCount': 2
        });

        results$.subscribe((results) => {
          component.empty = component.addResourceHealth(results);
        })
        expect(component.empty).toBe(true);
      });
    });
  });

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
});