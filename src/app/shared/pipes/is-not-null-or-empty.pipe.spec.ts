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

import { IsNotNullOrEmptyPipe } from './is-not-null-or-empty.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement1')
  public testElement1: ElementRef;

  @ViewChild('testElement2')
  public testElement2: ElementRef;

  @ViewChild(IsNotNullOrEmptyPipe)
  public pipe: IsNotNullOrEmptyPipe;

  public textValue1 = 'sample data';
  public textValue2 = undefined;
}

describe('IsNullOrEmptyPipe', () => {

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
        IsNotNullOrEmptyPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>ComponentHandlerDirective Template</div>
        <div>
          <span #testElement1 *ngIf="textValue1 | mcsIsNotNullOrEmpty"></span>
          <span #testElement2 *ngIf="textValue2 | mcsIsNotNullOrEmpty"></span>
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
  });
});
