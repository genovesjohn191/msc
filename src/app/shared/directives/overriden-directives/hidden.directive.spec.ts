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
import { HiddenDirective } from './hidden.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild(HiddenDirective)
  public directive: HiddenDirective;

  public flag: boolean;
}

describe('HiddenDirective', () => {

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
        HiddenDirective
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>HiddenDirective Template</div>
        <div #testElement [hidden]="flag"></div>
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
    it(`should set the hide-element class to host element`, () => {
      component.flag = true;
      fixtureInstance.detectChanges();
      expect(component.testElement.nativeElement.classList
        .contains('hide-element')).toBeTruthy();
    });
  });
});
