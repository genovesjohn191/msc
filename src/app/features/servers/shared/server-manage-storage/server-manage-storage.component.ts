import {
  Component,
  Input,
  Output,
  OnInit,
  OnChanges,
  OnDestroy,
  EventEmitter
} from '@angular/core';
import {
  CoreDefinition,
  CoreValidators,
  McsTextContentProvider,
  McsList,
  McsListItem
} from '../../../../core';
import {
  ServerManageStorage,
  ServerInputManageType,
  ServerStorageDevice
} from '../../models';
import {
  refreshView,
  animateFactory,
  convertToGb,
  convertToMb,
  replacePlaceholder,
  appendUnitSuffix,
  isFormControlValid
} from '../../../../utilities';
import {
  FormGroup,
  FormControl
} from '@angular/forms';

@Component({
  selector: 'mcs-server-manage-storage',
  styles: [require('./server-manage-storage.component.scss')],
  templateUrl: './server-manage-storage.component.html',
  animations: [
    animateFactory({ duration: '500ms' })
  ]
})

export class ServerManageStorageComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public memoryMB: number;

  @Input()
  public availableMemoryMB: number;

  @Input()
  public storageProfileList: McsList;

  @Output()
  public storageProfileChanged: EventEmitter<any>;

  @Output()
  public storageChanged: EventEmitter<ServerManageStorage>;

  public inputManageType: ServerInputManageType;
  public inputManageTypeEnum = ServerInputManageType;
  public storageTextContent: any;

  public storageProfileValue: any;
  public storageValue: number;
  public minimum: number;
  public maximum: number;

  public formGroupServerStorage: FormGroup;
  public formControlServerStorageCustom: FormControl;
  public formControlSubscription: any;

  public invalidCustomStorageMessage: string;

  public get memoryGB(): number {
    return convertToGb(this.memoryMB);
  }

  public get availableMemoryGB(): number {
    return convertToGb(this.availableMemoryMB);
  }

  public get currentMemory(): string {
    return appendUnitSuffix(this.storageValue, 'gigabyte');
  }

  public get remainingMemory(): string {
    return appendUnitSuffix(this.maximum - this.storageValue, 'gigabyte');
  }

  public constructor(private _textProvider: McsTextContentProvider) {
    this.storageProfileValue = '';
    this.storageValue = 0;
    this.minimum = 0;
    this.maximum = 0;
    this.inputManageType = ServerInputManageType.Slider;
    this.storageProfileChanged = new EventEmitter<any>();
    this.storageChanged = new EventEmitter<ServerManageStorage>();
  }

  public ngOnInit() {
    if (this.storageProfileList) {
      let groupName = this.storageProfileList.getGroupNames()[0];
      this.storageProfileValue = this.storageProfileList.getGroup(groupName)[0].key;
      this.onStorageProfileChanged(this.storageProfileValue);
    }
  }

  public ngOnChanges() {
    this.storageTextContent = this._textProvider.content.servers.server.storage;

    // Register form group for custom storage
    this._registerFormGroup();
    this._initializeValues();
  }

  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    refreshView(() => { this.inputManageType = inputManageType; });
  }

  public onStorageChanged(value: number) {
    this.storageValue = value;
    this._notifyStorageChanged();
  }

  public onStorageProfileChanged(value: any): void {
    this.storageProfileValue = value;

    this._setCustomControlValidator();
    this._notifyStorageProfileChanged();
    this._notifyStorageChanged();
  }

  public isControlValid(control: FormControl): boolean {
    return isFormControlValid(control);
  }

  public ngOnDestroy() {
    if (this.formControlSubscription) {
      this.formControlSubscription.unsubscribe();
    }
  }

  private _initializeValues(): void {
    this.minimum = this.memoryGB;
    this.maximum = Math.floor(this.memoryGB + this.availableMemoryGB);

    this.onStorageChanged(this.memoryGB);
    this._setCustomControlValidator();
  }

  private _registerFormGroup(): void {
    // Create custom storage control and register the listener
    this.formControlServerStorageCustom = new FormControl();
    this.formControlSubscription = this.formControlServerStorageCustom.valueChanges
      .subscribe(this.onStorageChanged.bind(this));

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
      appendUnitSuffix(this.maximum, 'gigabyte')
    );

    this.formControlServerStorageCustom.setValidators([
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.min(this.minimum + 1),
      CoreValidators.custom(
        this._customStorageValidator.bind(this),
        validationMessage
      )
    ]);
  }

  private _customStorageValidator(inputValue: any): boolean {
    return inputValue <= this.maximum;
  }

  private _validateServerStorage(): boolean {
    return this.storageValue > this.memoryGB && this._customStorageValidator(this.storageValue);
  }

  private _notifyStorageProfileChanged() {
    refreshView(() => {
      this.storageProfileChanged.next(this.storageProfileValue);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  private _notifyStorageChanged() {
    refreshView(() => {
      let serverStorage = new ServerManageStorage();
      serverStorage.storageProfile = this.storageProfileValue;
      serverStorage.storageMB = convertToMb(this.storageValue);
      serverStorage.valid = this._validateServerStorage();
      this.storageChanged.next(serverStorage);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
