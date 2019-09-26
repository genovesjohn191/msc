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
  ContentChild,
  Output
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';
import { McsUniqueId } from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
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

  @Output()
  public searchChange = new EventEmitter<Search>();

  /** Interface implementation */
  public generatedId: string;
  public keyword: string;
  public searching: boolean;
  public searchChangedStream: EventEmitter<any>;

  /** Search subscription */
  private _searchSubject: Subject<string>;
  private _destroySubject = new Subject<void>();

  @ContentChild(IdDirective, { static: false })
  private _idElement: IdDirective;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.keyword = '';
    this._searchSubject = new Subject<string>();
    this.searchChangedStream = new EventEmitter<any>();
  }

  public ngOnInit(): void {
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
    unsubscribeSafely(this.searchChangedStream);
    unsubscribeSafely(this._searchSubject);
    unsubscribeSafely(this._destroySubject);
  }

  public get searchIconKey(): string {
    return CommonDefinition.ASSETS_SVG_SEARCH;
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
    this._searchSubject.pipe(
      takeUntil(this._destroySubject),
      debounceTime(this.delayInSeconds === 'none' ?
        CommonDefinition.SEARCH_TIME :
        (this.delayInSeconds as number * 1000)
      ),
      distinctUntilChanged()
    ).subscribe((searchTerm) => {
      this.keyword = searchTerm;
      this._onSearchChanged();
    });
  }

  /**
   * Emits all changes on the search and notify all subscribers
   */
  private _onSearchChanged() {
    this.showLoading(true);
    this.searchChange.next(this);
    this.searchChangedStream.emit(this);
    this._changeDetectorRef.markForCheck();
  }
}
