import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';
import { DataSizePipe } from './data-size.pipe';
import {
  convertKbToMb,
  convertMbToGb
} from '@app/utilities';

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

  @ViewChild(DataSizePipe)
  public pipe: DataSizePipe;

  public kilobyte = 512;
  public megabyte = 2048;
  public gigabyte = 8388608;
}

describe('DataSizePipe', () => {

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
        DataSizePipe
      ],
      providers: [DecimalPipe]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>FileSizePipe Template</div>
        <span #testElementKB>{{ kilobyte | mcsDataSize }}</span>
        <span #testElementMB>{{ megabyte | mcsDataSize }}</span>
        <span #testElementGB>{{ gigabyte | mcsDataSize }}</span>
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
