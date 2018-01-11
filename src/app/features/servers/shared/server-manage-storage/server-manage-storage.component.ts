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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
  }
})

export class ServerManageStorageComponent implements OnInit, OnChanges, OnDestroy, McsStorage {
  @Input()
  public minimumMB: number;

  @Input()
  public maximumMB: number;

  @Input()
  public step: number;

  @Input()
  public minValueMB: number;

  @Input()
  public storageProfileList: any;

  @Input()
  public disabled: boolean;

  @Output()
  public storageChanged: EventEmitter<ServerManageStorage>;

  public inputManageTypeEnum = ServerInputManageType;
  public textContent: any;

  public formGroupServerStorage: FormGroup;
  public fcServerStorageCustom: FormControl;
  public formControlSubscription: any;

  public invalidCustomStorageMessage: string;

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
    return appendUnitSuffix(this.storageValue, 'gigabyte');
  }

  public get remainingMemory(): string {
    return appendUnitSuffix(this.maximumGB - this.storageValue, 'gigabyte');
  }

  public get hasAvailableStorageSpace(): boolean {
    return (this.maximumMB - this.minimumMB) > 0;
  }

  public get minValueGB(): number {
    return convertToGb(this.minValueMB);
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

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.storageProfileValue = '';
    this.storageValue = 0;
    this.minimumMB = 0;
    this.inputManageType = ServerInputManageType.Slider;
    this.storageChanged = new EventEmitter<ServerManageStorage>();
    this.disabled = false;
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
      this.inputManageType = ServerInputManageType.Slider;
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
    this.storageValue = inputValue;
    this._setCustomControlValidator();
    this._notifyStorageChanged();
  }

  public onStorageChanged(value: number) {
    this.storageValue = value;
    this._notifyStorageChanged();
  }

  public onStorageProfileChanged(value: any): void {
    this.storageProfileValue = value;
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
    if (this.formControlSubscription) {
      this.formControlSubscription.unsubscribe();
    }
  }

  public get storageAvailableText(): string {
    return replacePlaceholder(
      this.textContent.errors.storageAvailable,
      'available_storage',
      appendUnitSuffix(this.maximumGB, 'gigabyte')
    );
  }

  public get storageMinValueText(): string {
    return replacePlaceholder(
      this.textContent.errors.storageMin,
      'min_value',
      appendUnitSuffix(this.minValueGB, 'gigabyte')
    );
  }

  private _initializeValues(): void {
    if (!isNullOrEmpty(this.storageProfileList)) {
      this.storageProfileValue = this.storageProfileList[0].value;
    }

    if (isNullOrEmpty(this.minValueMB)) {
      this.minValueMB = this.minimumMB;
    }

    this.onStorageProfileChanged(this.storageProfileValue);
    this.storageValue = this.minimumGB;
  }

  private _registerFormGroup(): void {
    // Create custom storage control and register the listener
    this.fcServerStorageCustom = new FormControl(
      { disabled: this.disabled },
      [CoreValidators.required]
    );
    this.formControlSubscription = this.fcServerStorageCustom.valueChanges
      .subscribe(this.onCustomStorageChanged.bind(this));

    // Bind server storage form control to the main form
    this.formGroupServerStorage = new FormGroup({
      formControlServerStorageCustom: this.fcServerStorageCustom
    });
  }

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

  private _customStorageValidator(inputValue: any): boolean {
    return inputValue <= this.maximumGB;
  }

  private _notifyStorageChanged() {
    let serverStorage = new ServerManageStorage();
    serverStorage.storageProfile = this.storageProfileValue;

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
          serverStorage.valid = serverStorage.storageMB > this.minimumMB;
          break;
      }

      this.storageChanged.next(serverStorage);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
