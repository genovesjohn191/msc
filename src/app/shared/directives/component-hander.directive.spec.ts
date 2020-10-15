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

import { ComponentHandlerDirective } from './component-handler.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement', { static: false })
  public testElement: ElementRef;

  @ViewChild(ComponentHandlerDirective, { static: false })
  public directive: ComponentHandlerDirective;
}

describe('ComponentHandlerDirective', () => {

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
        ComponentHandlerDirective
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>ComponentHandlerDirective Template</div>
        <div #testElement *mcsComponentHandler></div>
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
    it(`should create test element`, () => {
      component.directive.createComponent();
      expect(component.testElement.nativeElement).toBeDefined();
    });

    it(`should remove test element`, () => {
      component.directive.removeComponent();
      fixtureInstance.detectChanges();
      expect(component.testElement).toBeUndefined();
    });

    it(`should re-create test element`, () => {
      component.directive.recreateComponent();
      expect(component.testElement.nativeElement).toBeDefined();
    });
  });
});
