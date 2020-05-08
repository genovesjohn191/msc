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
  import { ArrayHasElement } from './array-has-element.pipe';
  
  @Component({
    selector: 'mcs-test',
    template: ``
  })
  export class TestComponent {
    @ViewChild('testElement1', { static: false })
    public testElement1: ElementRef;
  
    @ViewChild('testElement2', { static: false })
    public testElement2: ElementRef;
  
    @ViewChild(ArrayHasElement, { static: false })
    public pipe: ArrayHasElement;
  
    public textValue1: Array<string> = [ "one", "two", "three"];
    public textValue2: Array<string>;
  }
  
  describe('ArrayHasElementPipe', () => {
  
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
          ArrayHasElement
        ]
      });
  
      /** Testbed Onverriding of Components */
      TestBed.overrideComponent(TestComponent, {
        set: {
          template: `
          <div>Sample Template</div>
          <div>
            <span #testElement1 *ngIf="textValue1 | mcsArrayHasElement"></span>
            <span #testElement2 *ngIf="textValue2 | mcsArrayHasElement"></span>
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
      it(`should return value for an array that has value`, () => {
        expect(component.testElement1).toBeDefined();
      });
  
      it(`should return undefined element value for an empty array`, () => {
        expect(component.testElement2).toBeUndefined();
      });
    });
  });
  