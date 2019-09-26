import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { FileAttachmentComponent } from './file-attachment.component';
import { FileAttachmentModule } from './file-attachment.module';
import { CoreTestingModule } from '@app/core/testing';

@Component({
  selector: 'mcs-test-attachment',
  template: ``
})
export class TestAttachmentComponent {
  @ViewChild(FileAttachmentComponent, { static: false })
  public attachmentComponent: FileAttachmentComponent;
}

describe('AttachmentComponent', () => {

  /** Stub Services/Components */
  let component: TestAttachmentComponent;
  let fixtureInstance: ComponentFixture<TestAttachmentComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestAttachmentComponent
      ],
      imports: [
        CoreTestingModule,
        FileAttachmentModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestAttachmentComponent, {
      set: {
        template: `
        <mcs-file-attachment attachedLimit="single" [allowedMimeType]="['image/png', 'text/plain']">
        </mcs-file-attachment>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestAttachmentComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-file-attachment element`, () => {
      let element = document.querySelector('mcs-file-attachment');
      expect(element).not.toBe(null);
    });

    it(`should set queue limit to 1`, () => {
      expect(component.attachmentComponent.fileUploader.options.queueLimit).toBe(1);
    });

    it(`should allowed on the inputted Mime Type`, () => {
      expect(component.attachmentComponent.fileUploader
        .options.allowedMimeType.length).toBe(2);
    });

    it(`should not auto upload`, () => {
      expect(component.attachmentComponent.fileUploader.autoUpload).toBeFalsy();
    });
  });
});
