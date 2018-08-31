import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { DialogModule } from './dialog.module';
import { CoreTestingModule } from '../../core/testing';

@Component({
  selector: 'mcs-test-dialog',
  template: ``
})
export class TestDialogComponent {
  @ViewChild(DialogComponent)
  public dialogComponent: DialogComponent;
}

describe('DialogComponent', () => {

  /** Stub Services/Components */
  let fixtureInstance: ComponentFixture<DialogComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestDialogComponent
      ],
      imports: [
        CoreTestingModule,
        DialogModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestDialogComponent, {
      set: {
        template: `
        <mcs-dialog>
          <mcs-dialog-header>
            <h1>Dialog Title</h1>
          </mcs-dialog-header>

          <mcs-dialog-content>
            <span>Dialog Content</span>
          </mcs-dialog-content>

          <mcs-dialog-actions>
            <span>Dialog Actions</span>
          </mcs-dialog-actions>
        </mcs-dialog>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestDialogComponent);
      fixtureInstance.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('dialog()', () => {
    it(`should create the mcs-dialog element`, () => {
      let element = document.querySelector('mcs-dialog');
      expect(element).not.toBe(null);
    });

    it(`should create mcs-dialog-header element`, () => {
      let element = document.querySelector('mcs-dialog-header');
      expect(element).not.toBe(null);
    });

    it(`should create mcs-dialog-actions element`, () => {
      let element = document.querySelector('mcs-dialog-actions');
      expect(element).not.toBe(null);
    });
  });
});
