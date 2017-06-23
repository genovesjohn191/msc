import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import {
  Renderer2,
  ElementRef
} from '@angular/core';

import { ButtonComponent } from './button.component';
import {
  McsAssetsProvider,
  CoreDefinition
} from '../../core';

describe('ButtonComponent', () => {

  /** Stub Services/Components */
  let component: ButtonComponent;
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        'arrow-right': 'mcs-icon mcs-arrow-right-icon',
        'credit-card': 'fa fa-credit-card',
        'spinner': 'fa fa-spinner fa-pulse',
        'calendar': 'fa fa-calendar'
      };

      return icons[key];
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ButtonComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsAssetsProvider, useValue: mockAssetsProvider },
        Renderer2
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ButtonComponent, {
      set: {
        template: `
          <div #mcsButton>Overridden template here</div>
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
    it('should return the icon class if the value of icon is valid', () => {
      component.icon = 'calendar';
      component.ngOnInit();
      expect(component.fontAwesomeIcon).toBeDefined();
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
    it('should set the value of spinnerIcon', () => {
      component.showLoader();
      expect(component.spinnerIcon).toBeDefined();
    });
  });

  describe('hideLoader()', () => {
    it('should set the value of spinnerIcon to undefined', () => {
      component.hideLoader();
      expect(component.spinnerIcon).toBeUndefined();
    });
  });
});
