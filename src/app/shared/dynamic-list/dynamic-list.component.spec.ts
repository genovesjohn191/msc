import {
  Component,
  ViewChild,
  DebugElement,
  ElementRef,
  OnInit
} from '@angular/core';
import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { CoreTestingModule } from '@app/core/testing';
import { DynamicListComponent } from './dynamic-list.component';
import { DynamicListModule } from './dynamic-list.module';
import { CoreValidators } from '@app/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mcs-test-dynamic-list',
  template: ``
})
export class TestDynamicListComponent implements OnInit {
  @ViewChild('testDynamicListHappyPath', { static: false })
  public dynamicListHappyPath: DynamicListComponent;

  @ViewChild('testDynamicListValidation', { static: false })
  public dynamicListValidation: DynamicListComponent;

  public testFG: FormGroup;
  public testDynamicListHappyPathFc: FormControl;
  public testDynamicListValidationFc: FormControl;


  public ngOnInit(): void {
    this.testDynamicListHappyPathFc = new FormControl([], []);
    this.testDynamicListValidationFc = new FormControl([], [CoreValidators.requiredArray, CoreValidators.rangeArray(1, 2)]);

    this.testFG = new FormGroup({
      testDynamicListHappyPathFc: this.testDynamicListHappyPathFc,
      testDynamicListValidationFc: this.testDynamicListValidationFc
    });
  }
}

describe('DynamicListComponent', () => {

  /** Stub Services/Components */
  let component: TestDynamicListComponent;
  let fixtureInstance: ComponentFixture<TestDynamicListComponent>;
  let debugElement: DebugElement;
  let inputFcHappyPath: ElementRef;
  let addIconElementHappyPath: ElementRef;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestDynamicListComponent
      ],
      imports: [
        CoreTestingModule,
        DynamicListModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestDynamicListComponent, {
      set: {
        template: `
        <form [formGroup]="testFG">

          <mcs-dynamic-list #testDynamicListHappyPath id="testDynamicListHappyPathId" [formControl]="testDynamicListHappyPathFc">
          </mcs-dynamic-list>
          <div *ngIf="testDynamicListHappyPathFc?.errors" id="no-validation">
            {{testDynamicListHappyPathFc.errors | json}}
          </div>

          <mcs-dynamic-list #testDynamicListValidation id="testDynamicListValidationId" [formControl]="testDynamicListValidationFc">
          </mcs-dynamic-list>
          <div *ngIf="testDynamicListValidationFc?.errors?.requiredArray" id="required-array-validation">
            {{testDynamicListValidationFc.errors.requiredArray | json}}
          </div>
          <div *ngIf="testDynamicListValidationFc?.errors?.rangeArray" id="range-array-validation">
            {{testDynamicListValidationFc.errors.rangeArray | json}}
          </div>

        </form>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestDynamicListComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
      debugElement = fixtureInstance.debugElement;
      inputFcHappyPath = debugElement.query(By.css('#testDynamicListHappyPathId input[mcsInput]'));
      addIconElementHappyPath = debugElement.query(By.css('#testDynamicListHappyPathId input[mcsInput] + mcs-icon'));
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-dynamic-list element`, () => {
      let element = document.querySelector('mcs-dynamic-list');
      expect(element).not.toBe(null);
    });

    it(`should emit when an item is added to the list`, () => {
      spyOn(component.dynamicListHappyPath.listChange, 'emit');
      inputFcHappyPath.nativeElement.value = 'test';
      addIconElementHappyPath.nativeElement.click();
      expect(component.dynamicListHappyPath.listChange.emit).toHaveBeenCalled();
      expect(component.dynamicListHappyPath.listChange.emit).toHaveBeenCalledWith(['test']);
    });

    it(`should have no error since no validation is declared`, () => {
      let element = document.querySelector('#no-validation');
      expect(element).toBe(null);
    });

    it(`should have error when validation for required is triggered`, () => {
      let element = document.querySelector('#required-array-validation');
      expect(element).not.toBe(null);
    });

    it(`should have error when validation for range array is triggered`, () => {
      let element = document.querySelector('#range-array-validation');
      expect(element).not.toBe(null);
    });
  });
});
