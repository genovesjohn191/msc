import { BehaviorSubject } from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { McsFilterService } from '@app/core';
import { McsFilterInfo } from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

import { ColumnFilter } from './column-filter.interface';

@Component({
  selector: 'mcs-column-filter',
  templateUrl: './column-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'column-filter-wrapper'
  }
})

export class ColumnFilterComponent implements ColumnFilter, OnInit, OnDestroy {
  /**
   * @deprecated Use the Key input instead of setting the filters directly.
   * This will be converted to public variable only,
   * once everything was change to mat-table
   */
  @Input()
  public filters: McsFilterInfo[];

  @Input()
  public defaultFilters: McsFilterInfo[];

  /**
   * @deprecated Use the filtersChange instead.
   * This will be removed once everything was change to mat-table
   */
  @Output()
  public dataChange = new EventEmitter<McsFilterInfo[]>();

  @Input()
  public key: string;

  public filterPredicate: (filter: McsFilterInfo) => boolean;
  public filtersChange = new BehaviorSubject<McsFilterInfo[]>([]);

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _filterService: McsFilterService
  ) { }

  public ngOnInit(): void {
    this._initializeFilterSettings();
  }

  public ngOnDestroy(): void {
  }

  public notifyDataChange(): void {
    this.dataChange.next(this.filters);
    this.filtersChange.next(this.filters);
    this._saveSettings();
  }

  private _initializeFilterSettings(): void {
    if (isNullOrEmpty(this.key)) { return; }
    this.filters = this._filterService.getFilterSettings(this.key);
    this.filtersChange.next(this.filters);
    this._changeDetectorRef.markForCheck();
  }

  private _saveSettings(): void {
    if (isNullOrEmpty(this.key)) { return; }

    let convertedArrayToMap = new Map<string, McsFilterInfo>();
    this.filters.forEach(filter => {
      if (isNullOrEmpty(filter)) { return; }
      convertedArrayToMap.set(filter.id, filter);
    });
    this._filterService.saveFilterSettings(this.key, convertedArrayToMap);
  }
}
