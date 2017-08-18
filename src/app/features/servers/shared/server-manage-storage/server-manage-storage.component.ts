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

  public storageSliderValues: number[];
  public storageProfileValue: string;
  public sliderValue: number;
  public customStorageValue: number;
  public minimum: number;
  public maximum: number;

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

  public get maximumMemoryGB(): number {
    return this.memoryGB + this.availableMemoryGB;
  }

  public get currentMemory(): string {
    return appendUnitSuffix(this.storageSliderValues[this.sliderValue], 'gigabyte');
  }

  public get remainingMemory(): string {
    return appendUnitSuffix(
      this.storageSliderValues[this.maximum] - this.storageSliderValues[this.sliderValue],
      'gigabyte'
    );
  }

  public constructor(private _textProvider: McsTextContentProvider) {
    this.storageProfileValue = '';
    this.storageSliderValues = new Array();
    this.sliderValue = 0;
    this.minimum = 0;
    this.maximum = 0;
    this.inputManageType = ServerInputManageType.Slider;
    this.storageChanged = new EventEmitter<ServerManageStorage>();
  }

  public ngOnInit() {
    this.storageTextContent = this._textProvider.content.servers.server.storage;
    if (this.storageProfileList && this.storageProfileList.getGroupNames().length > 0) {
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
      this._initializeSliderValues();
      this.maximum = this.storageSliderValues.length - 1;
      this._setCustomControlValidator();
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
    this.onStorageProfileChanged(this.storageProfileValue);
    this.onCustomStorageChanged(this.memoryGB);
  }

  private _initializeSliderValues(): void {
    this.storageSliderValues = new Array();
    this.storageSliderValues.push(this.memoryGB);

    for (let value = this.memoryGB; value < this.maximumMemoryGB;) {
      if ((value + CoreDefinition.SERVER_MANAGE_STORAGE_SLIDER_STEP) <= this.maximumMemoryGB) {
        value += CoreDefinition.SERVER_MANAGE_STORAGE_SLIDER_STEP;
      } else {
        value = this.maximumMemoryGB;
      }

      this.storageSliderValues.push(value);
    }
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
      appendUnitSuffix(this.maximumMemoryGB, 'gigabyte')
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
    return inputValue <= this.maximumMemoryGB;
  }

  private _notifyStorageChanged() {
    let serverStorage = new ServerManageStorage();
    serverStorage.storageProfile = this.storageProfileValue;

    // Set model data based on management type
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        serverStorage.storageMB = convertToMb(this.customStorageValue);
        serverStorage.valid = this.formControlServerStorageCustom.valid;
        break;

      case ServerInputManageType.Slider:
      default:
        // TODO: Add isArrayChecking to common utilities
        if (this.storageSliderValues && this.storageSliderValues.length > 0) {
          serverStorage.storageMB = convertToMb(this.storageSliderValues[this.sliderValue]);
          serverStorage.valid = true;
        } else {
          serverStorage.valid = false;
        }
        break;
    }

    refreshView(() => {
      this.storageChanged.next(serverStorage);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
