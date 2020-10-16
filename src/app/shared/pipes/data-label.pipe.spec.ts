import {
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { DataLabelPipe } from './data-label.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElementEmptyData')
  public testElementEmptyData: ElementRef;

  @ViewChild('testElementSampleData')
  public testElementSampleData: ElementRef;

  @ViewChild(DataLabelPipe)
  public pipe: DataLabelPipe;

  public emptyData = '';
  public testData = 'Sample Data';
}

describe('DataLabelPipe', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixtureInstance: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        DataLabelPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>DataLabelPipe Template</div>
        <span #testElementEmptyData>{{ emptyData | mcsDataLabel: 'None' }}</span>
        <span #testElementSampleData>{{ testData | mcsDataLabel: 'Unknown' }}</span>
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
    it(`should display the data label`, () => {
      let textContentElement = component.testElementEmptyData.nativeElement as HTMLElement;
      expect(textContentElement.innerText).toContain('None');
    });

    it(`should display the data`, () => {
      let textContentElement = component.testElementSampleData.nativeElement as HTMLElement;
      expect(textContentElement.innerText).toContain(component.testData);
    });
  });
});
