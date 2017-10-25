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
import { triggerEvent } from '../../utilities';
import { StopPropagationDirective } from './stop-propagation.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  public parentFlag: boolean = false;
  public childFlag: boolean = false;

  @ViewChild('parentElement')
  public parentElement: ElementRef;

  @ViewChild('childElement')
  public childElement: ElementRef;

  @ViewChild(StopPropagationDirective)
  public directive: StopPropagationDirective;

  public parentClick(): void {
    this.parentFlag = true;
  }

  public childClick(): void {
    this.childFlag = true;
  }
}

describe('StopPropagationDirective', () => {

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
        StopPropagationDirective
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>StopPropagationDirective Template</div>
        <div id="parent" #parentElement (click)="parentClick()">
          <div #childElement id="child" stop-propagation (click)="childClick()"></div>
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
  describe('childClick()', () => {
    beforeEach(async(() => {
      triggerEvent(component.childElement.nativeElement, 'click');
    }));

    it(`should set the flag of the parent element to false when child element is click`, () => {
      expect(component.parentFlag).toBeFalsy();
    });

    it(`should set the flag of the child element to true when child element is click`, () => {
      expect(component.childFlag).toBeTruthy();
    });
  });

  describe('parentClick()', () => {
    beforeEach(async(() => {
      triggerEvent(component.parentElement.nativeElement, 'click');
    }));

    it(`should set the flag of the parent element to true when parent element is click`, () => {
      expect(component.parentFlag).toBeTruthy();
    });

    it(`should set the flag of the child element to false when parent element is click`, () => {
      expect(component.childFlag).toBeFalsy();
    });
  });
});
