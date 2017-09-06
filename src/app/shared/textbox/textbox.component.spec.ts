import {
  async,
  TestBed
} from '@angular/core/testing';

import { TextboxComponent } from './textbox.component';
import {
  McsTextContentProvider,
  CoreDefinition
} from '../../core';

describe('TextboxComponent', () => {

  /** Stub Services/Components */
  let component: TextboxComponent;
  let mockEmailErrorMessage = 'Please enter a valid email address.';
  let mockTextProvider = {
    content: {
      validationMessages: {
        email: mockEmailErrorMessage
      }
    }
  };

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TextboxComponent
      ],
      providers: [
        { provide: McsTextContentProvider, useValue: mockTextProvider }
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TextboxComponent, {
      set: {
        template: `
          <div>TextboxComponent Template</div>
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
    it('should set the iconKey to inputted icon', () => {
      component.icon = 'search';
      component.ngOnInit();
      expect(component.iconKey).toBe(component.icon);
    });
  });

  describe('writeValue()', () => {
    it('should pass the value of textbox to text', () => {
      component.writeValue('Textbox Value');
      expect(component.value).toEqual('Textbox Value');
    });
  });

  describe('showLoader()', () => {
    it('should set the spinner icon key definition as the iconKey', () => {
      component.showLoader();
      expect(component.iconKey).toBe(CoreDefinition.ASSETS_GIF_SPINNER);
    });
  });

  describe('hideLoader()', () => {
    it('should set the value of iconKey based on the inputted icon', () => {
      component.icon = 'search';
      component.hideLoader();
      expect(component.iconKey).toBe(component.icon);
    });
  });
});
