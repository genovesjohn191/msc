import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { DataStatus } from '@app/models';
import { CoreDefinition } from '@app/core';
import { PricingCalculatorComponent } from './pricing-calculator.component';

describe('PricingCalculatorComponent', () => {
  let component: PricingCalculatorComponent;
  let fixture: ComponentFixture<PricingCalculatorComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        PricingCalculatorComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(PricingCalculatorComponent, {
      set: {
        template: `
        <div> PricingCalculatorComponent Template </div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(PricingCalculatorComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('isInProgress()', () => {
    it(`should return true when the data status is in progress`, () => {
      component.state = DataStatus.InProgress;
      expect(component.isInProgress).toBeTruthy();
    });

    it(`should return false when the data status is error`, () => {
      component.state = DataStatus.Error;
      expect(component.isInProgress).toBeFalsy();
    });

    it(`should return false when the data status is success`, () => {
      component.state = DataStatus.Success;
      expect(component.isInProgress).toBeFalsy();
    });

    it(`should return false when the data status is empty`, () => {
      component.state = DataStatus.Empty;
      expect(component.isInProgress).toBeFalsy();
    });
  });

  describe('toggleIconKey()', () => {
    it(`should return the toggle icon key`, () => {
      expect(component.toggleIconKey).toBe(CoreDefinition.ASSETS_FONT_CHEVRON_UP);
    });
  });

  describe('toggleWidget()', () => {
    it(`should set the collapse variable to true when the current state is false`, () => {
      component.collapse = false;
      component.toggleWidget();
      expect(component.collapse).toBeTruthy();
    });

    it(`should set the collapse variable to false when the current state is true`, () => {
      component.collapse = true;
      component.toggleWidget();
      expect(component.collapse).toBeFalsy();
    });
  });

  describe('showWidget()', () => {
    it(`should set the hidden variable to false`, () => {
      component.showWidget();
      expect(component.hidden).toBeFalsy();
    });

    it(`should set the hidden variable to true`, () => {
      component.hideWidget();
      expect(component.hidden).toBeTruthy();
    });
  });
});
