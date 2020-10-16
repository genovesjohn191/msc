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

import { TextPlaceholderPipe } from './text-placeholder.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement')
  public testElement: ElementRef;

  @ViewChild(TextPlaceholderPipe)
  public pipe: TextPlaceholderPipe;

  public testString = '{{name}} Test.';
}

describe('TextPlaceholderPipe', () => {

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
        TextPlaceholderPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>TextPlaceholderPipe Template</div>
        <span #testElement>{{ testString | mcsTextPlaceholder: 'name': 'Macquarie' }}</span>
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
    it(`should transform the test element text content to corresponding value`, () => {
      let testTextElement = component.testElement.nativeElement as HTMLElement;
      expect(testTextElement.textContent.trim()).toBe('Macquarie Test.');
    });
  });
});
