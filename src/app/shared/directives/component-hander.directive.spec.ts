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
import { ComponentHandlerDirective } from './component-handler.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild(ComponentHandlerDirective)
  public directive: ComponentHandlerDirective;
}

describe('ComponentHandlerDirective', () => {

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
