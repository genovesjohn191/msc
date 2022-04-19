import { BehaviorSubject } from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { McsFilterService } from '@app/core';
import { McsFilterInfo } from '@app/models';
import {
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ColumnFilter } from '../column-filter.interface';

@Component({
  selector: 'mcs-column-selector',
  templateUrl: './column-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'column-selector-wrapper'
  }
})
export class ColumnSelectorComponent implements ColumnFilter, OnInit, OnChanges, OnDestroy {
  @Input()
  public storageKey: string;

  @Input()
  public defaultFilters: McsFilterInfo[];

  @Input()
  public filterPredicate: (filter: McsFilterInfo) => boolean;

  @Input()
  public triggerable: boolean;

  @Input()
  public filterPanelExpanded: boolean;

  public filters = new Array<McsFilterInfo>();
  public filtersChange = new BehaviorSubject<McsFilterInfo[]>([]);

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _filterService: McsFilterService
  ) { }

  public ngOnInit(): void {
    this._validateDefaultFilters();
    this._initializeFilterSettings();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let leftPanelChange = changes['filterPanelExpanded'];
    if (!isNullOrUndefined(leftPanelChange?.previousValue)) {
      this.notifyDataChange();
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.filtersChange);
  }

  public isFilterIncluded(filter: McsFilterInfo): boolean {
    if (isNullOrEmpty(filter)) { return false; }
    return !this.filterPredicate ? !filter.exclude :
      this.filterPredicate(filter) && !filter.exclude;
  }

  public getFilterText(filter: McsFilterInfo): string {
    if (isNullOrEmpty(filter)) { return ''; }
    return filter.text ||
      this._translateService.instant(`columnHeader.${filter.id}`);
  }

  public notifyDataChange(): void {
    this.filtersChange.next(this.filters);
    this._saveSettings();
  }

  private _initializeFilterSettings(): void {
    this.filters = this._filterService.getFilterSettings2(this.storageKey, this.defaultFilters);
    this.filtersChange.next(this.filters);
    this._changeDetectorRef.markForCheck();
  }

  private _validateDefaultFilters(): void {
    if (isNullOrEmpty(this.defaultFilters)) {
      throw new Error(`Unable to initialize column filters without default settings`);
    }

    if (isNullOrEmpty(this.storageKey)) {
      throw new Error(`Cannot find the storage key for the column filter`);
    }
  }

  private _saveSettings(): void {
    let convertedArrayToMap = new Map<string, McsFilterInfo>();
    this.filters.forEach(filter => {
      if (isNullOrEmpty(filter)) { return; }
      convertedArrayToMap.set(filter.id, filter);
    });

    this._filterService.saveFilterSettings(this.storageKey, convertedArrayToMap, this.filterPanelExpanded);
  }
}
