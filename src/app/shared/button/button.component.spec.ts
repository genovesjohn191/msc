import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { Renderer2 } from '@angular/core';

import { ButtonComponent } from './button.component';
import { CoreDefinition } from '../../core';

describe('ButtonComponent', () => {

  /** Stub Services/Components */
  let component: ButtonComponent;

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ButtonComponent
      ],
      providers: [
        Renderer2
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ButtonComponent, {
      set: {
        template: `
          <div #mcsButton>ButtonComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ButtonComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should set the calendar icon key definition in the iconKey variable', () => {
      component.icon = 'calendar';
      component.ngOnInit();
      expect(component.iconKey).toBe(CoreDefinition.ASSETS_FONT_CALENDAR);
    });

    it('should set the arrow right icon key definition in the iconKey variable', () => {
      component.icon = 'arrow';
      component.ngOnInit();
      expect(component.iconKey).toBe(CoreDefinition.ASSETS_SVG_ARROW_RIGHT_WHITE);
    });

    it(`should set the iconKey variable to undefined in case the
      inputted icon is normal or none`, () => {
        component.icon = 'normal';
        component.ngOnInit();
        expect(component.iconKey).toBeUndefined();
      });
  });

  describe('ngAfterViewInit()', () => {
    it('should use default styling if no icon found',
      inject([Renderer2], (renderer: Renderer2) => {
        spyOn(renderer, 'addClass');
        component.icon = 'normal';
        component.ngAfterViewInit();
        expect(renderer.addClass).not.toHaveBeenCalled();
      })
    );
  });

  describe('emitEvent()', () => {
    it('should call the emit() of EventEmitter', () => {
      spyOn(component.onClick, 'emit');
      component.emitEvent(null);
      expect(component.onClick.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('showLoader()', () => {
    it('should set to true the value of showSpinner', () => {
      component.showLoader();
      expect(component.showSpinner).toBeTruthy();
    });
  });

  describe('hideLoader()', () => {
    it('should set to false the value of showSpinner', () => {
      component.hideLoader();
      expect(component.showSpinner).toBeFalsy();
    });
  });
});
