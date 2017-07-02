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
  McsList
} from '../../../../core';
import {
  ServerManageStorage,
  ServerInputManageType
} from '../../models';
import { refreshView } from '../../../../utilities';

@Component({
  selector: 'mcs-server-manage-storage',
  styles: [require('./server-manage-storage.component.scss')],
  templateUrl: './server-manage-storage.component.html',
  animations: [
    trigger('fadeInOut', [
      state('*', style({ opacity: 1 })),
      state('void', style({ opacity: 0 })),
      transition('void <=> *', animate('500ms'))
    ])
  ]
})

export class ServerManageStorageComponent implements OnInit, OnDestroy {
  public minimum: number;
  public maximum: number;
  public inputManageType: ServerInputManageType;
  public inputManageTypeEnum = ServerInputManageType;

  public sliderValue: number;
  public storageProfileValue: any;

  public customFinalStorageValue: number;
  public customInputValue: Subject<number>;
  public customStorageValue: number;
  public customStorageSubscription: any;

  @Input()
  public memoryInGb: number;

  @Input()
  public remainingMemoryInGb: number;

  @Input()
  public storageProfiles: McsList;

  @Output()
  public storageChanged: EventEmitter<ServerManageStorage>;

  public get currentMemory(): number {
    return this.sliderValue;
  }

  public get validCustomInput(): boolean {
    return this.customFinalStorageValue >= this.memoryInGb &&
      this.customFinalStorageValue <= this.remainingMemoryInGb;
  }

  public constructor() {
    this.minimum = 0;
    this.maximum = 0;
    this.sliderValue = 0;
    this.inputManageType = ServerInputManageType.Slider;
    this.storageChanged = new EventEmitter<ServerManageStorage>();
    this.customInputValue = new Subject<number>();
  }

  public ngOnInit() {
    // Set the minimum and maximum value of the progressbar based on the inputted data
    // and the slider value based on the memory in GB
    this._setSliderValue();

    // Add subsrciption to input in case of custom to add delay checking
    this._setCustomStorageInputDelay();
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
      this.customStorageValue = undefined;
      this.customFinalStorageValue = undefined;
      this.inputManageType = inputManageType;
    });
  }

  private _setSliderValue(): void {
    this.minimum = 0;
    this.sliderValue = this.memoryInGb;
    this.maximum = this.remainingMemoryInGb;
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

    serverStorage.memoryInGb = memoryInGb;
    serverStorage.storageProfile = storageProfile;
    this.storageChanged.next(serverStorage);
  }
}
