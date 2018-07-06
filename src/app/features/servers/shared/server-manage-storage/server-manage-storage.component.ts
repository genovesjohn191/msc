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
  SimpleChanges
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { Subject } from 'rxjs';
import {
  takeUntil,
  startWith
} from 'rxjs/operators';
import {
  CoreValidators,
  McsTextContentProvider,
  McsUnitType
} from '../../../../core';
import { ResourceStorage } from '../../../resources';
import {
  ServerManageStorage,
  ServerInputManageType
} from '../../models';
import {
  convertMbToGb,
  convertGbToMb,
  replacePlaceholder,
  appendUnitSuffix,
  isNullOrEmpty,
  coerceNumber,
  animateFactory,
  unsubscribeSubject
} from '../../../../utilities';

@Component({
  selector: 'mcs-server-manage-storage',
  templateUrl: './server-manage-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'server-manage-storage-wrapper block block-items-medium',
  }
})

export class ServerManageStorageComponent implements OnInit, OnChanges, OnDestroy {
  public textContent: any;
  public inputManageType: ServerInputManageType;
  public storageValue: number;

  // Forms
  public fgServerStorage: FormGroup;
  public fcSelectStorages: FormControl;
  public fcCustomStorage: FormControl;

  @Output()
  public dataChange = new EventEmitter<ServerManageStorage>();

  @Output()
  public selectedStorageChange = new EventEmitter<ResourceStorage>();

  @Input()
  public detailsTemplate: TemplateRef<any>;

  @Input()
  public storages: ResourceStorage[];

  @Input()
  public get selectedStorage(): ResourceStorage { return this._selectedStorage; }
  public set selectedStorage(value: ResourceStorage) {
    if (this._selectedStorage !== value) {
      this._selectedStorage = value;
      this.selectedStorageChange.emit(this._selectedStorage);
      this.reset();
    }
  }
  private _selectedStorage: ResourceStorage;

  @Input()
  public get minValueGB(): number { return this._minValueGB; }
  public set minValueGB(value: number) { this._minValueGB = coerceNumber(value); }
  private _minValueGB: number = 0;

  @Input()
  public get addedValueGB(): number { return this._addedValueGB; }
  public set addedValueGB(value: number) { this._addedValueGB = coerceNumber(value); }
  private _addedValueGB: number = 0;

  @Input()
  public get deductValueGB(): number { return this._deductValueGB; }
  public set deductValueGB(value: number) { this._deductValueGB = coerceNumber(value); }
  private _deductValueGB: number = 0;

  @Input()
  public get customStorageValue(): number { return this._customStorageValue; }
  public set customStorageValue(value: number) {
    if (value !== this._customStorageValue) {
      this._customStorageValue = coerceNumber(value);
      this._notifyDataChanged();
    }
  }
  private _customStorageValue: number = 0;

  private _destroySubject = new Subject<void>();
  private _storageOutput = new ServerManageStorage();

  /**
   * Returns the available memory of the storage based on actual memory available
   * and the deduction value provided by implementation
   */
  public get availableMemory(): number {
    let memoryInGB = isNullOrEmpty(this.selectedStorage) ? 0 :
      convertMbToGb(this.selectedStorage.availableMB);
    return Math.max((memoryInGB + this.addedValueGB) - this.deductValueGB, 0);
  }

  /**
   * Returns true when storage has available memory based on minimum value required
   */
  public get hasAvailableMemory(): boolean {
    return (this.availableMemory - this.minValueGB) > 0;
  }

  /**
   * Returns the storage available text content
   */
  public get storageAvailableText(): string {
    return replacePlaceholder(
      this.textContent.errors.storageAvailable,
      'available_storage',
      appendUnitSuffix(this.availableMemory, McsUnitType.Gigabyte)
    );
  }

  /**
   * Returns the storage minimum value text content
   */
  public get storageMinValueText(): string {
    return replacePlaceholder(
      this.textContent.errors.storageMin,
      'min_value',
      appendUnitSuffix(this.minValueGB, McsUnitType.Gigabyte)
    );
  }

