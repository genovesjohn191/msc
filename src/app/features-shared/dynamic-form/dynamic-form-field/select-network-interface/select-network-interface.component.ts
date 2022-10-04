import {
  takeUntil,
  map,
  tap,
  distinctUntilChanged,
  catchError
} from 'rxjs/operators';
import {
  BehaviorSubject,
  forkJoin,
  Observable,
  of,
  Subject,
  throwError
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
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsNetworkDbMazAaQueryParams,
  McsNetworkDbPod,
  McsResource
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { DynamicSelectNetworkInterfaceField } from './select-network-interface';
import { DynamicSelectNetworkInterfaceService } from './select-network-interface.service';
import { FieldSelectTreeViewComponent } from '@app/features-shared/form-fields/field-select-tree-view/field-select-tree-view.component';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';

export interface NetworkInterface {
  networkInterface: string;
  uuids: string[];
}

export interface operatingSystem {
  type: string;
  name: string;
}

@Component({
  selector: 'mcs-dff-select-network-interface-field',
  templateUrl: './select-network-interface.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
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

  private _networkInterfaceValue : NetworkInterface[] = [];
  private _optionsEth0Eth1 = new BehaviorSubject<FlatOption[]>(null);
  private _optionsEth2Eth3 = new BehaviorSubject<FlatOption[]>(null);
  private _destroySubject = new Subject<void>();
  
  private get _interfaceList(): string[]{
    if(this.isEsxi) {
      return ['eth0', 'eth1', 'eth2', 'eth3'];
    }
    return ['eth0', 'eth1'];
  }

  @ViewChild('treeViewSelect')
  public treeViewSelect: FieldSelectTreeViewComponent<any>;

  public constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _networkInterfaceService: DynamicSelectNetworkInterfaceService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
    this.datasourceEth0Eth1 = new TreeDatasource<FlatOption>(this._convertEth0Eth1OptionsToTreeItems.bind(this));
    this.datasourceEth2Eth3 = new TreeDatasource<FlatOption>(this._convertEth2Eth3OptionsToTreeItems.bind(this));
    this._subscribeToValueChanges();
    this._registerEvents();
  }

  public ngOnInit(): void {
    this.retrieveOptions();
  }

  protected callService(): Observable<FlatOption[]> {
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
    });  }

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
        if(this._os.type === 'ESX') { this.isEsxi = true; }
        this._reset();
        break;
    }
  }

  private _subscribeToValueChanges(): void {
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
    this._networkInterfaceValue.forEach(item => {
      if(item.networkInterface === 'eth0' || item.networkInterface === 'eth1'){
        item.uuids = selectedNetworks;
      }
    });

    this.config.value = this._networkInterfaceValue;
    this.valueChange(this.config.value);
    this._eventDispatcher.dispatch(McsEvent.dataChangeCreateNetworkPanelsEvent);
  }

  private _onNetworkEth2Eth3Change(selectedNetworks: string[]): void {
    this._networkInterfaceValue.forEach(item => {
      if(item.networkInterface === 'eth2' || item.networkInterface === 'eth3'){
        item.uuids = selectedNetworks;
      }
    });

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

  private _reset(): void {
    this._networkInterfaceValue = [];
    this._interfaceList.forEach(item => {
      let networkInterface: NetworkInterface = {
        networkInterface: item,
        uuids: []
      };
      this._networkInterfaceValue.push(networkInterface);
    });
    
    this.inputCtrlEth0Eth1.reset();
    this.inputCtrlEth0Eth1.setValue([]);
    this.inputCtrlEth0Eth1.updateValueAndValidity();
    
    this.inputCtrlEth2Eth3.reset();
    this.inputCtrlEth2Eth3.setValue([]);
    this.inputCtrlEth2Eth3.updateValueAndValidity();

    this._changeDetectorRef.markForCheck();
  }
}