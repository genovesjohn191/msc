import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { McsUniqueId } from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

import { IdDirective } from '../directives';
import { Search } from './search.interface';

@Component({
  selector: 'mcs-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'search-wrapper'
  }
})

export class SearchComponent implements OnInit, AfterContentInit, OnDestroy, Search {
  @Input()
  public delayInSeconds: number | 'none' = 'none';

  @Input()
  public set defaultValue(value: string) {
    if (!isNullOrEmpty(value)) {
      this._defaultValue = value;
      this.keyword = this._defaultValue;
      this._notifySearchKeywordChange();
    }
  }

  public get defaultValue(): string {
    return this._defaultValue;
  }

  public generatedId: string;
  public keyword: string;
  public searching: boolean;
  private _defaultValue: string = '';
  public searchChangedStream: EventEmitter<any>;

  private _searchSubject: Subject<string>;
  private _destroySubject = new Subject<void>();

  @ContentChild(IdDirective)
  private _idElement: IdDirective;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this._searchSubject = new Subject<string>();
    this.searchChangedStream = new EventEmitter<any>();
  }

  public ngOnInit(): void {
    this._subscribeToSearchChange();
  }

  public ngAfterContentInit() {
    Promise.resolve().then(() => {
      this.generatedId = isNullOrEmpty(this._idElement) ?
        McsUniqueId.NewId('search') :
        this._idElement.generateNewHashId();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.searchChangedStream);
    unsubscribeSafely(this._searchSubject);
    unsubscribeSafely(this._destroySubject);
  }

  public get searchIconKey(): string {
    return CommonDefinition.ASSETS_SVG_SEARCH;
  }

  public onChangeKeyEvent(searchKeyword: string): void {
    this.keyword = searchKeyword;
    this._searchSubject.next(searchKeyword);
  }

  public onEnterKeyUpEvent(searchKeyword: string): void {
    if (searchKeyword === this.keyword) { return; }

    this.keyword = searchKeyword;
    this._notifySearchKeywordChange();
  }

  public showLoading(showLoading: boolean): void {
    this.searching = showLoading;
    this._changeDetectorRef.markForCheck();
  }

  private _subscribeToSearchChange(): void {
    this._searchSubject.pipe(
      takeUntil(this._destroySubject),
      debounceTime(this.delayInSeconds === 'none' ?
        CommonDefinition.SEARCH_TIME :
        (this.delayInSeconds as number * 1000)
      ),
      distinctUntilChanged()
    ).subscribe(() => this._notifySearchKeywordChange());
  }

  private _notifySearchKeywordChange() {
    this.showLoading(true);
    this.searchChangedStream.emit(this);
    this._changeDetectorRef.markForCheck();
  }

  public clear(): void {
    this._defaultValue = '';
    this.keyword = this._defaultValue;
    this._notifySearchKeywordChange();
  }
}
