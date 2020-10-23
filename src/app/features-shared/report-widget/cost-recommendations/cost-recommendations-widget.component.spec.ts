import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { McsApiClientTestingModule } from '@app/api-client/testing';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { CoreTestingModule } from '@app/core/testing';
import { McsApiService } from '@app/services';
import { ServicesTestingModule } from '@app/services/testing';
import { TranslateService } from '@ngx-translate/core';
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
    it('over lower limit should round off correctly', () => {
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

    it('warn top limit should round off correctly', () => {
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

    it('warn lower limit should round off correctly', () => {
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

    it('good upper limit should round off correctly', () => {
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

    it('good lower limit should round off correctly', () => {
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

    it('good negative value should round off correctly', () => {
      component.costRecommendations = {
        budget: 1000,
        actual: -500,
        variance: 0,
        potentialOperationalSavings: 1000,
        potentialRightsizingSavings: 1000,
        updatedOn: '',
      };

      expect(component.costPercentage).toBe(-50);
      expect(component.costColor).toBe('good');
    });
  });
});
