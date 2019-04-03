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
import { GreyedOutDirective } from './greyed-out.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild('testElementWithTrueCondition')
  public testElementWithTrueCondition: ElementRef;

  @ViewChild('testElementWithFalseCondition')
  public testElementWithFalseCondition: ElementRef;

  @ViewChild(GreyedOutDirective)
  public directive: GreyedOutDirective;

  public testBooleanTrue: boolean = true;
  public testBooleanFalse: boolean = false;
}

describe('GreyedOutDirective', () => {

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
        GreyedOutDirective
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>GreyedOutDirective Template</div>
        <div #testElement mcsGreyedOut></div>
        <div #testElementWithTrueCondition style="opacity:0.9" [mcsGreyedOut]="testBooleanTrue" ></div>
        <div #testElementWithFalseCondition style="opacity:0.9" [mcsGreyedOut]="testBooleanFalse" ></div>
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
    it(`should set the host element's opacity style to 0.5`, () => {
      component.directive.ngOnInit();
      expect(component.testElement.nativeElement.style.opacity).toBe('0.5');
    });

    it(`should set the host element's opacity if passed boolean is true`, () => {
      component.directive.ngOnInit();
      expect(component.testElementWithTrueCondition.nativeElement.style.opacity).toBe('0.5');
    });

    it(`should not set the host element's opacity if passed boolean is false`, () => {
      component.directive.ngOnInit();
      expect(component.testElementWithFalseCondition.nativeElement.style.opacity).toBe('0.9');
    });
  });
});
