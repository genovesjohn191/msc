import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import {
  Renderer,
  ElementRef
} from '@angular/core';

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
    },
    getImagePath(key: string): string {
      let images = {
        loader: 'spinner.gif'
      };

      return images[key];
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

    it('should return the image path of the loader if the loaderKey provided is valid', () => {
      component.loaderKey = 'loader';
      component.ngOnInit();
      expect(component.loaderImage).toBeDefined();
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

  describe('emitEvent()', () => {
    it('should call the emit() of EventEmitter', () => {
      spyOn(component.onClick, 'emit');
      component.emitEvent(null);
      expect(component.onClick.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('showLoader()', () => {
    it('should set the value of isLoading to true', () => {
      component.showLoader();
      expect(component.isLoading).toBeTruthy();
    });
  });

  describe('hideLoader()', () => {
    it('should set the value of isLoading to false', () => {
      component.hideLoader();
      expect(component.isLoading).toBeFalsy();
    });
  });

});
