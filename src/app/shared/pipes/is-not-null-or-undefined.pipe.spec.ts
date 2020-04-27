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
import { IsNotNullOrUndefinedPipe } from './is-not-null-or-undefined.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement1', { static: false })
  public testElement1: ElementRef;

  @ViewChild('testElement2', { static: false })
  public testElement2: ElementRef;

  @ViewChild('testElement3', { static: false })
  public testElement3: ElementRef;

  @ViewChild('testElement4', { static: false })
  public testElement4: ElementRef;

  @ViewChild(IsNotNullOrUndefinedPipe, { static: false })
  public pipe: IsNotNullOrUndefinedPipe;

  public textValue1 = 'sample data';
  public textValue2 = undefined;
  public value3 = 0;
  public value4 = null;
}

describe('IsNotNullOrUndefinedPipe', () => {

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
        IsNotNullOrUndefinedPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>ComponentHandlerDirective Template</div>
        <div>
          <span #testElement1 *ngIf="textValue1 | mcsIsNotNullOrUndefined"></span>
          <span #testElement2 *ngIf="textValue2 | mcsIsNotNullOrUndefined"></span>
          <span #testElement3 *ngIf="value3 | mcsIsNotNullOrUndefined"></span>
          <span #testElement4 *ngIf="value4 | mcsIsNotNullOrUndefined"></span>
        </div>
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
    it(`should create the test element 1 since it is not null or empty`, () => {
      expect(component.testElement1).toBeDefined();
    });

    it(`should not create the test element 2 since it is null or empty`, () => {
      expect(component.testElement2).toBeUndefined();
    });

    it(`should not create the test element 3 since it is null or empty`, () => {
      expect(component.testElement3).toBeDefined();
    });

    it(`should not create the test element 4 since it is null or empty`, () => {
      expect(component.testElement4).toBeUndefined();
    });
  });
});
