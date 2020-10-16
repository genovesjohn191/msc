import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CoreTestingModule } from '@app/core/testing';

import { ButtonComponent } from './button.component';
import { ButtonModule } from './button.module';

@Component({
  selector: 'mcs-test-button',
  template: ``
})
export class TestButtonComponent {
  @ViewChild(ButtonComponent)
  public buttonComponent: ButtonComponent;
}

describe('ButtonComponent', () => {

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestButtonComponent
      ],
      imports: [
        FormsModule,
        CoreTestingModule,
        ButtonModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestButtonComponent, {
      set: {
        template: `
        <button mcsButton="basic" id="btnFirst"
          arrow="right"
          size="small"
          color="primary">First Button</button>primary
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestButtonComponent);
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the button element with the id of btnFirst`, () => {
      let element = document.getElementById('btnFirst');
      expect(element).not.toBe(null);
    });

    it(`should set button type to basic`, () => {
      let element = document.getElementById('btnFirst');
      expect(element.classList.contains('basic')).toBeTruthy();
    });

    it(`should set button size to small`, () => {
      let element = document.getElementById('btnFirst');
      expect(element.classList.contains('small')).toBeTruthy();
    });

    it(`should set button color to primary`, () => {
      let element = document.getElementById('btnFirst');
      expect(element.classList.contains('primary')).toBeTruthy();
    });
  });
});
