import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { Renderer } from '@angular/core';

import { ButtonComponent } from './button.component';
import { AssetsProvider } from '../../core/providers/assets.provider';

describe('ButtonComponent', () => {

  /** Stub Services/Components */
  let component: ButtonComponent;
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        'arrow-right': 'mcs-icon mcs-arrow-right-icon',
        'credit-card': 'fa fa-credit-card'
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
        { provide: AssetsProvider, useValue: mockAssetsProvider },
        Renderer
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
      inject([Renderer], (renderer: Renderer) => {
        spyOn(renderer, 'setElementClass');
        component.iconLeft = 'arrow-forward';
        component.iconRight = 'angular';
        component.ngAfterViewInit();
        expect(renderer.setElementClass).not.toHaveBeenCalled();
      })
    );
  });

});
