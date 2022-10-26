
import {
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync
} from '@angular/core/testing';
import { SafeHtmlPipe } from './safe-html.pipe';


@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElement1')
  public testElement1: ElementRef;

  @ViewChild(SafeHtmlPipe)
  public pipe: SafeHtmlPipe;


  constructor() {

  }
}

describe('SafeHtmlPipe', () => {

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
        SafeHtmlPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>SafeHtmlPipe Template</div>
        <div #testElement1 [innerHtml]="'<a href=&quot;http://www.google.com&quot;>google</a>' | safeHtml">
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
  describe('ngOnInit()', () => {
    it(`should create the element`, () => {
      let textContentElement = component.testElement1.nativeElement as HTMLElement;
      expect(textContentElement).toBeDefined();
    });

    it(`should sanitize the value as trusted html`, () => {
      let textContentElement = component.testElement1.nativeElement as HTMLElement;
      expect(textContentElement.innerHTML).toEqual('<a href="http://www.google.com">google</a>');
    });

  });
});
