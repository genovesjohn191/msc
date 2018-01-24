import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { CommentBoxComponent } from './comment-box.component';
import { CommentBoxModule } from './comment-box.module';
import { CoreTestingModule } from '../../core/testing';

@Component({
  selector: 'mcs-test-comment-box',
  template: ``
})
export class TestCommentBoxComponent {
  @ViewChild(CommentBoxComponent)
  public commentBoxComponent: CommentBoxComponent;
}

describe('CommentBoxComponent', () => {

  /** Stub Services/Components */
  let component: TestCommentBoxComponent;
  let fixtureInstance: ComponentFixture<TestCommentBoxComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestCommentBoxComponent
      ],
      imports: [
        CoreTestingModule,
        CommentBoxModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestCommentBoxComponent, {
      set: {
        template: `
        <mcs-comment-box attachedLimit="single"
          [allowedMimeType]="['image/png', 'text/plain']">
        </mcs-comment-box>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestCommentBoxComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-comment-box element`, () => {
      let element = document.querySelector('mcs-comment-box');
      expect(element).not.toBe(null);
    });

    it(`should set queue limit to 1`, () => {
      expect(component.commentBoxComponent.fileUploader.options.queueLimit).toBe(1);
    });

    it(`should allowed on the inputted Mime Type`, () => {
      expect(component.commentBoxComponent.fileUploader
        .options.allowedMimeType.length).toBe(2);
    });

    it(`should not auto upload`, () => {
      expect(component.commentBoxComponent.fileUploader.autoUpload).toBeFalsy();
    });
  });
});
