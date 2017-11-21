import {
  async,
  TestBed,
  fakeAsync,
  tick,
  ComponentFixture
} from '@angular/core/testing';
import {
  Component,
  ViewChild,
  ElementRef
} from '@angular/core';
import { SetFocusDirective } from './set-focus.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild(SetFocusDirective)
  public directive: SetFocusDirective;
}

describe('SetFocusDirective', () => {

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
        SetFocusDirective
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>SetFocusDirective Template</div>
        <div #testElement set-focus></div>
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
  describe('ngAfterViewInit()', () => {
    it(`should call the focus method of the host element`, fakeAsync(() => {
      spyOn(component.testElement.nativeElement, 'focus');
      component.directive.ngAfterViewInit();
      tick();
      expect(component.testElement.nativeElement.focus).toHaveBeenCalled();
    }));
  });
});
