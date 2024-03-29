import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { McsReportingService } from '@app/core';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { SecurityWidgetComponent } from './security-widget.component';

describe('SecurityWidgetComponent', () => {

  /** Stub Services/Components */
  let component: SecurityWidgetComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        SecurityWidgetComponent
      ], imports: [
        CoreTestingModule,
        ServicesTestingModule
      ],providers: [
        McsReportingService
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(SecurityWidgetComponent, {
      set: {
        template: `<div>SecurityWidgetComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(SecurityWidgetComponent);
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
});