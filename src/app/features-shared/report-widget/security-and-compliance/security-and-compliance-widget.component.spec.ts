import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { SecurityAndComplianceWidgetComponent } from './security-and-compliance-widget.component';

describe('SecurityAndComplianceWidgetComponent', () => {

  /** Stub Services/Components */
  let component: SecurityAndComplianceWidgetComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SecurityAndComplianceWidgetComponent
      ], imports: [
        CoreTestingModule,
        ServicesTestingModule
      ],providers: [
        McsReportingService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(SecurityAndComplianceWidgetComponent, {
      set: {
        template: `<div>SecurityAndComplianceWidgetComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(SecurityAndComplianceWidgetComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('securityScorePercentage()', () => {
    describe('when values are both 0', () => {
      it(' should return 0', () => {
        component.securityScore = {
          currentScore: 0,
          maxScore: 0
        };

        expect(component.securityScorePercentage).toBe(0);
      });
    });

    describe('when values are positive', () => {
      it(' should round off correctly', () => {
        component.securityScore = {
          currentScore: 100,
          maxScore: 100
        };

        expect(component.securityScorePercentage).toBe(100);
      });
    });

    describe('when currentscore is less than maxScore', () => {
      it('should round off correctly', () => {
        component.securityScore = {
          currentScore: 35,
          maxScore: 100
        };

        expect(component.securityScorePercentage).toBe(35);
      });
    });

    describe('when values are negative', () => {
      it(' should return 0', () => {
        component.securityScore = {
          currentScore: -10,
          maxScore: -50
        };

        expect(component.securityScorePercentage).toBe(0);
        expect(component.currentScore).toBe(0);
        expect(component.maxScore).toBe(0);
      });
    });

    describe('when currentScore is negative', () => {
      it('value should round off to 0', () => {
        component.securityScore = {
          currentScore: -10,
          maxScore: 10
        };

        expect(component.securityScorePercentage).toBe(0);
        expect(component.currentScore).toBe(0);
        expect(component.maxScore).toBe(10);
      });
    });

    describe('when maxScore is negative', () => {
      it('value should round off to 0', () => {
        component.securityScore = {
          currentScore: 10,
          maxScore: -10
        };

        expect(component.securityScorePercentage).toBe(0);
        expect(component.currentScore).toBe(10);
        expect(component.maxScore).toBe(0);
      });
    });
  });

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
});