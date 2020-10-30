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
    it('should return with no prefix when value is 0', () => {
      let opts = {
        dataPointIndex: 0,
        w: {
          globals: {
            labels: [
              'Apps|0.00'
            ]
          }
        }
      };

      let expectedResult = '$0.00'
      let actualResult = component.dataLabelFormatter(2, opts);

      expect(actualResult).toBe(expectedResult);
    });

    it('should return with + prefix when value is positive', () => {
      let opts = {
        dataPointIndex: 0,
        w: {
          globals: {
            labels: [
              'Apps|500.00'
            ]
          }
        }
      };

      let expectedResult = '+$500.00'
      let actualResult = component.dataLabelFormatter(3, opts);

      expect(actualResult).toBe(expectedResult);
    });

    it('should return with - prefix when value is negative', () => {
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

      let expectedResult = '-$500.00'
      let actualResult = component.dataLabelFormatter(3, opts);

      expect(actualResult).toBe(expectedResult);
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
    it('should return with no prefix when value is 0', () => {
      let expectedResult = '0'
      let actualResult = component.xAxisLabelFormatter('0');

      expect(actualResult).toBe(expectedResult);
    });

    it('should return with + prefix when value is positive', () => {
      let expectedResult = '+5'
      let actualResult = component.xAxisLabelFormatter('5');

      expect(actualResult).toBe(expectedResult);
    });

    it('should return with - prefix when value is negative', () => {
      let expectedResult = '-5'
      let actualResult = component.xAxisLabelFormatter('-5');

      expect(actualResult).toBe(expectedResult);
    });
  });
  describe('tooltipXValueFormatter()', () => {
    it('should return with no prefix when value is 0', () => {
      let opts = {
        dataPointIndex: 0,
        w: {
          globals: {
            labels: [
              'Apps|0.00'
            ]
          }
        }
      };

      let expectedResult = 'Apps ($0.00)'
      let actualResult = component.tooltipXValueFormatter('0', opts);

      expect(actualResult).toBe(expectedResult);
    });

    it('hould return with + prefix when value is positive', () => {
      let opts = {
        dataPointIndex: 0,
        w: {
          globals: {
            labels: [
              'Apps|+500.00'
            ]
          }
        }
      };

      let expectedResult = 'Apps (+$500.00)'
      let actualResult = component.tooltipXValueFormatter('+5', opts);

      expect(actualResult).toBe(expectedResult);
    });

    it('should return with - prefix when value is negative', () => {
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

      let expectedResult = 'Apps (-$500.00)'
      let actualResult = component.tooltipXValueFormatter('-5', opts);

      expect(actualResult).toBe(expectedResult);
    });
  });

  describe('tooltipYValueFormatter()', () => {
    it('should return with no prefix when value is 0', () => {
      let expectedResult = '0'
      let actualResult = component.tooltipYValueFormatter(0);

      expect(actualResult).toBe(expectedResult);
    });

    it('should return with + prefix when value is positive', () => {
      let expectedResult = '+5'
      let actualResult = component.tooltipYValueFormatter(5);

      expect(actualResult).toBe(expectedResult);
    });

    it('should return with - prefix when value is negative', () => {
      let expectedResult = '-5'
      let actualResult = component.tooltipYValueFormatter(-5);

      expect(actualResult).toBe(expectedResult);
    });
  });
});
