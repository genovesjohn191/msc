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
import { CoreTestingModule } from '@app/core/testing';

import { AlignDirective } from './align.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('startTestElement', { static: false })
  public startTestElement: ElementRef<HTMLElement>;

  @ViewChild('centerTestElement', { static: false })
  public centerTestElement: ElementRef<HTMLElement>;

  @ViewChild('endTestElement', { static: false })
  public endTestElement: ElementRef<HTMLElement>;

  @ViewChild(AlignDirective, { static: false })
  public directive: AlignDirective;
}

describe('AlignDirective', () => {

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
        AlignDirective
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>AlignDirective Template</div>
        <div #startTestElement [ngStyle]="{'display': 'flex'}">
          <div mcsAlign="start">Start Element</div>
          <div>End Element</div>
        </div>
        <div #centerTestElement [ngStyle]="{'display': 'flex'}">
          <div>Start Element</div>
          <div mcsAlign="center">End Element</div>
        </div>
        <div #endTestElement [ngStyle]="{'display': 'flex'}">
          <div>Start Element</div>
          <div mcsAlign="end">End Element</div>
        </div>
        `
      }
    });

    /** Testbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
      component.directive.ngAfterViewInit();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should have created 1 spacer element before the host element`, () => {
      let addedElements = component.startTestElement
        .nativeElement.querySelectorAll('[id*="spacer"]');
      expect(addedElements.length).toBe(1);
    });

    it(`should have created 2 spacer elements before and after the host element`, () => {
      let addedElements = component.centerTestElement
        .nativeElement.querySelectorAll('[id*="spacer"]');
      expect(addedElements.length).toBe(2);
    });

    it(`should have created 1 spacer element after the host element`, () => {
      let addedElements = component.endTestElement
        .nativeElement.querySelectorAll('[id*="spacer"]');
      expect(addedElements.length).toBe(1);
    });
  });
});
