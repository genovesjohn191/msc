import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import {
  Component,
  ViewChild
} from '@angular/core';
import { CoreTestingModule } from '@app/core/testing';
import { getElementStyle } from '@app/utilities';
import { AlignContentDirective } from './align-content.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(AlignContentDirective)
  public directive: AlignContentDirective;
}

describe('AlignContentDirective', () => {

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
        AlignContentDirective
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
        <div #testElement [ngStyle]="{'display': 'flex'}" mcsAlignContent="bottom-center"></div>
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
    it(`should set the align-items and justify-content style to host element`, () => {
      let alignItems = getElementStyle(component.directive.hostElement, 'alignItems');
      let justifyContent = getElementStyle(component.directive.hostElement, 'justifyContent');
      expect(alignItems).toBe('flex-end');
      expect(justifyContent).toBe('center');
    });
  });
});
