import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';

import { TextboxComponent } from './textbox.component';
import { McsAssetsProvider } from '../../core';

describe('TextboxComponent', () => {

  /** Stub Services/Components */
  let component: TextboxComponent;
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        search: 'fa fa-search',
        spinner: 'fa fa-spinner fa-pulse'
      };

      return icons[key];
    }
  };

  beforeEach(async(() => {
    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TextboxComponent
      ],
      imports: [
      ],
      providers: [
        { provide: McsAssetsProvider, useValue: mockAssetsProvider }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TextboxComponent, {
      set: {
        template: `
          <div>Overridden template here</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TextboxComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnChanges()', () => {
    it('should return the icon class if the value of icon is valid', () => {
      component.icon = 'search';
      component.ngOnChanges();
      expect(component.iconClass).toBeDefined();
    });

    it('should render default textbox if the value of icon is invalid', () => {
      component.icon = 'arrow';
      component.ngOnChanges();
      expect(component.iconClass).toBeUndefined();
    });
  });

  describe('writeValue()', () => {
    it('should pass the value of textbox to text', () => {
      component.writeValue('Textbox Value');
      expect(component.text).toEqual('Textbox Value');
    });
  });

  describe('getIconClass()', () => {
    it('should return the icon class if provided iconKey is valid', () => {
      component.getIconClass('search');
      expect(component.getIconClass('search')).toBeDefined();
    });
  });

  describe('showLoader()', () => {
    it('should set the value of iconClass', () => {
      component.showLoader();
      expect(component.iconClass).toBeDefined();
    });
  });

  describe('hideLoader()', () => {
    it('should set the value of iconClass', () => {
      component.icon = 'search';
      component.hideLoader();
      expect(component.iconClass).toBeDefined();
    });
  });
});
