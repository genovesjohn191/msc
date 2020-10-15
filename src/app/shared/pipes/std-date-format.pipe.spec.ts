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
import { CoreTestingModule } from '@app/core/testing';

import { StdDateFormatPipe } from './std-date-format.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement', { static: false })
  public testElement: ElementRef;

  @ViewChild(StdDateFormatPipe, { static: false })
  public pipe: StdDateFormatPipe;

  public testDate = new Date('2018-06-04T05:53:23Z');
}

describe('StdDateFormatPipe', () => {

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
        StdDateFormatPipe
      ],
      imports: [
        CoreTestingModule
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
      expect(testDateElement.textContent.trim()).toContain('Mon, 04 Jun 2018');
    });
  });
});
