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
import { McsAssetsProvider } from '../../core';

describe('ButtonComponent', () => {

  /** Stub Services/Components */
  let component: ButtonComponent;
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        'arrow-right': 'mcs-icon mcs-arrow-right-icon',
        'credit-card': 'fa fa-credit-card',
        'spinner': 'fa fa-spinner fa-pulse'
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
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ButtonComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.mcsButton = new ElementRef(document.createElement('button'));
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should return the icon class if the value of iconLeft is valid', () => {
      component.iconLeft = 'credit-card';
      component.ngOnInit();
      expect(component.iconLeftClass).toBeDefined();
    });

    it('should return the icon class if the value of iconRight is valid', () => {
      component.iconRight = 'arrow-right';
      component.ngOnInit();
      expect(component.iconRightClass).toBeDefined();
    });
  });

  describe('ngAfterViewInit()', () => {
    it('should use default styling if no icon found',
      inject([Renderer2], (renderer: Renderer2) => {
        spyOn(renderer, 'addClass');
        component.iconLeft = 'arrow-forward';
        component.iconRight = 'angular';
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
    it('should set the value of iconClass', () => {
      component.showLoader();
      expect(component.iconRightClass).toBeDefined();
    });
  });

  describe('hideLoader()', () => {
    it('should set the value of iconClass', () => {
      component.iconRight = 'arrow-right';
      component.hideLoader();
      expect(component.iconRightClass).toBeDefined();
    });
  });
});
