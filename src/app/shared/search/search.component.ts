import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsSearch,
  McsTextContentProvider
} from '../../core';
import { unsubscribeSubject } from '../../utilities';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'search-wrapper',
    '[attr.id]': 'id'
  }
})

export class SearchComponent implements OnInit, OnDestroy, McsSearch {
  @Input()
  public id: string = `mcs-search-${nextUniqueId++}`;

  @Input()
  public delayInSeconds: number | 'none' = 'none';
  public textContent: any;

  /** Interface implementation */
  public keyword: string;
  public searching: boolean;
  public searchChangedStream: EventEmitter<any>;

  // Others
  public iconKey: string;

  /** Search subscription */
  private _searchSubject: Subject<string>;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.keyword = '';
    this.iconKey = CoreDefinition.ASSETS_FONT_SEARCH;
    this._searchSubject = new Subject<string>();
    this.searchChangedStream = new EventEmitter<any>();
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.shared.search;
    this._createSearchSubject();
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Event that emits when the key has been chaged
   */
  public onChangeKeyEvent(key: any): void {
    this._searchSubject.next(key);
  }

  /**
   * Event that emits when the ENTER key is pressed
   * @param key Key value entered
   */
  public onEnterKeyUpEvent(key: any): void {
    if (key === this.keyword) { return; }
    this._searchSubject.next(key);
    this._destroySubject.next();
    this._createSearchSubject();
  }

  /**
   * Show/Hide the loader according to its display flag
   * @param showLoading Loading flag to be set as the basis
   */
  public showLoading(showLoading: boolean): void {
    this.searching = showLoading;
    this.iconKey = showLoading ?
      CoreDefinition.ASSETS_GIF_SPINNER :
      CoreDefinition.ASSETS_FONT_SEARCH;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Creates the search subject for searching
   */
  private _createSearchSubject(): void {
    this._searchSubject
      .pipe(
        takeUntil(this._destroySubject),
        debounceTime(this.delayInSeconds === 'none' ?
          CoreDefinition.SEARCH_TIME :
          (this.delayInSeconds as number * 1000)
        ),
        distinctUntilChanged()
      )
      .subscribe((searchTerm) => {
        this.keyword = searchTerm;
        this._onSearchChanged();
      });
  }

  /**
   * Emits all changes on the search and notify all subscribers
   */
  private _onSearchChanged() {
    this.showLoading(true);
    this.searchChangedStream.emit(this);
    this._changeDetectorRef.markForCheck();
  }
}
