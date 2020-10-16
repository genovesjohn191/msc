import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { MapIterablePipe } from './map-iterable.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChildren('testElement')
  public testElements: QueryList<ElementRef>;

  @ViewChild(MapIterablePipe)
  public pipe: MapIterablePipe;

  public mapContents = new Map<string, string>();

  constructor() {
    this.mapContents.set('one', 'value1');
    this.mapContents.set('two', 'value2');
    this.mapContents.set('three', 'value3');
  }
}

describe('MapIterablePipe', () => {

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
        MapIterablePipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>MapIterablePipe Template</div>
        <div #testElement *ngFor="let item of (mapContents | mcsMapIterable)">
          <span>{{ item.key }}</span>
          <span>{{ item.value }}</span>
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
    it(`should create 3 test elements`, () => {
      expect(component.testElements.length).toBe(3);
    });
  });
});
