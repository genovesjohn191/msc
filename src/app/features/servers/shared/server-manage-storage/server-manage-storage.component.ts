import {
  Component,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  CoreValidators,
  McsTextContentProvider,
  McsUnitType
} from '../../../../core';
import {
  ServerManageStorage,
  ServerInputManageType,
  ServerStorage
} from '../../models';
import {
  refreshView,
  convertToGb,
  convertToMb,
  replacePlaceholder,
  appendUnitSuffix,
  isFormControlValid,
  isNullOrEmpty,
  coerceNumber,
  unsubscribeSafely
} from '../../../../utilities';
import {
  FormGroup,
  FormControl
} from '@angular/forms';

import { McsStorage } from '../mcs-storage.interface';

@Component({
  selector: 'mcs-server-manage-storage',
  styleUrls: ['./server-manage-storage.component.scss'],
  templateUrl: './server-manage-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
  }
})

export class ServerManageStorageComponent implements OnInit, OnChanges, OnDestroy, McsStorage {
  // Form groups and controls
  public fgServerStorage: FormGroup;
  public fcServerStorageCustom: FormControl;
  public formControlSubscription: any;

  // Others
  public inputManageTypeEnum = ServerInputManageType;
  public textContent: any;
  public invalidCustomStorageMessage: string;

  public selectedStorageProfile: ServerStorage;

  @Output()
  public storageChanged: EventEmitter<ServerManageStorage>;

  @Input()
  public storageProfileList: ServerStorage[];

  @Input()
  public get minimumMB(): number { return this._minimumMB; }
  public set minimumMB(value: number) { this._minimumMB = coerceNumber(value); }
  private _minimumMB: number;

  @Input()
  public get maximumMB(): number { return this._maximumMB; }
  public set maximumMB(value: number) { this._maximumMB = coerceNumber(value); }
  private _maximumMB: number;

  @Input()
  public get step(): number { return this._step; }
  public set step(value: number) { this._step = coerceNumber(value); }
  private _step: number;

  @Input()
  public get minValueMB(): number { return this._minValueMB; }
  public set minValueMB(value: number) { this._minValueMB = coerceNumber(value); }
  private _minValueMB: number;

