import {
  Component,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
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
  public storageChanged: EventEmitter<ServerManageStorage>;

  public inputManageType: ServerInputManageType;
  public inputManageTypeEnum = ServerInputManageType;
  public storageTextContent: any;

  public storageProfileValue: any;
  public sliderValue: number;
  public customStorageValue: number;
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
    return appendUnitSuffix(this.sliderValue, 'gigabyte');
  }

  public get remainingMemory(): string {
    return appendUnitSuffix(this.maximum - this.sliderValue, 'gigabyte');
  }

  public constructor(private _textProvider: McsTextContentProvider) {
    this.storageProfileValue = '';
    this.sliderValue = 0;
    this.minimum = 0;
    this.maximum = 0;
    this.inputManageType = ServerInputManageType.Slider;
    this.storageChanged = new EventEmitter<ServerManageStorage>();
  }

  public ngOnInit() {
    this.storageTextContent = this._textProvider.content.servers.server.storage;
    if (this.storageProfileList) {
      let groupName = this.storageProfileList.getGroupNames()[0];
      this.storageProfileValue = this.storageProfileList.getGroup(groupName)[0].key;
    }

    // Register form group for custom storage
    this._registerFormGroup();
    this._initializeValues();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let availableMemoryMBChanges = changes['availableMemoryMB'];
    if (availableMemoryMBChanges) {
      this.maximum = Math.floor(this.memoryGB + this.availableMemoryGB);
    }
  }

  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    refreshView(() => {
      this.inputManageType = inputManageType;
      this._notifyStorageChanged();
    });
  }

  public onCustomStorageChanged(inputValue: number) {
    this.customStorageValue = inputValue;
    this._notifyStorageChanged();
  }

  public onStorageChanged(value: number) {
    this.sliderValue = value;
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

  public ngOnDestroy() {
    if (this.formControlSubscription) {
      this.formControlSubscription.unsubscribe();
    }
  }

  private _initializeValues(): void {
    this.minimum = this.memoryGB;
    this.maximum = Math.floor(this.memoryGB + this.availableMemoryGB);

    this.onStorageChanged(this.memoryGB);
  }

  private _registerFormGroup(): void {
    // Create custom storage control and register the listener
    this.formControlServerStorageCustom = new FormControl('', [
      CoreValidators.required
    ]);
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

  private _notifyStorageChanged() {
    let serverStorage = new ServerManageStorage();

    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        serverStorage.storageMB = convertToMb(this.customStorageValue);
        serverStorage.storageProfile = this.storageProfileValue;
        serverStorage.valid = this.formControlServerStorageCustom.valid;
        break;

      case ServerInputManageType.Slider:
      default:
        serverStorage.storageMB = convertToMb(this.sliderValue);
        serverStorage.storageProfile = this.storageProfileValue;
        serverStorage.valid = true;
        break;
    }
    refreshView(() => {
      this.storageChanged.next(serverStorage);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
