import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { RippleDirective } from './ripple.directive';
import { RippleModule } from './ripple.module';

@Component({
  selector: 'mcs-test-ripple-directive',
  template: ``
})
export class TestRippleDirectiveComponent {
  @ViewChild(RippleDirective)
  public rippleDirective: RippleDirective;
}

describe('RippleDirective', () => {
  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestRippleDirectiveComponent
      ],
      imports: [
        RippleModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestRippleDirectiveComponent, {
      set: {
        template: `
        <mcs-ripple mcsRipple></mcs-ripple>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestRippleDirectiveComponent);
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-ripple element with mcsRipple Attribute`, () => {
      let element = document.querySelector('mcs-ripple');
      expect(element).not.toBe(null);
      expect(element.hasAttribute('mcsRipple')).toBeTruthy();
    });
  });
});
