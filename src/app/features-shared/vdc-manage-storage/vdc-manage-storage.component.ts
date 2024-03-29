import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  IMcsDataChange,
  CoreValidators
} from '@app/core';
import {
  animateFactory,
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { VdcManageStorage } from './vdc-manage-storage';
import { TranslateService } from '@ngx-translate/core';

const DEFAULT_MAXIMUM = 1024 * 32;
const DEFAULT_MINIMUM = 0;
const DEFAULT_STEP = 1;
const SLIDER_STEP = 50;

@Component({
  selector: 'mcs-vdc-manage-storage',
  templateUrl: './vdc-manage-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ]
})

export class VdcManageStorageComponent
  implements IMcsDataChange<VdcManageStorage>, AfterViewInit, OnDestroy {

  // Forms Group
  public fgInputSlider: FormGroup<any>;
  public fcInput: FormControl<any>;
  public sliderModel: number;

  @Output()
  public dataChange = new EventEmitter<VdcManageStorage>();

  @Input()
  public maxValue: number;

  @Input()
  public get initialValue(): number {
    return this._initialValue;
  }
  public set initialValue(value: number) {
    this._initialValue = isNullOrEmpty(value) ? DEFAULT_MINIMUM : value;
  }
  private _initialValue: number;

  public get roundedOffInitialValue(): number {
    return Math.round(this.initialValue * 100) / 100;
  }

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();

  public constructor(
    private _translateService: TranslateService,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {
    this._registerFormGroup();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._subscribeToFormTouchedState();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get unit(): string { return this._translateService.instant('serverShared.manageStorage.unit'); }

  public get validStep(): number { return DEFAULT_STEP; }

  public get sliderStep(): number { return SLIDER_STEP; }

  public get minimumDisplayed(): number {
    let storageExcess = this.initialValue % this.validStep;
    let displayedStorage = this.initialValue - storageExcess;
    return displayedStorage >= 0 ? displayedStorage : DEFAULT_MINIMUM;
  }

  public get minimumUsable(): number {
    let usableStorage = Math.ceil(this.initialValue / this.validStep) * this.validStep;
    return usableStorage > 0 ? usableStorage : DEFAULT_MINIMUM;
  }

  public get maximumUsable(): number {
    return !isNullOrEmpty(this.maxValue) ? this.maxValue : DEFAULT_MAXIMUM;
  }

  /**
   * Returns the form group
   */
  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Returns true when the form group is valid
   */
  public isValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  /**
   * Event that emits when an input has been changed
   */
  public notifyDataChange() {
    // Emit changes
    let hasChanged = this.sliderModel !== this.initialValue;
    let output = new VdcManageStorage();

    output.value = this.sliderModel;
    output.hasChanged = hasChanged;
    output.valid = this.isValid();

    this.dataChange.emit(output);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event listener whenever the slider changes its value
   */
  public onSliderChanged(value: any) {
    this.fcInput.setValue(value);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Register form group elements
   */
  private _registerFormGroup(): void {
    this.fcInput = new FormControl<any>(this.roundedOffInitialValue, [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.minimumUsable)(control),
      (control) => CoreValidators.max(this.maximumUsable)(control),
      (control) => CoreValidators.custom(this._storageStepIsValid.bind(this), 'step')(control)
    ]);

    this.fcInput.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        this.sliderModel = this.fcInput.value;
        this.notifyDataChange();
      });

    this.fgInputSlider = this._formBuilder.group({
      fcInput: this.fcInput
    });
  }

  /**
   * Subscribe to touched state of the form group
   */
  private _subscribeToFormTouchedState(): void {
    this._formGroup.touchedStateChanges().pipe(
      takeUntil(this._destroySubject)
    ).subscribe(() => this._changeDetectorRef.markForCheck());
  }

  /**
   * Returns true if the value is a valid Storage step
   * @param inputValue Value to be checked
   */
  private _storageStepIsValid(inputValue: any): boolean {
    return inputValue % this.validStep === 0;
  }
}
