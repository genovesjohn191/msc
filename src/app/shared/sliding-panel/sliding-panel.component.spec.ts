import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { SlidingPanelComponent } from './sliding-panel.component';
import { SlidingPanelModule } from './sliding-panel.module';

@Component({
  selector: 'mcs-test-sliding-panel',
  template: ``
})
export class TestSlidingPanelComponent {
  @ViewChild(SlidingPanelComponent, { static: false })
  public slidingPanelComponent: SlidingPanelComponent;
}

describe('SlidingPanelComponent', () => {

  /** Stub Services/Components */
  let component: TestSlidingPanelComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestSlidingPanelComponent
      ],
      imports: [
        SlidingPanelModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestSlidingPanelComponent, {
      set: {
        template: `
        <mcs-sliding-panel>
          <div class="test-element-class"></div>
        </mcs-sliding-panel>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestSlidingPanelComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-sliding-panel element`, () => {
      let element = document.querySelector('mcs-sliding-panel');
      expect(element).not.toBe(null);
    });
  });

  describe('open()', () => {
    it(`should open the sliding panel element`, () => {
      component.slidingPanelComponent.open();
      expect(component.slidingPanelComponent.panelOpen).toBeTruthy();
    });
  });

  describe('close()', () => {
    it(`should close the sliding panel element`, () => {
      component.slidingPanelComponent.close();
      expect(component.slidingPanelComponent.panelOpen).toBeFalsy();
    });
  });

  describe('toggle()', () => {
    it(`should toggle the sliding panel element`, () => {
      component.slidingPanelComponent.open();
      component.slidingPanelComponent.toggle();
      expect(component.slidingPanelComponent.panelOpen).toBeFalsy();
    });
  });
});
