import {
  Component,
  Input,
  Output,
  OnInit,
  OnChanges,
  OnDestroy,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  TemplateRef,
  SimpleChanges,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  ValidatorFn
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CoreValidators,
  IMcsFormGroup,
  IMcsDataChange
} from '@app/core';
import {
  convertMbToGb,
  convertGbToMb,
  isNullOrEmpty,
  coerceNumber,
  animateFactory,
  unsubscribeSafely,
  getSafeProperty,
  isNullOrUndefined
} from '@app/utilities';
import {
  InputManageType,
  McsResourceStorage,
  McsServerStorageDevice
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { ServerManageStorage } from './server-manage-storage';

// Constants
const DEFAULT_STORAGE_STEPS = 10;
const DEFAULT_STORAGE_STEPS_MB = 1024;

@Component({
  selector: 'mcs-server-manage-storage',
  templateUrl: './server-manage-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ]
})

export class ServerManageStorageComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy, IMcsFormGroup, IMcsDataChange<ServerManageStorage> {

  public inputManageType: InputManageType;
  public storageValue: number;

  // Forms
  public fgScale: FormGroup;
  public fcSelectStorages: FormControl;
  public fcCustomStorage: FormControl;

  @Output()
  public dataChange = new EventEmitter<ServerManageStorage>();

  @Input()
  public detailsTemplate: TemplateRef<any>;

  @Input()
  public storages: McsResourceStorage[];

  @Input()
  public targetDisk: McsServerStorageDevice;

  @Input()
  public get minValueGB(): number {
    return this._computeMinValue();
  }
  public set minValueGB(value: number) { this._minValueGB = coerceNumber(value); }
  private _minValueGB: number = 0;

  @Input()
  public get deductValueGB(): number { return this._deductValueGB; }
  public set deductValueGB(value: number) { this._deductValueGB = coerceNumber(value); }
  private _deductValueGB: number = 0;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _storageOutput = new ServerManageStorage();
  private _formControlsMap = new Map<InputManageType, () => void>();

  /**
   * Returns the available memory of the storage based on actual memory available
   * and the deduction value provided by implementation
   */
  public get availableMemory(): number {
    let storageProfileAvailableMemoryMB = getSafeProperty(this.selectedStorage, (obj) => obj.availableMB, 0);
    let diskSizeMB = getSafeProperty(this.targetDisk, (obj) => obj.sizeMB, 0);
    let totalAvailableMemory = Math.max((storageProfileAvailableMemoryMB + diskSizeMB) - convertGbToMb(this.deductValueGB), 0);
    let stepExcessMemory = totalAvailableMemory % DEFAULT_STORAGE_STEPS_MB;

    return convertMbToGb(totalAvailableMemory - stepExcessMemory);
  }

  /**
   * Returns the selected storage based on the forms
   */
  public get selectedStorage(): McsResourceStorage {
    return getSafeProperty(this.fcSelectStorages, (obj) => obj.value);
  }

  /**
   * Returns true when storage has available memory based on minimum value required
   */
  public get hasAvailableMemory(): boolean {
    return (this.availableMemory - this.minValueGB) > 0;
  }

  public constructor(
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._createFormControlsMap();
  }

  public ngOnInit() {
    this.reset();
    this._registerFormGroup();
    this._setSelectedStorage();
    this._setCustomStorageValue();
    this.notifyDataChange();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let storagesChange = changes['storages'];
    if (!isNullOrEmpty(storagesChange)) {
      this._setSelectedStorage();
    }
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._subscribeToFormTouchedState();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
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
    return getSafeProperty(this.fgScale, (obj) => obj.valid);
  }

  /**
   * Resets the form and change the input to default type
   */
  public reset(): void {
    this._resetFormGroup();
    this.storageValue = this.minValueGB;
    this.inputManageType = InputManageType.Auto;
  }

  /**
   * Returns the server input managetype enumeration instance
   */
  public get inputManageTypeEnum(): any {
    return InputManageType;
  }

  /**
   * Event that emits when the input manage type has been changed
   */
  public onChangeInputManageType(inputManageType: InputManageType) {
    this.inputManageType = inputManageType;
    this.minValueGB = this._computeMinValue();
    this._registerFormControlsByInputType();
    this.notifyDataChange();
  }

  /**
   * Event that emits when the slider value has been changed
   * @param sliderValue Slider value to be emitted as storage value
   */
  public onSliderChanged(sliderValue: number): void {
    this.storageValue = sliderValue;
    this.notifyDataChange();
  }

  /**
   * Event that emits when an input has been changed
   */
  public notifyDataChange() {
    // Set model data based on management type
    switch (this.inputManageType) {
      case InputManageType.Custom:
        this._storageOutput.storage = this.selectedStorage;
        this._storageOutput.sizeMB = convertGbToMb(
          coerceNumber(this.fcCustomStorage.value, this.minValueGB)
        );
        this._storageOutput.valid = this.fcCustomStorage.valid;
        break;

      case InputManageType.Auto:
      default:
        this._storageOutput.storage = this.selectedStorage;
        this._storageOutput.sizeMB = convertGbToMb(this.storageValue);
        this._storageOutput.valid = this.hasAvailableMemory;
        break;
    }
    this._setStorageHasChangedFlag();

    // Emit changes
    this.dataChange.emit(this._storageOutput);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Returns the computed storage min value in GB based on input type
   */
  private _computeMinValue(): number {
    let isNewServer: boolean = this._isTargetDiskUnvailable();
    let currentStorageSize: number = this._getCurrentStorageSize();
    let storageStepsFromValue = this._computeStorageStepsByStorageValue(currentStorageSize);
    let isExactByStep = this._isValueExactByStep(currentStorageSize);
    let computedMinValue: number;

    if (this.inputManageType === InputManageType.Custom) {
      computedMinValue = (isNewServer) ? this._minValueGB : currentStorageSize + 1;
    } else {
      if (isNewServer) { currentStorageSize += this._minValueGB; }
      computedMinValue = isExactByStep ? currentStorageSize : (storageStepsFromValue + 1) * DEFAULT_STORAGE_STEPS;
    }

    return computedMinValue;
  }

  /**
   * Checks if target disk prop is available, could be used for differentiating new disk vs disk expansion
   */
  private _isTargetDiskUnvailable(): boolean {
    return isNullOrUndefined(this.targetDisk);
  }

  /**
   * Returns the current storage value in GB
   */
  private _getCurrentStorageSize(): number {
    return convertMbToGb(getSafeProperty(this.targetDisk, (obj) => obj.sizeMB, 0));
  }

  /**
   * Returns the scaler steps based on the default storage steps configured and the storage value
   * @param storageValue: current disk storage value
   */
  private _computeStorageStepsByStorageValue(storageValue: number): number {
    return Math.floor(storageValue / DEFAULT_STORAGE_STEPS);
  }

  /**
   * Checks whether the current storage value has correct ratio based from default storage steps
   * @param storageValue: current disk storage value
   */
  private _isValueExactByStep(storageValue: number): boolean {
    return ((storageValue % DEFAULT_STORAGE_STEPS) === 0);
  }
  /**
   * Sets the selected storage if no storage selected
   */
  private _setSelectedStorage(): void {
    let noStorages = isNullOrEmpty(this.storages);
    if (noStorages) { return; }

      let storage = this.storages;
      let storageProfileFound = this._isTargetDiskUnvailable() ?
        storage.find(storage => storage.isDefault) :
        storage.find(storage => (storage.name === this.targetDisk.storageProfile));

      let fcStorageProfileValue = storageProfileFound ? storageProfileFound : null;

      if (!isNullOrEmpty(this.fcSelectStorages)) {
        this.fcSelectStorages.setValue(fcStorageProfileValue);

        let availableMemoryExceeded = !this.hasAvailableMemory;
        if (availableMemoryExceeded) { this.fcSelectStorages.markAsTouched(); }
      }
  }

  /**
   * Sets the custom storage value if not yet provided
   */
  private _setCustomStorageValue(): void {
    let computedCustomStorageValue: number;
    if (this._isTargetDiskUnvailable()) {
      computedCustomStorageValue = this.minValueGB;
    }  else {
      let currentStorageSize = this._getCurrentStorageSize();
      computedCustomStorageValue = currentStorageSize;
    }
    this.fcCustomStorage.setValue(computedCustomStorageValue);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Resets the form group fields
   */
  private _resetFormGroup(): void {
    if (isNullOrEmpty(this.fgScale)) { return; }
    this.fgScale.reset();
    this.fcCustomStorage.reset();
  }

  /**
   * Creates the form controls table map
   */
  private _createFormControlsMap(): void {
    this._formControlsMap.set(InputManageType.Auto,
      this._registerAutoFormControls.bind(this));

    this._formControlsMap.set(InputManageType.Custom,
      this._registerCustomFormControls.bind(this));
  }

  /**
   * Register form group elements for custom type
   */
  private _registerFormGroup(): void {
    // Register form control for custom storage
    this.fcCustomStorage = new FormControl('', this._setValidatorFunctionsForCustomInput());
    this.fcCustomStorage.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());

    // Register form control for selection of storage
    this.fcSelectStorages = new FormControl('', this._setValidatorFunctionsForAutoScaler());
    this.fcSelectStorages.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());

    // Create form group and bind the form controls
    this.fgScale = this._formBuilder.group({
      fcSelectStorages: this.fcSelectStorages
    });
    this._registerFormControlsByInputType();
  }

  /**
   * Registers form controls based on the associated settings
   */
  private _registerFormControlsByInputType(): void {
    if (isNullOrUndefined(this.inputManageType)) { return; }

    let formControlsFunc = this._formControlsMap.get(this.inputManageType);
    if (isNullOrEmpty(formControlsFunc)) {
      throw new Error(`Invalid input manage type ${this.inputManageType}`);
    }
    formControlsFunc.call(this);
  }

  /**
   * Registers auto settings associated form controls
   */
  private _registerAutoFormControls(): void {
    this.fgScale.removeControl('fcCustomStorage');
    this.fcSelectStorages.setValidators(this._setValidatorFunctionsForAutoScaler());
    this.fcSelectStorages.updateValueAndValidity();
  }

  /**
   * Registers custom settings associated form controls
   */
  private _registerCustomFormControls(): void {
    this.fcCustomStorage.setValidators(this._setValidatorFunctionsForCustomInput());
    this.fgScale.setControl('fcCustomStorage', this.fcCustomStorage);
    this.fcCustomStorage.updateValueAndValidity();
  }

  /**
   * Returns the custom validator associated for custom input control
   */
  private _setValidatorFunctionsForCustomInput(): ValidatorFn[] {
    return [
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.min(this.minValueGB),
      CoreValidators.custom(
        this._customStorageValidator.bind(this),
        'storageAvailable'
      )
    ];
  }

  /**
   * Returns the custom validator associated for auto scaler control
   */
  private _setValidatorFunctionsForAutoScaler(): ValidatorFn[] {
    return [
      CoreValidators.custom(
        this._maxStorageChecking.bind(this),
        'storageAvailable'
      )
    ];
  }
  /**
   * Return true when the input value is valid
   * @param inputValue Input value to be checked
   */
  private _customStorageValidator(inputValue: any) {
    return inputValue <= this.availableMemory;
  }

  /**
   * Returns true when the selected storage has available storage
   * @param _storage Storage to be checked
   */
  private _maxStorageChecking(_storage: McsResourceStorage) {
    return this.hasAvailableMemory;
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
   * Sets the storage has changed flag based on target nic
   */
  private _setStorageHasChangedFlag(): void {
    if (isNullOrEmpty(this.targetDisk)) { return; }
    this._storageOutput.hasChanged = this._storageOutput.valid &&
      this._storageOutput.sizeMB > this.targetDisk.sizeMB;
  }
}
