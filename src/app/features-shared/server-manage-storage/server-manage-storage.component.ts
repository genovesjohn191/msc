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
  FormBuilder
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
  unsubscribeSubject,
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
    let exactMinValue = convertMbToGb(getSafeProperty(this.targetDisk, (obj) => obj.sizeMB, 0));
    exactMinValue += this._minValueGB;

    let dividedValue = Math.floor(exactMinValue / DEFAULT_STORAGE_STEPS);
    let isExactByStep = (exactMinValue % DEFAULT_STORAGE_STEPS) === 0;
    return isExactByStep ? exactMinValue : (dividedValue + 1) * DEFAULT_STORAGE_STEPS;
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
    let maxMemoryInGB = convertMbToGb(
      getSafeProperty(this.selectedStorage, (obj) => obj.availableMB, 0)
    );
    let usedMemoryInGB = convertMbToGb(
      getSafeProperty(this.targetDisk, (obj) => obj.sizeMB, 0)
    );
    return Math.max((maxMemoryInGB + usedMemoryInGB) - this.deductValueGB, 0);
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
    unsubscribeSubject(this._destroySubject);
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
   * Sets the selected storage if no storage selected
   */
  private _setSelectedStorage(): void {
    let noStorages = isNullOrEmpty(this.storages);
    if (noStorages) { return; }

    let targetStorageFound = this.storages.find((storage) =>
      storage.name === getSafeProperty(this.targetDisk, (obj) => obj.storageProfile));
    let targetStorageToSelect = isNullOrEmpty(targetStorageFound) ?
      this.storages[0] : targetStorageFound;

    if (!isNullOrEmpty(this.fcSelectStorages)) {
      this.fcSelectStorages.setValue(targetStorageToSelect);

      let availableMemoryExceeded = !this.hasAvailableMemory;
      if (availableMemoryExceeded) { this.fcSelectStorages.markAsTouched(); }
    }
  }

  /**
   * Sets the custom storage value if not yet provided
   */
  private _setCustomStorageValue(): void {
    this.fcCustomStorage.setValue(this.minValueGB);
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
    this.fcCustomStorage = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.min(this.minValueGB),
      CoreValidators.custom(
        this._customStorageValidator.bind(this),
        'storageAvailable'
      )
    ]);
    this.fcCustomStorage.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());

    // Register form control for selection of storage
    this.fcSelectStorages = new FormControl('', [
      CoreValidators.custom(
        this._maxStorageChecking.bind(this),
        'storageAvailable'
      )
    ]);
    this.fcSelectStorages.valueChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.notifyDataChange());

    // Create form group and bind the form controls
    this.fgScale = this._formBuilder.group([]);
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
  }

  /**
   * Registers custom settings associated form controls
   */
  private _registerCustomFormControls(): void {
    this.fgScale.setControl('fcCustomStorage', this.fcCustomStorage);
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
