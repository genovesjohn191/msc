import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { McsReportingService } from '@app/core';
import { CoreTestingModule } from '@app/core/testing';
import { ServicesTestingModule } from '@app/services/testing';
import { CostRecommendationsWidgetComponent } from './cost-recommendations-widget.component';

describe('CostRecommendationsWidgetComponent', () => {

  /** Stub Services/Components */
  let component: CostRecommendationsWidgetComponent;

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
    TestBed.overrideComponent(CostRecommendationsWidgetComponent, {
      set: {
        template: `<div>CostRecommendationsWidgetComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(CostRecommendationsWidgetComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('costPercentage()', () => {
    describe('when value is over wan limit', () => {
      it('should round off correctly', () => {
        component.costRecommendations = {
          budget: 1000,
          actual: 1000.01,
          variance: 0,
          potentialOperationalSavings: 1000,
          potentialRightsizingSavings: 1000,
          updatedOn: '',
        };

        expect(component.costPercentage).toBe(101);
        expect(component.costColor).toBe('danger');
      });
    });


    describe('when value is warn top limit', () => {
      it('should round off correctly', () => {
        component.costRecommendations = {
          budget: 1000,
          actual: 1000,
          variance: 0,
          potentialOperationalSavings: 1000,
          potentialRightsizingSavings: 1000,
          updatedOn: '',
        };

        expect(component.costPercentage).toBe(100);
        expect(component.costColor).toBe('warn');
      });
    });


    describe('when value is warn lower limit ', () => {
      it('should round off correctly', () => {
        component.costRecommendations = {
          budget: 1000,
          actual: 840.1,
          variance: 0,
          potentialOperationalSavings: 1000,
          potentialRightsizingSavings: 1000,
          updatedOn: '',
        };

        expect(component.costPercentage).toBe(85);
        expect(component.costColor).toBe('warn');
      });
    });


    describe('when value is good upper limit', () => {
      it('should round off correctly', () => {
        component.costRecommendations = {
          budget: 1000,
          actual: 840,
          variance: 0,
          potentialOperationalSavings: 1000,
          potentialRightsizingSavings: 1000,
          updatedOn: '',
        };

        expect(component.costPercentage).toBe(84);
        expect(component.costColor).toBe('good');
      });
    });


    describe('when value is good lower limit', () => {
      it(' should round off correctly', () => {
        component.costRecommendations = {
          budget: 1000,
          actual: 0,
          variance: 0,
          potentialOperationalSavings: 1000,
          potentialRightsizingSavings: 1000,
          updatedOn: '',
        };

        expect(component.costPercentage).toBe(0);
        expect(component.costColor).toBe('good');
      });
    });

    describe('when values are negative', () => {
      it(' should return 0', () => {
        component.costRecommendations = {
          budget: -1000,
          actual: -500,
          variance: 0,
          potentialOperationalSavings: 1000,
          potentialRightsizingSavings: 1000,
          updatedOn: '',
        };

        expect(component.costPercentage).toBe(0);
        expect(component.actual).toBe(0);
        expect(component.budget).toBe(0);
        expect(component.costColor).toBe('good');
      });
    });

    describe('when budget is negative', () => {
      it('should round off to 0', () => {
        component.costRecommendations = {
          budget: -1000,
          actual: 1000,
          variance: 0,
          potentialOperationalSavings: 1000,
          potentialRightsizingSavings: 1000,
          updatedOn: '',
        };

        expect(component.costPercentage).toBe(0);
        expect(component.actual).toBe(1000);
        expect(component.budget).toBe(0);
        expect(component.costColor).toBe('good');
      });
    });


    describe('when actual is negative', () => {
      it(' value should round off to 0', () => {
        component.costRecommendations = {
          budget: 1000,
          actual: -1000,
          variance: 0,
          potentialOperationalSavings: 1000,
          potentialRightsizingSavings: 1000,
          updatedOn: '',
        };

        expect(component.costPercentage).toBe(0);
        expect(component.actual).toBe(0);
        expect(component.budget).toBe(1000);
        expect(component.costColor).toBe('good');
      });
    });
  });
});
