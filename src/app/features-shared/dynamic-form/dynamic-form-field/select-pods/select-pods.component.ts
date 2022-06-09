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
  McsNetworkDbPod
} from '@app/models';
import {
  DynamicFormFieldDataChangeEventParam,
  DynamicFormFieldOnChangeEvent,
  FlatOption,
  GroupedOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import { DynamicSelectPodsField } from './select-pods';
import { DynamicSelectPodsService } from './select-pods.service';
import { FieldSelectTreeViewComponent } from '@app/features-shared/form-fields/field-select-tree-view/field-select-tree-view.component';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';


@Component({
  selector: 'mcs-dff-select-pods-field',
  templateUrl: './select-pods.component.html',
  styleUrls: [ '../dynamic-form-field.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectPodsComponent),
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
export class DynamicSelectPodsComponent extends DynamicSelectFieldComponentBase<any> implements OnInit {

  public config: DynamicSelectPodsField;

  public inputCtrl = new FormControl();
  public datasource: TreeDatasource<GroupedOption>;

  public panelOpen: boolean;
  public reservationLoading: boolean = false;

  private selectedPods: number[] = [];
  private vxlanGroup: number = null;
  private _initiallyCalledPods: number[];
  private _isInitiallyLoaded: boolean = true;
  private _isMazAa: boolean;
  private _isMazAaCallLoading: boolean;

  private _toBeConvertedItemsChange = new BehaviorSubject<GroupedOption[]>(null);
  private _updatedFlatOptionsChange = new BehaviorSubject<FlatOption[]>(null);
  private _destroySubject = new Subject<void>();

  @ViewChild('treeViewSelect')
  public treeViewSelect: FieldSelectTreeViewComponent<any>;

  public constructor(
    private _apiService: McsApiService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService,
    private _podsService: DynamicSelectPodsService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
    this.datasource = new TreeDatasource<GroupedOption>(this._convertFamiliesToTreeItems.bind(this));
    this._subscribeToValueChanges();
    this._registerEvents();
  }

  public get podReachedMaxFreeVlanhintText(): string {
    return this._translateService.instant('networkDb.vlans.reserveHints.freeVlanExceeded');
  }

  public get vxlanMismatchintText(): string {
    return this._translateService.instant('networkDb.vlans.reserveHints.vxlanMismatch');
  }

  public get mazAaNotAvailableText(): string {
    return this._translateService.instant('networkDb.vlans.reserveHints.mazAaNotAvailable');
  }

  public get noFreeVlansText(): string {
    return this._translateService.instant('networkDb.vlans.reserveHints.noFreeVlans');
  }

  public onBlurInput(): void { }

  public writeValue(obj: any): void { }

  public ngOnInit(): void {
    this.retrieveOptions();
  }

  public onTogglePanel(): void {
    this.panelOpen ? this._closePanel() : this._openPanel();
  }

  protected callService(): Observable<GroupedOption[]> {
    return this._podsService.getInitialPodOptions().pipe((
      tap((groupedOptions) => {
        this._updateFlatOptions(groupedOptions);
        this._toBeConvertedItemsChange.next(groupedOptions);
      })
    ))
  }

  protected filter(collection: McsNetworkDbPod[]): GroupedOption[] { return []; }

  public notifyForDataChange(eventName: DynamicFormFieldOnChangeEvent, dependents: string[], value?: any): void {
    this.dataChange.emit({
      value: this.config.value,
      eventName,
      dependents
    });  }


  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    switch (params.eventName) {
      case 'maz-aa-change':
        this._reset();
        this._isMazAa = isNullOrEmpty(params.value) ? false : true;

        if (this._isInitiallyLoaded) {
          this._isInitiallyLoaded = false;
          let initialValues = this._setDefaultConfigValue(this.config.initialValue);
          this.selectedPods = initialValues;
          this.inputCtrl.setValue(initialValues);
          this.inputCtrl.updateValueAndValidity();
          this._changeDetectorRef.markForCheck();
        }
        this._eventDispatcher.dispatch(McsEvent.dataChangeCreateNetworkPanelsEvent);
        break;
    }
  }

  private _setDefaultConfigValue(value: number[]): number[] {
    if(isNullOrEmpty(value)) { return []}

    let defaultValue: number[] = [];
    value?.forEach((val) => {
      let podFound = this._podsService.podList?.find((pod) => pod.id === val);
      let podHasFreeVlan = this._podsService.podRemainingFreeVlan(podFound) > 0;
      if (podHasFreeVlan) {
        defaultValue.push(val);
      }
    })
    return defaultValue;
  }

  private _subscribeToValueChanges(): void {
    this.inputCtrl.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(changes => {
        this._onPodTreeViewChange(changes);
        this.config.value = changes;
        this.valueChange(this.config.value);
      })
    ).subscribe();
  }

  private _onPodTreeViewChange(selectedPods: number[]): void {
    this.selectedPods = selectedPods;
    this._eventDispatcher.dispatch(McsEvent.dataChangeCreateNetworkPanelsEvent);
  }

  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeCreateNetworkPanelsEvent, () => {
      if (!isNullOrEmpty(this.selectedPods)) {
        this._filterPodOptions();
      } else {
        let groupedOptions = this._podsService.convertItemToGroupOptions(this._podsService.podList);
        this._updateFlatOptions(groupedOptions)
        this.vxlanGroup = null;
        this._toBeConvertedItemsChange.next(groupedOptions);
      }
    });
  }

  private _filterPodOptions(): void {
    let query: McsNetworkDbMazAaQueryParams = {
      podIds: this.selectedPods,
      keyword: 'pod_ids'
    }
    let updatedOptionsObservable = this._updateOptionsByFreeVlanAndVxlanGroup(this.selectedPods);
    let groupOptionsObservable = updatedOptionsObservable;
    let mazAaPodsHasChanged = JSON.stringify(this.selectedPods) === JSON.stringify(this._initiallyCalledPods);

    if (this._isMazAa && !this._isMazAaCallLoading && !mazAaPodsHasChanged) {
      this._isMazAaCallLoading = true;
      this._initiallyCalledPods = this.selectedPods;
      this.reservationLoading = true;

      let mazAaAvailablePodsObservable = this._apiService.getMazAaAvailablePods(query).pipe(
        catchError((error) => {
          this._isMazAaCallLoading = false;
          return throwError(error);
        }),
        tap(() => this._isMazAaCallLoading = false)
      );

      groupOptionsObservable = forkJoin([updatedOptionsObservable, mazAaAvailablePodsObservable]).pipe(
        map(results => {
          this.reservationLoading = false;
          let mazAaAvailablePods = results[1]?.availablePods;
          let updatedOptions = this._updateOptionsByAvailableMazaa(results[0], mazAaAvailablePods);
          return updatedOptions;
        })
      );
    }

    groupOptionsObservable.pipe(
      tap(groupedOptions => this._updateFlatOptions(groupedOptions))
    ).subscribe();
  }

  private _updateFlatOptions(groupOptions: GroupedOption[]): void {
    let updatedOptions = new Array<FlatOption>();

    groupOptions?.forEach(groupOptions => {
      let filteredOptions = groupOptions.options.filter(option => option.disabled);
      if (isNullOrEmpty(filteredOptions)) { return; }
      updatedOptions.push(...filteredOptions);
    });

    this._updatedFlatOptionsChange.next(updatedOptions);
    this.treeViewSelect?.updateView();
  }

  private _updateOptionsByFreeVlanAndVxlanGroup(selectedPods: number[]): Observable<GroupedOption[]> {
    if (isNullOrEmpty(this.vxlanGroup)) {
      const selectedPod = this._podsService.podList?.filter(item => item.id === selectedPods[0])[0];
      this.vxlanGroup = selectedPod?.vxLanGroup;
    }

    let options = this._toBeConvertedItemsChange.getValue();
    options.forEach(group => {
      group.options.forEach(opt => {
        let selectedPod = this._podsService.podList?.find(selectedPod => opt.key === selectedPod.id);
        let freeVlanRemaining = this._podsService.podRemainingFreeVlan(selectedPod);
        let isPodSelected = this.config?.value?.find((config) => config === selectedPod.id);
        if (freeVlanRemaining === 0 && !isPodSelected) {
          opt.disabled = true; 
          let freeVlanHint = !opt.hint?.includes(this.podReachedMaxFreeVlanhintText) ? this.podReachedMaxFreeVlanhintText : '';
          opt.hint = opt.hint ? opt.hint + ' ' + freeVlanHint : freeVlanHint;
        }
        if (freeVlanRemaining === 1) {
          opt.disabled = false; 
          opt.hint = '';
        }
        const pod = this._podsService.podList?.filter(item => item.id === opt.key)[0];
        let podHasDifferentVxlanGroup = (pod?.vxLanGroup !== this.vxlanGroup) &&
          (!isNullOrEmpty(this.vxlanGroup)) && (!opt.hint?.includes(this.vxlanMismatchintText));
        if (podHasDifferentVxlanGroup) {
          opt.disabled = true;
          opt.hint = opt.hint ? opt.hint + ' ' + this.vxlanMismatchintText : this.vxlanMismatchintText;
        }
      });
    });
    return of(options);
  }

  private _updateOptionsByAvailableMazaa(options: GroupedOption[], availablePods: number[]): GroupedOption[] {
    options.forEach(group => {
      group.options.forEach(opt => {
        let mazAaNotAvailable = !availablePods?.includes(opt.key) &&
          !this.selectedPods.includes(opt.key) && !opt.hint?.includes(this.mazAaNotAvailableText);
        if (mazAaNotAvailable) {
          opt.disabled = true;
          opt.hint = opt.hint ? opt.hint + ' ' + this.mazAaNotAvailableText : this.mazAaNotAvailableText;
        }
      });
    });
    return options;
  }

  private _convertFamiliesToTreeItems(): Observable<TreeItem<string>[]> {
    return this._toBeConvertedItemsChange.pipe(
      map(records =>
        TreeUtility.convertEntityToTreemItems(records,
          record => new TreeGroup(record.name, record.name, record.options),
          child => new TreeGroup(child.value, child.key, null, {
            selectable: true,
            disableWhen: this._isOptionDisabled.bind(this),
            tooltipFunc: this._getOptionTooltip.bind(this)
      }))),
      tap(() => this._changeDetectorRef.markForCheck())
    );
  }

  private _isOptionDisabled(itemKey: any): boolean {
    let updatedOptions = this._updatedFlatOptionsChange.getValue() || [];
    let optionFound = updatedOptions?.find(option => option.key === itemKey);
    return optionFound?.disabled;
  }

  private _getOptionTooltip(itemKey: any): string {
    let updatedOptions = this._updatedFlatOptionsChange.getValue() || [];
    let optionFound = updatedOptions?.find(option => option.key === itemKey);
    return optionFound?.hint;
  }

  private _reset(): void {
    this._initiallyCalledPods = [];
    this.inputCtrl.reset();
    this.selectedPods = [];
    this.inputCtrl.setValue([]);
    this.inputCtrl.updateValueAndValidity();
    this._changeDetectorRef.markForCheck();
  }

  private _openPanel(): void {
    this.panelOpen = true;
    this._changeDetectorRef.markForCheck();
  }

  private _closePanel(): void {
    this.panelOpen = false;
    this._changeDetectorRef.markForCheck();
  }
}