import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { PresentationPanelComponent } from './presentation-panel.component';
import { PresentationPanelModule } from './presentation-panel.module';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(PresentationPanelComponent)
  public presentationComponent: PresentationPanelComponent;
}

describe('PresentationPanelComponent', () => {

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        PresentationPanelModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
          <mcs-presentation-panel>
            <ng-container mcsPresentationPanelHeader>
              Panel Header
            </ng-container>
            <div>Panel Content</div>
          </mcs-presentation-panel>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create mcs-presentation-panel element`, () => {
      let element = document.querySelector('mcs-presentation-panel');
      expect(element).not.toBe(null);
    });

    it(`should create and set the presentation header into the container`, () => {
      let element = document.getElementsByClassName('presentation-panel-header');
      expect(element).not.toBe(null);
      expect(element.item(0).textContent).toContain('Panel Header');
    });

    it(`should create and set the presentation content into the container`, () => {
      let element = document.getElementsByClassName('presentation-panel-content');
      expect(element).not.toBe(null);
      expect(element.item(0).textContent).toContain('Panel Content');
    });
  });
});
