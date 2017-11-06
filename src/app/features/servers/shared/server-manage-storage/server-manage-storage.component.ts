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
  McsTextContentProvider
} from '../../../../core';
import {
  ServerManageStorage,
  ServerInputManageType
} from '../../models';
import {
  refreshView,
  convertToGb,
  convertToMb,
  replacePlaceholder,
  appendUnitSuffix,
  isFormControlValid,
  isNullOrEmpty
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
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerManageStorageComponent implements OnInit, OnChanges, OnDestroy, McsStorage {
  @Input()
  public memoryMB: number;

  @Input()
  public availableMemoryMB: number;

  @Input()
  public minimumMB: number;

  @Input()
  public storageProfileList: any;

  @Input()
  public storageSliderValues: number[];

  @Input()
  public disabled: boolean;

  @Output()
  public storageChanged: EventEmitter<ServerManageStorage>;

  public inputManageTypeEnum = ServerInputManageType;
  public storageTextContent: any;

  public formGroupServerStorage: FormGroup;
  public formControlServerStorageCustom: FormControl;
  public formControlSubscription: any;

  public invalidCustomStorageMessage: string;

  public get memoryGB(): number {
    return Math.floor(convertToGb(this.memoryMB));
  }

  public get availableMemoryGB(): number {
    return Math.floor(convertToGb(this.availableMemoryMB));
  }

  public get minimumGB(): number {
    return Math.floor(convertToGb(this.minimumMB));
  }

  public get maximumMemoryGB(): number {
    return this.memoryGB + this.availableMemoryGB;
  }

  public get currentMemory(): string {
    return appendUnitSuffix(this.storageSliderValues[this.storageSliderValue], 'gigabyte');
  }

  public get remainingMemory(): string {
    return appendUnitSuffix(
      this.storageSliderValues[this.maximum] - this.storageSliderValues[this.storageSliderValue],
      'gigabyte'
    );
  }

  public get hasAvailableStorageSpace(): boolean {
    return this.availableMemoryGB > 0;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

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

  private _storageProfileValue: string;
  public get storageProfileValue(): string {
    return this._storageProfileValue;
  }
  public set storageProfileValue(value: string) {
    if (this._storageProfileValue !== value) {
      this._storageProfileValue = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _storageSliderValue: number;
  public get storageSliderValue(): number {
    return this._storageSliderValue;
  }
  public set storageSliderValue(value: number) {
    if (this._storageSliderValue !== value) {
      this._storageSliderValue = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _customStorageValue: number;
  public get customStorageValue(): number {
    return this._customStorageValue;
  }
  public set customStorageValue(value: number) {
    if (this._customStorageValue !== value) {
      this._customStorageValue = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _minimum: number;
  public get minimum(): number {
    return this._minimum;
  }
  public set minimum(value: number) {
    if (this._minimum !== value) {
      this._minimum = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _maximum: number;
  public get maximum(): number {
    return this._maximum;
  }
  public set maximum(value: number) {
    if (this._maximum !== value) {
      this._maximum = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.minimumMB = 1;
    this.storageProfileValue = '';
    this.storageSliderValues = new Array();
    this.storageSliderValue = 0;
    this.minimum = 0;
    this.maximum = 0;
    this.inputManageType = ServerInputManageType.Slider;
    this.storageChanged = new EventEmitter<ServerManageStorage>();
    this.disabled = false;
  }

  public ngOnInit() {
    this.storageTextContent = this._textProvider.content.servers.server.storage;

    // Register form group for custom storage
    this._registerFormGroup();

    this._initializeValues();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let availableMemoryMBChanges = changes['availableMemoryMB'];
    if (availableMemoryMBChanges) {
      this.inputManageType = ServerInputManageType.Slider;
      this.storageSliderValue = 0;
      this.maximum = this.storageSliderValues.length - 1;
      this._setCustomControlValidator();
    }
  }

  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    if (this.disabled) { return; }
    refreshView(() => {
      this.inputManageType = inputManageType;
      this._notifyStorageChanged();
    });
  }

  public onCustomStorageChanged(inputValue: number) {
    this.customStorageValue = inputValue;
    this._setCustomControlValidator();
    this._notifyStorageChanged();
  }

  public onStorageChanged(value: number) {
    this.storageSliderValue = value;
    this._notifyStorageChanged();
  }

  public onStorageProfileChanged(value: any): void {
    this.storageProfileValue = value;
    this.storageSliderValue = 0;
    this.customStorageValue = 0;
    this._setCustomControlValidator();
    this._notifyStorageChanged();
  }

  public isControlValid(control: FormControl): boolean {
    return isFormControlValid(control);
  }

  public completed(): void {
    this.formControlServerStorageCustom.reset();
    this.storageSliderValue = 0;
    this.customStorageValue = 0;
    this.onChangeInputManageType(ServerInputManageType.Slider);
  }

  public ngOnDestroy() {
    if (this.formControlSubscription) {
      this.formControlSubscription.unsubscribe();
    }
  }

  private _initializeValues(): void {
    if (!isNullOrEmpty(this.storageProfileList)) {
      this.onStorageProfileChanged(this.storageProfileList[0].value);
    }
    this.onCustomStorageChanged(this.memoryGB);
  }

  private _registerFormGroup(): void {
    // Create custom storage control and register the listener
    this.formControlServerStorageCustom = new FormControl(
      { disabled: this.disabled },
      [CoreValidators.required]
    );
    this.formControlSubscription = this.formControlServerStorageCustom.valueChanges
      .subscribe(this.onCustomStorageChanged.bind(this));

    // Bind server storage form control to the main form
    this.formGroupServerStorage = new FormGroup({
      formControlServerStorageCustom: this.formControlServerStorageCustom
    });
  }

  private _setCustomControlValidator(): void {
    if (!this.formControlServerStorageCustom) { return; }

    let validationMessage = replacePlaceholder(
      this.storageTextContent.validationError,
      'available_storage',
      appendUnitSuffix(this.maximumMemoryGB, 'gigabyte')
    );

    this.formControlServerStorageCustom.setValidators([
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.min(this.minimumGB),
      CoreValidators.custom(
        this._customStorageValidator.bind(this),
        validationMessage
      )
    ]);
  }

  private _customStorageValidator(inputValue: any): boolean {
    return inputValue <= this.maximumMemoryGB;
  }

  private _notifyStorageChanged() {
    let serverStorage = new ServerManageStorage();
    serverStorage.storageProfile = this.storageProfileValue;

    refreshView(() => {
      // Set model data based on management type
      switch (this.inputManageType) {
        case ServerInputManageType.Custom:
          serverStorage.storageMB = convertToMb(this.customStorageValue);
          serverStorage.valid = this.formControlServerStorageCustom.valid;
          break;

        case ServerInputManageType.Slider:
        default:
          if (!isNullOrEmpty(this.storageSliderValues)) {
            serverStorage.storageMB = convertToMb(
              this.storageSliderValues[this.storageSliderValue]
            );
          } else {
            serverStorage.storageMB = 0;
          }
          serverStorage.valid = true;
          break;
      }

      this.storageChanged.next(serverStorage);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
