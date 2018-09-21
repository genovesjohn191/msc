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
import { CoreTestingModule } from '@app/core/testing';
import { ScrollableDirective } from './scrollable.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild(ScrollableDirective)
  public directive: ScrollableDirective;
}

describe('ScrollableDirective', () => {

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
        ScrollableDirective
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>ScrollableDirective Template</div>
        <div #testElement scrollable scrollbarSize="small"></div>
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
    it(`should set the scrollbar-default class to host element`, () => {
      expect(component.testElement.nativeElement.classList
        .contains('scrollbar-default')).toBeTruthy();
    });

    it(`should set the scrollbar-small class to host element`, () => {
      expect(component.testElement.nativeElement.classList
        .contains('scrollbar-small')).toBeTruthy();
    });
  });
});
