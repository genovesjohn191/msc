import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FileSizePipe } from './file-size.pipe';
import {
  convertKbToMb,
  convertMbToGb
} from '../../utilities';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElementKB')
  public testElementKB: ElementRef;

  @ViewChild('testElementMB')
  public testElementMB: ElementRef;

  @ViewChild('testElementGB')
  public testElementGB: ElementRef;

  @ViewChild(FileSizePipe)
  public pipe: FileSizePipe;

  public kilobyte = 512;
  public megabyte = 2048;
  public gigabyte = 8388608;
}

describe('FileSizePipe', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixtureInstance: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        FileSizePipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>FileSizePipe Template</div>
        <span #testElementKB>{{ kilobyte | mcsFileSize }}</span>
        <span #testElementMB>{{ megabyte | mcsFileSize }}</span>
        <span #testElementGB>{{ gigabyte | mcsFileSize }}</span>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should display the size in KB`, () => {
      let textContentElement = component.testElementKB.nativeElement as HTMLElement;
      expect(textContentElement.innerText).toContain(`${component.kilobyte}`);
    });

    it(`should display the size in MB`, () => {
      let textContentElement = component.testElementMB.nativeElement as HTMLElement;
      let sizeMB = convertKbToMb(component.megabyte);
      expect(textContentElement.innerText).toContain(`${sizeMB}`);
    });

    it(`should display the size in GB`, () => {
      let textContentElement = component.testElementGB.nativeElement as HTMLElement;
      let sizeMB = convertKbToMb(component.gigabyte);
      let sizeGB = convertMbToGb(sizeMB);
      expect(textContentElement.innerText).toContain(`${sizeGB}`);
    });
  });
});
