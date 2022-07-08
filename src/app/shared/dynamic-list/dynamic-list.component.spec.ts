import { CommonModule } from '@angular/common';
import {
  Component,
  DebugElement,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  FormsModule,
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CoreValidators } from '@app/core';
import { CoreTestingModule } from '@app/core/testing';

import { DynamicListComponent } from './dynamic-list.component';
import { DynamicListModule } from './dynamic-list.module';

@Component({
  selector: 'mcs-test-dynamic-list',
  template: ``
})
export class TestDynamicListComponent implements OnInit {
  @ViewChild('testDynamicListHappyPath')
  public dynamicListHappyPath: DynamicListComponent;

  @ViewChild('testDynamicListValidation')
  public dynamicListValidation: DynamicListComponent;

  public testFG: FormGroup<any>;
  public testDynamicListHappyPathFc: FormControl<any>;
  public testDynamicListValidationFc: FormControl<any>;


  public ngOnInit(): void {
    this.testDynamicListHappyPathFc = new FormControl<any>([], []);
    this.testDynamicListValidationFc = new FormControl<any>([], [CoreValidators.requiredArray, CoreValidators.rangeArray(1, 2)]);

    this.testFG = new FormGroup<any>({
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

  beforeEach(waitForAsync(() => {
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
