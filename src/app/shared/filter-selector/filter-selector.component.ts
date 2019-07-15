import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { McsFilterService } from '@app/core';
import { McsFilterInfo } from '@app/models';
import {
  isNullOrEmpty,
  animateFactory,
  unsubscribeSubject
} from '@app/utilities';
import { FilterSelector } from './filter-selector.interface';

@Component({
  selector: 'mcs-filter-selector',
  templateUrl: './filter-selector.component.html',
  styleUrls: ['./filter-selector.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'filter-selector-wrapper'
  }
})

export class FilterSelectorComponent implements OnInit, OnDestroy, FilterSelector {
  @Input()
  public key: string;

  @Output()
  public filtersChange: EventEmitter<Map<string, McsFilterInfo>>;

  public filterItemsMap: Map<string, McsFilterInfo>;

  private _destroySubject = new Subject<void>();
  private _hiddenFilterKeys: Set<string>;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _filterService: McsFilterService
  ) {
    this.key = '';
    this._hiddenFilterKeys = new Set();
    this.filtersChange = new EventEmitter();
  }

  public ngOnInit() {
    this.filterItemsMap = this._filterService.getFilterSettings(this.key);
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Notify the outside subscribers that the filter has been changed
   */
  public onFilterChange(): void {
    if (isNullOrEmpty(this.filterItemsMap)) { return; }
    this._filterService.saveFilterSettings(this.key, this.filterItemsMap);
    this.filtersChange.emit(this.filterItemsMap);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Returns true when the filter keys is hidden
   * @param key Key to be checked
   */
  public isFilterHidden(key: string): boolean {
    return this._hiddenFilterKeys.has(key);
  }

  /**
   * Remove the filter selector based on the key provided
   * @param key Key to be removed on the record list
   */
  public removeFilterSelector(key: string): void {
    this._hiddenFilterKeys.add(key);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Add the filter selector based on the key provided
   * @param key Key to be added on the filter selector
   */
  public addFilterSelector(key: string): void {
    this._hiddenFilterKeys.delete(key);
    this._changeDetectorRef.markForCheck();
  }
}
