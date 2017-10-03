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
import { FlexDirective } from './flex.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild(FlexDirective)
  public directive: FlexDirective;
}

describe('FlexDirective', () => {

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
        FlexDirective
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>FlexDirective Template</div>
        <div #testElement flex="auto"></div>
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
    it(`should set the flex-auto class to host element`, () => {
      expect(component.testElement.nativeElement.classList.contains('flex-auto')).toBeTruthy();
    });
  });
});
