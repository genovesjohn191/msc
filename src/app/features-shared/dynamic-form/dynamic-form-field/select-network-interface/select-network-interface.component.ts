import {
  takeUntil,
  map,
  tap
} from 'rxjs/operators';
import {
  BehaviorSubject,
  Observable,
  of,
  Subject
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import {
  Component,
  forwardRef,
  ChangeDetectorRef,
  ViewChild,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import {
  animateFactory,
  isNullOrEmpty,
  isNullOrUndefined,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';
import {
  McsNetworkDbPod,
  McsResource
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { DynamicSelectNetworkInterfaceField } from './select-network-interface';
import { DynamicSelectNetworkInterfaceService } from './select-network-interface.service';
import { FieldSelectTreeViewComponent } from '@app/features-shared/form-fields/field-select-tree-view/field-select-tree-view.component';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { CoreValidators } from '@app/core';
import { DynamicFormValidationService } from '../../dynamic-form-validation.service';

export interface NetworkInterface {
  networkInterface: string;
  uuids: string[];
  ipAddress?: string;
  gateway?: string;
  prefix?: number;
}

export interface operatingSystem {
  type: string;
  name: string;
}

@Component({
  selector: 'mcs-dff-select-network-interface-field',
  templateUrl: './select-network-interface.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    './select-network-interface.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectNetworkInterfaceComponent),
      multi: true
    }
  ],
  animations: [
    animateFactory.rotate45
  ],
  host: {
    '(blur)': 'onTouched()'
  }
})

export class DynamicSelectNetworkInterfaceComponent extends DynamicSelectFieldComponentBase<any> implements OnInit {
  public config: DynamicSelectNetworkInterfaceField;

  // Filter variables
  private _companyId: string = '';
  private _resource: McsResource;
  private _os: operatingSystem;

  public isEsxi: boolean = false;
  public inputCtrlEth0Eth1 = new FormControl<any>(null);
  public inputCtrlEth2Eth3 = new FormControl<any>(null);
  public datasourceEth0Eth1: TreeDatasource<FlatOption>;
  public datasourceEth2Eth3: TreeDatasource<FlatOption>;
  public fcGateway = new FormControl<string>('');
  public fcManagementIp = new FormControl<string>('');
  public fcPrefix = new FormControl<number>(null);
  public prefixMinValue: number = 22;
  public prefixMaxValue: number = 30;

  private _networkInterfaceValue: NetworkInterface[] = [];
  private _optionsEth0Eth1 = new BehaviorSubject<FlatOption[]>(null);
  private _optionsEth2Eth3 = new BehaviorSubject<FlatOption[]>(null);
  private _destroySubject = new Subject<void>();

  private get _interfaceList(): string[] {
    if (this.isEsxi) {
      return ['eth0', 'eth1', 'eth2', 'eth3'];
    }
    return ['eth0', 'eth1'];
  }

  @ViewChild('treeViewSelect')
  public treeViewSelect: FieldSelectTreeViewComponent<any>;

  public constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _networkInterfaceService: DynamicSelectNetworkInterfaceService,
    private _validationService: DynamicFormValidationService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
    this._initializeNetworkValue();
    this._registerFormControls();
    this.datasourceEth0Eth1 = new TreeDatasource<FlatOption>(this._convertEth0Eth1OptionsToTreeItems.bind(this));
    this.datasourceEth2Eth3 = new TreeDatasource<FlatOption>(this._convertEth2Eth3OptionsToTreeItems.bind(this));
    this._subscribeToValueChanges();
    this._registerEvents();
  }

  public ngOnInit(): void {
    this.retrieveOptions();
  }

  public get gatewayErrorMessage(): string {
    return this._validationService.getErrorMessage(this.fcGateway);
  }

  public get managementIpErrorMessage(): string {
    return this._validationService.getErrorMessage(this.fcManagementIp);
  }

  public get prefixErrorMessage(): string {
    return this._validationService.getErrorMessage(this.fcPrefix);
  }

  protected callService(): Observable<FlatOption[]> {
    if (isNullOrUndefined(this._resource) || isNullOrUndefined(this._companyId)) { return of([]); }
    return this._networkInterfaceService.getNetworks(this._resource.id, this._companyId).pipe((
      tap((options) => {
        this._optionsEth0Eth1.next(options);
        this._optionsEth2Eth3.next(options);
      })
    ))
  }

  protected filter(collection: McsNetworkDbPod[]): FlatOption[] { return []; }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value: this.config.value,
      eventName,
      dependents
    });
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'company-change':
        this._companyId = params.value;
        this.retrieveOptions();
        break;
      case 'resource-change':
        this._resource = params.value as McsResource;
        this.retrieveOptions();
        break;
      case 'os-change':
        this._os = params.value as operatingSystem;
        this.isEsxi = false;
        if (this._os.type === 'ESX') { this.isEsxi = true; }
        this._reset();
        this.retrieveOptions();
        break;
    }
  }

  private _registerFormControls(): void {
    this.fcGateway = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.ipAddress,
      CoreValidators.privateIpAddress
    ]);

    this.fcManagementIp = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.ipAddress,
      CoreValidators.custom(
        this._ipMaskValidator.bind(this),
        'ipRange'
      ),
      CoreValidators.custom(
        this._ipGatewayValidator.bind(this),
        'ipIsGateway'
      )
    ]);

    this.fcPrefix = new FormControl<number>(null, [
      CoreValidators.required,
      CoreValidators.min(this.prefixMinValue),
      CoreValidators.max(this.prefixMaxValue)
    ]);

    this._setManagementIpEnabling();
  }

  private _setManagementIpEnabling(): void {
    if (this.fcGateway.valid && this.fcPrefix.valid) {
      this.fcManagementIp.enable();
    }
    else {
      this.fcManagementIp.reset();
      this.fcManagementIp.disable();
    }
  }

  private _subscribeToValueChanges(): void {
    this.fcGateway.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(changes => {
        this._networkInterfaceValue[0].gateway = changes;
        this._updateValue();
        this._setManagementIpEnabling();
      })
    ).subscribe();

    this.fcPrefix.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(changes => {
        this._networkInterfaceValue[0].prefix = changes;
        this._updateValue();
        this._setManagementIpEnabling();
      })
    ).subscribe();

    this.fcManagementIp.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(changes => {
        this._networkInterfaceValue[0].ipAddress = changes;
        this._updateValue();
      })
    ).subscribe();
    
    this.inputCtrlEth0Eth1.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(changes => {
        this._onNetworkEth0Eth1Change(changes);
      })
    ).subscribe();

    this.inputCtrlEth2Eth3.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(changes => {
        this._onNetworkEth2Eth3Change(changes);
      })
    ).subscribe();
  }

  private _onNetworkEth0Eth1Change(selectedNetworks: string[]): void {
    this._networkInterfaceValue.forEach(networkInterface => {
      if (networkInterface.networkInterface === 'eth0' || networkInterface.networkInterface === 'eth1') {
        networkInterface.uuids = selectedNetworks;
        this._updateValue();
      }
    });
  }

  private _onNetworkEth2Eth3Change(selectedNetworks: string[]): void {
    this._networkInterfaceValue.forEach(networkInterface => {
      if (networkInterface.networkInterface === 'eth2' || networkInterface.networkInterface === 'eth3') {
        networkInterface.uuids = selectedNetworks;
        this._updateValue();
      }
    });
  }

  private _updateValue() {
    this.config.value = this._networkInterfaceValue;
    this.valueChange(this.config.value);
    this._eventDispatcher.dispatch(McsEvent.dataChangeCreateNetworkPanelsEvent);
  }

  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeCreateNetworkPanelsEvent, () => {
      if (isNullOrEmpty(this._networkInterfaceValue)) {
        let options = this._networkInterfaceService.convertItemToFlatOptions(this._networkInterfaceService.networkList);
        this._optionsEth0Eth1.next(options);
      }
    });
  }

  private _convertEth0Eth1OptionsToTreeItems(): Observable<TreeItem<string>[]> {
    let groupNames = ['Networks'];
    return this._optionsEth0Eth1.pipe(
      map(records =>
        TreeUtility.convertEntityToTreemItems(groupNames,
          record => new TreeGroup(record, record, records),
          child => new TreeGroup(child.value, child.key, null, {
            selectable: true
          }))),
      tap(() => this._changeDetectorRef.markForCheck())
    );
  }

  private _convertEth2Eth3OptionsToTreeItems(): Observable<TreeItem<string>[]> {
    let groupNames = ['Networks'];
    return this._optionsEth2Eth3.pipe(
      map(records =>
        TreeUtility.convertEntityToTreemItems(groupNames,
          record => new TreeGroup(record, record, records),
          child => new TreeGroup(child.value, child.key, null, {
            selectable: true
          }))),
      tap(() => this._changeDetectorRef.markForCheck())
    );
  }

  private _initializeNetworkValue(): void {
    this._networkInterfaceValue = [];
    this._interfaceList.forEach(item => {
      let networkInterface: NetworkInterface = {
        networkInterface: item,
        uuids: []
      };
      this._networkInterfaceValue.push(networkInterface);
    });
  }

  private _reset(): void {
    this._initializeNetworkValue();
    this.inputCtrlEth0Eth1.reset();
    this.inputCtrlEth0Eth1.setValue([]);
    this.inputCtrlEth0Eth1.updateValueAndValidity();

    this.inputCtrlEth2Eth3.reset();
    this.inputCtrlEth2Eth3.setValue([]);
    this.inputCtrlEth2Eth3.updateValueAndValidity();

    this._changeDetectorRef.markForCheck();
  }

  private _ipMaskValidator(inputValue: any): boolean {
    if (isNullOrEmpty(this.fcGateway.value) || isNullOrUndefined(this.fcPrefix.value)) { return false; }
    var Netmask = require('netmask').Netmask;
    var gatewayIp: string = this.fcGateway.value;
    var subnet = new Netmask(gatewayIp + '/' + this.fcPrefix.value);

    try {
      return (subnet.contains(inputValue) &&
        subnet.broadcast !== inputValue &&
        subnet.base !== inputValue);
    }
    catch (error) {
      return false;
    }
  }

   private _ipGatewayValidator(inputValue: any): boolean {
    try {
      return this.fcGateway.value !== inputValue;
    }
    catch (error) {
      return false;
    }
  }
}