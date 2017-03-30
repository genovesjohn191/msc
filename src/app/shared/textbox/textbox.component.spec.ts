import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import {
  Renderer,
  ElementRef
} from '@angular/core';

import { TextboxComponent } from './textbox.component';
import { AssetsProvider } from '../../core/providers/assets.provider';

describe('TextboxComponent', () => {

  /** Stub Services/Components */
  let component: TextboxComponent;
  let mockAssetsProvider = {
    getIcon(key: string): string {
      let icons = {
        search: 'fa fa-search'
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
        { provide: AssetsProvider, useValue: mockAssetsProvider }
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
  describe('ngOnInit()', () => {
    it('should return the icon class if the value of icon is valid', () => {
      component.icon = 'search';
      component.ngOnInit();
      expect(component.iconClass).toBeDefined();
    });

    it('should render default textbox if the value of icon is invalid', () => {
      component.icon = 'arrow';
      component.ngOnInit();
      expect(component.iconClass).toBeUndefined();
    });
  });

  describe('writeValue()', () => {
    it('should pass the value of textbox to text', () => {
      component.writeValue('Textbox Value');
      expect(component.text).toEqual('Textbox Value');
    });
  });
});