  public constructor(
    private _textProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.shared.manageStorage;
    this.reset();
    this._registerFormGroup();
    this._setSelectedStorage();
    this._setCustomStorageValue();
    this._notifyDataChanged();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let storagesChange = changes['storages'];
    if (!isNullOrEmpty(storagesChange)) {
      this.selectedStorage = undefined;
      this._setSelectedStorage();
      this._setCustomStorageValue();
    }
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Resets the form and change the input to default type
   */
  public reset(): void {
    this._resetFormGroup();
    this.storageValue = this.minValueGB;
    this.inputManageType = ServerInputManageType.Slider;
  }

  /**
   * Returns the server input managetype enumeration instance
   */
  public get inputManageTypeEnum(): any {
    return ServerInputManageType;
  }

  /**
   * Event that emits when the input manage type has been changed
   */
  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    this.inputManageType = inputManageType;
    this._notifyDataChanged();
  }

  /**
   * Event that emits when the slider value has been changed
   * @param sliderValue Slider value to be emitted as storage value
   */
  public onSliderChanged(sliderValue: number): void {
    this.storageValue = sliderValue;
    this._notifyDataChanged();
  }

  /**
   * Sets the selected storage if no network selected yet
   */
  private _setSelectedStorage(): void {
    if (isNullOrEmpty(this.storages)) { return; }
    let selectedStorageExist = this.storages.find((storage) => storage === this.selectedStorage);
    if (!isNullOrEmpty(selectedStorageExist)) { return; }

    Promise.resolve().then(() => {
      if (!isNullOrEmpty(this.fcSelectStorages)) {
        this.fcSelectStorages.setValue(this.storages[0]);

        let availableMemoryExceeded = !this.hasAvailableMemory;
        if (availableMemoryExceeded) {
          this.fcSelectStorages.markAsTouched();
        }
      }
    });
  }

  /**
   * Sets the custom storage value if not yet provided
   */
  private _setCustomStorageValue(): void {
    let hasCustomStorageValue = !isNullOrEmpty(this.customStorageValue);
    if (hasCustomStorageValue) { return; }
    this.customStorageValue = this.minValueGB;
  }

  /**
   * Resets the form group fields
   */
  private _resetFormGroup(): void {
    if (isNullOrEmpty(this.fgServerStorage)) { return; }
    this.fgServerStorage.reset();
    this.fcCustomStorage.reset();
  }

  /**
   * Register form group elements for custom type
   */
  private _registerFormGroup(): void {
    // Create custom storage control and register the listener
    this.fcCustomStorage = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.min(this.minValueGB),
      CoreValidators.custom(
        this._customStorageValidator.bind(this),
        'storageAvailable'
      )
    ]);

    this.fcSelectStorages = new FormControl('', [
      CoreValidators.custom(
        this._maxStorageChecking.bind(this),
        'storageAvailable'
      )
    ]);

    // Set the actual selected in case of storage selection changed
    this.fcSelectStorages.valueChanges
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe((value) => {
        this.selectedStorage = value;
        this._notifyDataChanged();
      });

    // Create form group and bind the form controls
    this.fgServerStorage = new FormGroup({
      fcCustomStorage: this.fcCustomStorage
    });
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
  private _maxStorageChecking(_storage: ResourceStorage) {
    return this.hasAvailableMemory;
  }

  /**
   * Event that emits when an input has been changed
   */
  private _notifyDataChanged() {
    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        this._storageOutput.storage = this.selectedStorage;
        this._storageOutput.sizeMB = convertGbToMb(
          coerceNumber(this.customStorageValue,
            this.minValueGB)
        );
        this._storageOutput.valid = this.fcCustomStorage.valid;
        break;

      case ServerInputManageType.Slider:
      default:
        this._storageOutput.storage = this.selectedStorage;
        this._storageOutput.sizeMB = convertGbToMb(this.storageValue);
        this._storageOutput.valid = this.hasAvailableMemory;
        break;
    }

    // Emit changes
    this.dataChange.emit(this._storageOutput);
    this._changeDetectorRef.markForCheck();
  }
}
