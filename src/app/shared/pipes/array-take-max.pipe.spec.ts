import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import {
  Component,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import { ArrayTakeMaxPipe } from './array-take-max.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChildren('testElement')
  public testElements: QueryList<ElementRef>;

  @ViewChild(ArrayTakeMaxPipe, { static: false })
  public pipe: ArrayTakeMaxPipe;

  public sourceArray: string[];

  constructor() {
    this.sourceArray = [
      'one',
      'two',
      'three',
      'four',
      'five',
      'six'
    ];
  }
}

describe('ArrayTakeMaxPipe', () => {

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
        ArrayTakeMaxPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>ArrayTakeMaxPipe Template</div>
        <span #testElement *ngFor="let item of (sourceArray | mcsArrayTakeMax: 3)">
          {{ item }}
        </span>
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
    it(`should display 3 of the source array items`, () => {
      let displayedArraySource = component.testElements;
      expect(displayedArraySource.length).toBe(3);
    });
  });
});
