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
import { StdDateFormatPipe } from './std-date-format.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild(StdDateFormatPipe)
  public pipe: StdDateFormatPipe;

  public testDate = new Date('2018-06-04T05:53:23Z');
}

describe('StdDateFormatPipe', () => {

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
        StdDateFormatPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>StdDateFormatPipe Template</div>
        <span #testElement>{{ testDate | mcsStdDateFormat }}</span>
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
    it(`should format the testDate into standard format`, () => {
      let testDateElement = component.testElement.nativeElement as HTMLElement;
      expect(testDateElement.textContent.trim()).toBe('Mon, 04 Jun 2018, 1:53 PM');
    });
  });
});
