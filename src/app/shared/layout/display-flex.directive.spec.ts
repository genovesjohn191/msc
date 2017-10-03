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
import { DisplayFlexDirective } from './display-flex.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild(DisplayFlexDirective)
  public directive: DisplayFlexDirective;
}

describe('DisplayFlexDirective', () => {

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
        DisplayFlexDirective
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>DisplayFlexDirective Template</div>
        <div #testElement display-flex align-items="center" justify-content="center"></div>
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
    it(`should set the display-flex-row class to host element`, () => {
      expect(component.testElement.nativeElement.classList
        .contains('display-flex-row')).toBeTruthy();
    });

    it(`should set the align-items-center class to host element`, () => {
      expect(component.testElement.nativeElement.classList
        .contains('align-items-center')).toBeTruthy();
    });

    it(`should set the justify-content-center class to host element`, () => {
      expect(component.testElement.nativeElement.classList
        .contains('justify-content-center')).toBeTruthy();
    });
  });
});
