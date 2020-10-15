import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { RippleComponent } from './ripple.component';
import { RippleModule } from './ripple.module';

@Component({
  selector: 'mcs-test-ripple',
  template: ``
})
export class TestRippleComponent {
  @ViewChild(RippleComponent, { static: false })
  public rippleComponent: RippleComponent;
}

describe('RippleComponent', () => {

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestRippleComponent
      ],
      imports: [
        RippleModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestRippleComponent, {
      set: {
        template: `
        <mcs-ripple></mcs-ripple>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestRippleComponent);
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-ripple element`, () => {
      let element = document.querySelector('mcs-ripple');
      expect(element).not.toBe(null);
    });

    it(`should set the position of the host element to relative`, () => {
      let element = document.querySelector('mcs-ripple');
      expect(element.parentElement.style.position).toBe('relative');
    });
  });
});
