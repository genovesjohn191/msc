import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { ActionItemComponent } from './action-item.component';
import { ActionItemModule } from './action-item.module';

@Component({
  selector: 'mcs-test-action-item',
  template: ``
})
export class TestActionItemComponent {
  @ViewChild(ActionItemComponent)
  public actionItemComponent: ActionItemComponent;
}

describe('ActionItemComponent', () => {
  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestActionItemComponent
      ],
      imports: [
        ActionItemModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestActionItemComponent, {
      set: {
        template: `
        <mcs-action-item>
          <span>New server</span>
        </mcs-action-item>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestActionItemComponent);
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-action-item element`, () => {
      let element = document.querySelector('mcs-action-item');
      expect(element).not.toBe(null);
    });
  });
});
