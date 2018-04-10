import {
  Component,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { CollapsiblePanelComponent } from './collapsible-panel.component';
import { CollapsiblePanelModule } from './collapsible-panel.module';
import { CoreTestingModule } from '../../core/testing';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(CollapsiblePanelComponent)
  public collapsiblePanelComponent: CollapsiblePanelComponent;
}

describe('CollapsiblePanelComponent', () => {

  /** Stub Services/Components */
  let component: TestComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        FormsModule,
        CoreTestingModule,
        CollapsiblePanelModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <mcs-collapsible-panel header="Feature Add-ons">
          <div>
            <span>collapsible content</span>
          </div>
        </mcs-collapsible-panel>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-collapsible-panel element`, () => {
      let element: any;
      element = document.querySelector('mcs-collapsible-panel');
      expect(element).not.toBe(null);
    });
  });

  describe('onChange() when value is true', () => {
    beforeEach(async(() => {
      component.collapsiblePanelComponent.value = true;
      component.collapsiblePanelComponent.onChange(true);
    }));

    it(`should set the value to true`, () => {
      expect(component.collapsiblePanelComponent.value).toBeTruthy();
    });

    it(`should open the panel`, () => {
      expect(component.collapsiblePanelComponent.panelOpen).toBeTruthy();
    });
  });

  describe('onChange() when value is false', () => {
    beforeEach(async(() => {
      component.collapsiblePanelComponent.value = false;
      component.collapsiblePanelComponent.onChange(false);
    }));

    it(`should set the value to false`, () => {
      expect(component.collapsiblePanelComponent.value).toBeFalsy();
    });

    it(`should close the panel`, () => {
      expect(component.collapsiblePanelComponent.panelOpen).toBeFalsy();
    });
  });
});
