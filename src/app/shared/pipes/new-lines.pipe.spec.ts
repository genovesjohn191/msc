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

import { NewLinesPipe } from './new-lines.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement', { static: false })
  public testElement: ElementRef;

  @ViewChild(NewLinesPipe, { static: false })
  public pipe: NewLinesPipe;

  public textContent = 'TextWith\nNewLine';
}

describe('NewLinesPipe', () => {

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
        NewLinesPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>NewLinesPipe Template</div>
        <span #testElement [innerHTML]="textContent | mcsNewLines"></span>
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
    it(`should display the text with new line`, () => {
      let textContentElement = component.testElement.nativeElement as HTMLElement;
      expect(textContentElement.innerHTML).toContain('<br>');
    });
  });
});
