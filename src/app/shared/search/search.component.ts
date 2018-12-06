import {
  Component,
  Input,
  OnInit,
  AfterContentInit,
  OnDestroy,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ContentChild
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsUniqueId
} from '@app/core';
import {
  unsubscribeSubject,
  isNullOrEmpty
} from '@app/utilities';
import { Search } from './search.interface';
import { IdDirective } from '../directives';

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
  public textContent: any;

  /** Interface implementation */
  public generatedId: string;
  public keyword: string;
  public searching: boolean;
  public searchChangedStream: EventEmitter<any>;

  /** Search subscription */
  private _searchSubject: Subject<string>;
  private _destroySubject = new Subject<void>();

  @ContentChild(IdDirective)
  private _idElement: IdDirective;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.keyword = '';
    this._searchSubject = new Subject<string>();
    this.searchChangedStream = new EventEmitter<any>();
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.shared.search;
    this._createSearchSubject();
  }

  public ngAfterContentInit() {
    Promise.resolve().then(() => {
      this.generatedId = isNullOrEmpty(this._idElement) ?
        McsUniqueId.NewId('search') :
        this._idElement.generateNewHashId();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  public get searchIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SEARCH;
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
