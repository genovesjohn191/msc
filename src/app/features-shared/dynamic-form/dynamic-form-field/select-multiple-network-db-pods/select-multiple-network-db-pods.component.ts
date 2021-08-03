import {
  Component,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  DynamicFormFieldDataChangeEventParam,
  GroupedOption,
  FlatOption
} from '../../dynamic-form-field-config.interface';
import { DynamicSelectMultipleNetworkDbPodsField } from './select-multiple-network-db-pods';
import { DynamicSelectFieldComponentBase } from '../dynamic-select-field-component.base';
import {
  McsNetworkDbMazAaQueryParams,
  McsNetworkDbPod
} from '@app/models';
import { McsApiService } from '@app/services';
import { map, takeUntil } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-dff-select-multiple-network-db-pods-field',
  templateUrl: './select-multiple-network-db-pods.component.html',
  styleUrls: [
    '../dynamic-form-field.scss',
    './select-multiple-network-db-pods.component.scss'
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectMultipleNetworkDbPodsComponent),
      multi: true
    }
  ]
})
export class DynamicSelectMultipleNetworkDbPodsComponent extends DynamicSelectFieldComponentBase<McsNetworkDbPod> {
  public config: DynamicSelectMultipleNetworkDbPodsField;
  private initialOptions: string;
  private podList = new Array<McsNetworkDbPod>();
  private vxlanGroup: number = null;

  public constructor(
    private _apiService: McsApiService,
    private _translateService: TranslateService,
    _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_changeDetectorRef);
  }

  public onFormDataChange(params: DynamicFormFieldDataChangeEventParam): void {
    throw new Error('Method not implemented.');
  }

  public onChange(event: any): void {

    if (!isNullOrEmpty(event.value)) {
      let selectedIds = event.value.map(opt => opt.key);
      this.filterOptionsOnclick(selectedIds);

      if (this.config.isMazAa) {
        let query: McsNetworkDbMazAaQueryParams = {
          podIds: selectedIds,
          keyword: 'pod_ids'
        }
        this._apiService.getMazAaAvailablePods(query).pipe(
          map(response => {
            let podIds = response.availablePods;
            this.filterMazAaOptions(podIds, selectedIds);
          })
        ).subscribe();
      }
    }
    else {
      if (isNullOrEmpty(this.config.excludePods)) { this.vxlanGroup = null }
      this.config.options = JSON.parse(this.initialOptions);
      this._changeDetectorRef.markForCheck();
    }
  }

  private filterMazAaOptions(availablePods: number[], selectedPods: number[]): void {
    this.config.options.forEach(group => {
      group.options.forEach(opt => {
        if (!availablePods?.includes(opt.key) && !selectedPods.includes(opt.key)) {
          opt.disabled = true;
          opt.hint = opt.hint ? opt.hint + ' '
            + this._translateService.instant('networkDb.vlans.reserveHints.mazAaNotAvailable')
            : this._translateService.instant('networkDb.vlans.reserveHints.mazAaNotAvailable');
        }
      });
    });
    this._changeDetectorRef.markForCheck();
  }

  private filterOptionsOnclick(selectedPods: number[]): void {
    if (isNullOrEmpty(this.vxlanGroup)) {
      const selectedPod = this.podList?.filter(item => item.id === selectedPods[0])[0];
      this.vxlanGroup = selectedPod?.vxLanGroup;
    }

    this.config.options.forEach(group => {
      group.options.forEach(opt => {
        const pod = this.podList?.filter(item => item.id === opt.key)[0];
        if (pod?.vxLanGroup !== this.vxlanGroup) {
          opt.disabled = true;
          opt.hint = opt.hint ? opt.hint + ' '
            + this._translateService.instant('networkDb.vlans.reserveHints.vxlanMismatch')
            : this._translateService.instant('networkDb.vlans.reserveHints.vxlanMismatch');
        }
      });
    });

    this._changeDetectorRef.markForCheck();
  }

  protected callService(): Observable<McsNetworkDbPod[]> {
    return this._apiService.getNetworkDbPods().pipe(
      takeUntil(this.destroySubject),
      map((response) => {
        this.podList = response.collection;
        return response && response.collection;
      }));
  }

  protected filter(collection: McsNetworkDbPod[]): GroupedOption[] {
    if (!isNullOrEmpty(this.config.excludePods)) {
      let assignedPod = collection.find(p => p.id === this.config.excludePods[0]);
      this.vxlanGroup = assignedPod.vxLanGroup;
    }

    let groupedOptions: GroupedOption[] = [];
    collection.sort((a, b) => a.siteName.localeCompare(b.siteName))
      .forEach((item) => {

        let groupName = item.siteName;
        let existingGroup = groupedOptions.find((opt) => opt.name === groupName);
        let option = {
          key: item.id,
          value: item.name,
          disabled: item.freeVlans === 0
            || this._exluded(item)
            || (!isNullOrEmpty(this.vxlanGroup) && item.vxLanGroup !== this.vxlanGroup)
        } as FlatOption;

        if (item.freeVlans === 0) {
          option.hint = this._translateService.instant('networkDb.vlans.reserveHints.noFreeVlans');
        }

        if (this._exluded(item)) {
          option.hint = option.hint ? option.hint + ' '
            + this._translateService.instant('networkDb.vlans.reserveHints.alreadyAssigned')
            : this._translateService.instant('networkDb.vlans.reserveHints.alreadyAssigned');
        }

        if (!isNullOrEmpty(this.vxlanGroup) && item.vxLanGroup !== this.vxlanGroup) {
          option.hint = option.hint ? option.hint + ' '
            + this._translateService.instant('networkDb.vlans.reserveHints.vxlanMismatch')
            : this._translateService.instant('networkDb.vlans.reserveHints.vxlanMismatch');
        }

        if (existingGroup) {
          // Add option to existing group
          existingGroup.options.push(option);
        } else {
          // Add option to new group
          groupedOptions.push({
            type: 'group',
            name: groupName,
            options: [option]
          });
        }
      });

    this.initialOptions = JSON.stringify(groupedOptions);
    return groupedOptions;
  }

  private _exluded(item: McsNetworkDbPod): boolean {
    if (!isNullOrEmpty(this.config.excludePods)) {
      let podId = this.config.excludePods.filter(b => b === item.id);
      if (!isNullOrEmpty(podId)) {
        return true;
      }
    }
    return false;
  }
}
