import {
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { TextPhoneNumberFormatPipe } from './text-phonenumber-format.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild('testElementForCustomRegex')
  public testElementForCustomRegex: ElementRef;

  @ViewChild(TextPhoneNumberFormatPipe)
  public pipe: TextPhoneNumberFormatPipe;

  public testPhoneNumberString = '1111222333';
  public customRegex: RegExp = /^(\d{3})(\d{3})(\d{4})$/;
}

describe('TextPhoneNumberFormatPipe', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixtureInstance: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        TextPhoneNumberFormatPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>TextPhoneNumberFormatPipe Template</div>
        <span #testElement>{{ testPhoneNumberString | mcsPhoneNumberFormat }}</span>
        <span #testElementForCustomRegex>{{ testPhoneNumberString | mcsPhoneNumberFormat: customRegex }}</span>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should transform the phone number text content to corresponding value`, () => {
      let testTextElement = component.testElement.nativeElement as HTMLElement;
      expect(testTextElement.textContent.trim()).toBe('1111 222 333');
    });
  });

  describe('ngOnInit()', () => {
    it(`should transform the phone number text content to corresponding value given custom regex`, () => {
      let testTextElement = component.testElementForCustomRegex.nativeElement as HTMLElement;
      expect(testTextElement.textContent.trim()).toBe('1111222333');
    });
  });
});
