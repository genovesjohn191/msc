import {
  Component,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { FileDownloadModule } from './file-download.module';
import { FileDownloadComponent } from './file-download.component';
import { CoreTestingModule } from '../../core/testing';
import { McsFileInfo } from '../../core';
import { FileLikeObject } from 'ng2-file-upload';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(FileDownloadComponent)
  public fileDownloadComponent: FileDownloadComponent;

  public get file(): McsFileInfo {
    let fileInfo = new McsFileInfo();
    fileInfo.filename = 'VDCs in the Enterprise';
    fileInfo.fileContents = {
      name: 'VDCs in the Enterprise',
      type: 'pdf',
      size: 12000
    } as FileLikeObject;

    return fileInfo;
  }

  public get url(): string {
    return 'https://scholar.harvard.edu/files/torman_personal/files/samplepptx.pptx';
  }
}

describe('FileDownloadComponent', () => {

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
        FileDownloadModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <mcs-file-download [file]="file" [url]="url"></mcs-file-download>
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
      let element: any;
      element = document.querySelector('mcs-file-download');
      expect(element).not.toBe(null);
    });

    it(`file type should be defined`, () => {
      expect(component.fileDownloadComponent.fileType).toBeDefined();
    });

    it(`file size should be defined`, () => {
      expect(component.fileDownloadComponent.fileSize).toBeDefined();
    });
  });
});