  /**
   * Input management type if it is Slider or Custom
   */
  private _inputManageType: ServerInputManageType;
  public get inputManageType(): ServerInputManageType {
    return this._inputManageType;
  }
  public set inputManageType(value: ServerInputManageType) {
    if (this._inputManageType !== value) {
      this._inputManageType = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Current storage value that updates real time
   */
  private _storageValue: number;
  public get storageValue(): number {
    return this._storageValue;
  }
  public set storageValue(value: number) {
    if (this._storageValue !== value) {
      this._storageValue = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public get minimumGB(): number {
    return Math.floor(convertToGb(this.minimumMB));
  }

  public get maximumGB(): number {
    return Math.floor(convertToGb(this.maximumMB));
  }

  public get currentMemory(): string {
    return appendUnitSuffix(this.storageValue, McsUnitType.Gigabyte);
  }

  public get remainingMemory(): string {
    return replacePlaceholder(this.textContent.sliderRemainingText, ['storage', 'unit'],
      [`${this.maximumGB - this.storageValue}`, this.textContent.unit]);
  }

  public get availableMemory(): string {
    return replacePlaceholder(this.textContent.sliderAvailableText, ['storage', 'unit'],
      [`${this.maximumGB}`, this.textContent.unit]);
  }

  public get hasAvailableStorageSpace(): boolean {
    return (this.maximumGB - this.minimumGB) > 0;
  }

  public get minValueGB(): number {
    return convertToGb(this.minValueMB);
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.storageValue = 0;
    this.minimumMB = 0;
    this.inputManageType = ServerInputManageType.Slider;
    this.storageChanged = new EventEmitter<ServerManageStorage>();
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.shared.storageScale;

    // Register form group for custom storage
    this._registerFormGroup();
    this._initializeValues();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let maximumMBChanges = changes['maximumMB'];
    if (maximumMBChanges) {
      this._setStorageValue(this.storageValue);
      this._setCustomControlValidator();
    }
  }

  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    if (!this.hasAvailableStorageSpace) { return; }
    refreshView(() => {
      this.inputManageType = inputManageType;
      this._notifyStorageChanged();
    });
  }

  public onCustomStorageChanged(inputValue: number) {
    this._setStorageValue(inputValue);
    this._setCustomControlValidator();
    this._notifyStorageChanged();
  }

  public onStorageChanged(value: number) {
    this._setStorageValue(value);
    this._notifyStorageChanged();
  }

  public onStorageProfileChanged(): void {
    this._setCustomControlValidator();
    this._notifyStorageChanged();
  }

  public isControlValid(control: FormControl): boolean {
    return isFormControlValid(control);
  }

  public completed(): void {
    this.fcServerStorageCustom.reset();
    this.onChangeInputManageType(ServerInputManageType.Slider);
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.formControlSubscription);
  }

  public get storageAvailableText(): string {
    return replacePlaceholder(
      this.textContent.errors.storageAvailable,
      'available_storage',
      appendUnitSuffix(this.maximumGB, McsUnitType.Gigabyte)
    );
  }

  public get storageMinValueText(): string {
    return replacePlaceholder(
      this.textContent.errors.storageMin,
      'min_value',
      appendUnitSuffix(this.minValueGB, McsUnitType.Gigabyte)
    );
  }

  /**
   * Initializes the values of storage profiles and contents
   */
  private _initializeValues(): void {
    if (!isNullOrEmpty(this.storageProfileList)) {
      this.selectedStorageProfile = this.storageProfileList[0];
    }

    if (isNullOrEmpty(this.minValueMB)) {
      this.minValueMB = this.minimumMB;
    }

    this.onStorageProfileChanged();
    this.storageValue = this.minimumGB;
    this.fcServerStorageCustom.setValue(this.minimumGB);
  }

  /**
   * This will set the storage value according not
   * exceeding the maximum value
   * @param currentValue Current value to set the storage
   */
  private _setStorageValue(currentValue: number) {
    this.storageValue = Math.min(currentValue, convertToGb(this.maximumMB));
  }

  /**
   * Register form group elements for custom type
   */
  private _registerFormGroup(): void {
    // Create custom storage control and register the listener
    this.fcServerStorageCustom = new FormControl('', [CoreValidators.required]);
    this.formControlSubscription = this.fcServerStorageCustom.valueChanges
      .subscribe(this.onCustomStorageChanged.bind(this));

    // Bind server storage form control to the main form
    this.fgServerStorage = new FormGroup({
      formControlServerStorageCustom: this.fcServerStorageCustom
    });
  }

  /**
   * Dynamically set the custom validator whenever
   * the maximum value is changed
   */
  private _setCustomControlValidator(): void {
    if (!this.fcServerStorageCustom) { return; }

    this.fcServerStorageCustom.setValidators([
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.min(this.minValueGB),
      CoreValidators.custom(
        this._customStorageValidator.bind(this),
        'storageAvailable'
      )
    ]);
  }

  /**
   * The maximum value custom validator
   * @param inputValue Input value to check
   */
  private _customStorageValidator(inputValue: any): boolean {
    return inputValue <= this.maximumGB;
  }

  /**
   * Event that emits whenever the storage data is changed
   */
  private _notifyStorageChanged() {
    let serverStorage = new ServerManageStorage();
    if (!isNullOrEmpty(this.selectedStorageProfile)) {
      serverStorage.storageProfile = this.selectedStorageProfile.name;
    }

    refreshView(() => {
      // Set model data based on management type
      switch (this.inputManageType) {
        case ServerInputManageType.Custom:
          serverStorage.storageMB = convertToMb(this.storageValue);
          serverStorage.valid = this.fcServerStorageCustom.valid;
          break;

        case ServerInputManageType.Slider:
        default:
          serverStorage.storageMB = convertToMb(this.storageValue);
          serverStorage.valid = true;
          break;
      }
      this.storageChanged.next(serverStorage);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
