import { TestBed, waitForAsync } from '@angular/core/testing';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { CostRecommendationsWidgetComponent } from '../cost-recommendations/cost-recommendations-widget.component';
import { ResourceChangesWidgetComponent } from './resource-changes-widget.component';

describe('ResourceChangesWidgetComponent', () => {

  /** Stub Services/Components */
  let component: ResourceChangesWidgetComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        CostRecommendationsWidgetComponent
      ], imports: [
        CoreTestingModule,
        ServicesTestingModule
      ],providers: [
        McsReportingService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ResourceChangesWidgetComponent, {
      set: {
        template: `<div>ResourceChangesWidgetComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ResourceChangesWidgetComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('dataLabelFormatter()', () => {
    describe('when value is 0', () => {
      it('should return with no prefix', () => {
        let expectedResult = '0'
        let actualResult = component.dataLabelFormatter(0);

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is positive', () => {
      it('should return with + prefix', () => {
        let expectedResult = '+5'
        let actualResult = component.dataLabelFormatter(5);

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is negative', () => {
      it('should return with - prefix', () => {
        let expectedResult = '-5'
        let actualResult = component.dataLabelFormatter(-5);

        expect(actualResult).toBe(expectedResult);
      });
    });
  });

  describe('legendLabelFormatter()', () => {
    it('should return the service name only', () => {
      let expectedResult = 'Apps'
      let actualResult = component.legendLabelFormatter('Apps|-500.00');

      expect(actualResult).toBe(expectedResult);
    });
  });

  describe('xAxisLabelFormatter()', () => {
    describe('when value is 0', () => {
      it('should return with no prefix', () => {
        let expectedResult = '0'
        let actualResult = component.xAxisLabelFormatter('0');

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is positive', () => {
      it('should return with + prefix', () => {
        let expectedResult = '+5'
        let actualResult = component.xAxisLabelFormatter('5');

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is negative', () => {
      it('should return with - prefix', () => {
        let expectedResult = '-5'
        let actualResult = component.xAxisLabelFormatter('-5');

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is positive decimal number', () => {
      it('should return with - prefix', () => {
        let expectedResult = '+0.56'
        let actualResult = component.xAxisLabelFormatter('0.5555');

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is negative decimal number', () => {
      it('should return with - prefix', () => {
        let expectedResult = '-0.56'
        let actualResult = component.xAxisLabelFormatter('-0.5555');

        expect(actualResult).toBe(expectedResult);
      });
    });
  });

  describe('tooltipXValueFormatter()', () => {
    it('should return legend label', () => {
      let opts = {
        dataPointIndex: 0,
        w: {
          globals: {
            labels: [
              'Apps|-500.00'
            ]
          }
        }
      };

      let expectedResult = 'Apps'
      let actualResult = component.tooltipXValueFormatter(-5, opts);

      expect(actualResult).toBe(expectedResult);
    });
  });

  describe('tooltipYValueFormatter()', () => {
    describe('when value is 0', () => {
      it('should return with no prefix', () => {
        let expectedResult = '0'
        let actualResult = component.tooltipYValueFormatter(0);

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is positive', () => {
      it('should return with + prefix', () => {
        let expectedResult = '+5'
        let actualResult = component.tooltipYValueFormatter(5);

        expect(actualResult).toBe(expectedResult);
      });
    });

    describe('when value is negative', () => {
      it('should return with - prefix', () => {
        let expectedResult = '-5'
        let actualResult = component.tooltipYValueFormatter(-5);

        expect(actualResult).toBe(expectedResult);
      });
    });
  });
});
