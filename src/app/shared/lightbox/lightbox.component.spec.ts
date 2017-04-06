import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { Renderer } from '@angular/core';

import { LightboxComponent } from './lightbox.component';
import { AssetsProvider } from '../../core/providers/assets.provider';

describe('ButtonComponent', () => {

  /** Stub Services/Components */
  let component: LightboxComponent;
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
        LightboxComponent
      ],
      imports: [
      ],
      providers: [
        { provide: AssetsProvider, useValue: mockAssetsProvider },
        Renderer
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(LightboxComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(LightboxComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should return the icon class if the value of icon is valid', () => {
      component.icon = 'credit-card';
      component.ngOnInit();
      expect(component.iconClass).toBeDefined();
    });
  });

});
