import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsList
} from '../../../../core';
import {
  ServerManageStorage,
  ServerInputManageType
} from '../../models';
import {
  refreshView,
  animateFactory
} from '../../../../utilities';

@Component({
  selector: 'mcs-server-manage-storage',
  styles: [require('./server-manage-storage.component.scss')],
  templateUrl: './server-manage-storage.component.html',
  animations: [
    animateFactory({ duration: '500ms' })
  ]
})

export class ServerManageStorageComponent implements OnInit, OnDestroy {
  public inputManageType: ServerInputManageType;
  public inputManageTypeEnum = ServerInputManageType;
  public storageTextContent: any;

  public minimum: number;
  public maximum: number;
  public sliderValue: number;
  public storageProfileValue: any;

  public customFinalStorageValue: number;
  public customInputValue: Subject<number>;
  public customStorageValue: number;
  public customStorageSubscription: any;

  @Input()
  public memoryGB: number;

  @Input()
  public remainingMemoryGB: number;

  @Input()
  public storageProfiles: McsList;

  @Output()
  public storageChanged: EventEmitter<ServerManageStorage>;

  public get currentMemory(): number {
    return this.sliderValue;
  }

  public get validCustomInput(): boolean {
    return this.customFinalStorageValue >= this.memoryGB &&
      this.customFinalStorageValue <= this.remainingMemoryGB;
  }

  public constructor(private _textProvider: McsTextContentProvider) {
    this.minimum = 0;
    this.maximum = 0;
    this.sliderValue = 0;
    this.inputManageType = ServerInputManageType.Slider;
    this.storageChanged = new EventEmitter<ServerManageStorage>();
    this.customInputValue = new Subject<number>();
  }

  public ngOnInit() {
    this.storageTextContent = this._textProvider.content.servers.server.storage;
    // Set the minimum and maximum value of the progressbar based on the inputted data
    // and the slider value based on the memory in GB
    this._initializeValues();

    // Add subsrciption to input in case of custom to add delay checking
    this._setCustomStorageInputDelay();

    if (this.storageProfiles) {
      let groupName = this.storageProfiles.getGroupNames()[0];
      this.storageProfileValue = this.storageProfiles.getGroup(groupName)[0].key;
    }
  }

  public ngOnDestroy() {
    if (this.customStorageSubscription) {
      this.customStorageSubscription.unsubscribe();
    }
  }

  public onSliderChanged(index: number) {
    this.sliderValue = index;
    this._notifyStorageChanged(this.sliderValue, this.storageProfileValue);
  }

  public onCustomStorageChanged(value: number) {
    this.customStorageValue = value;
    this.customInputValue.next(this.customStorageValue);
    if (this.validCustomInput) {
      this._notifyStorageChanged(this.customStorageValue, this.storageProfileValue);
    }
  }

  public onStorageProfileChanged(value: any): number {
    this.storageProfileValue = value;

    // Changed the storage value according to active element
    let storageValue: number = 0;
    switch (this.inputManageType) {
      case ServerInputManageType.Custom:
        storageValue = this.customStorageValue;
        break;

      case ServerInputManageType.Slider:
      default:
        storageValue = this.sliderValue;
        break;
    }

    this._notifyStorageChanged(storageValue, this.storageProfileValue);
    return storageValue;
  }

  public onChangeInputManageType(inputManageType: ServerInputManageType) {
    refreshView(() => {
      if (inputManageType === ServerInputManageType.Slider) {
        this.customStorageValue = undefined;
        this.customFinalStorageValue = undefined;
      }
      this.inputManageType = inputManageType;
    });
  }

  private _initializeValues(): void {
    this.sliderValue = this.memoryGB + 1;
    this.minimum = this.memoryGB + 1;
    this.maximum = this.memoryGB + this.remainingMemoryGB;
    this.customStorageValue = this.memoryGB + 1;
  }

  private _setCustomStorageInputDelay(): void {
    this.customStorageSubscription = Observable.of(undefined)
      .concat(this.customInputValue)
      .debounceTime(CoreDefinition.INPUT_TIME)
      .subscribe((inputValue) => {
        this.customFinalStorageValue = inputValue;
      });
  }

  private _notifyStorageChanged(memoryInGb: number, storageProfile: any) {
    let serverStorage: ServerManageStorage = new ServerManageStorage();

    serverStorage.storageGB = memoryInGb;
    serverStorage.storageProfile = storageProfile;
    this.storageChanged.next(serverStorage);
  }
}
