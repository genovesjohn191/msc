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
import { PluralPipe } from './plural.pipe';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild('testElementSingular')
  public testElementSingular: ElementRef;

  @ViewChild('testElementPlural')
  public testElementPlural: ElementRef;

  @ViewChild(PluralPipe)
  public pipe: PluralPipe;

  public singular = 1;
  public plural = 5;
}

describe('PluralPipe', () => {

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
        PluralPipe
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div>PluralPipe Template</div>
        <span #testElementSingular>{{ singular | mcsPlural: 'liter' }}</span>
        <span #testElementPlural>{{ plural | mcsPlural: 'box':'boxes' }}</span>
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
    it(`should display the singular label`, () => {
      let textContentElement = component.testElementSingular.nativeElement as HTMLElement;
      expect(textContentElement.innerText).toContain('liter');
    });

    it(`should display the plural label`, () => {
      let textContentElement = component.testElementPlural.nativeElement as HTMLElement;
      expect(textContentElement.innerText).toContain('boxes');
    });
  });
});
