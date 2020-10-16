import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CoreTestingModule } from '@app/core/testing';

import { FileDownloadComponent } from './file-download.component';
import { FileDownloadModule } from './file-download.module';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(FileDownloadComponent)
  public fileDownloadComponent: FileDownloadComponent;

  public fileType(): string {
    return 'image/png';
  }

  public fileSize(): number {
    return 1024;
  }
}

describe('FileDownloadComponent', () => {

  /** Stub Services/Components */
  let component: TestComponent;

  beforeEach(waitForAsync(() => {
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
        FileDownloadModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <mcs-file-download [fileType]="fileType" [sizeMB]="fileSize"></mcs-file-download>
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
    it(`should create the mcs-file-download element`, () => {
      let element = document.querySelector('mcs-file-download');
      expect(element).not.toBe(null);
    });

    it(`should define filetype`, () => {
      expect(component.fileDownloadComponent.fileType).toBeDefined();
    });

    it(`should define filesize`, () => {
      expect(component.fileDownloadComponent.sizeMB).toBeDefined();
    });
  });
});
