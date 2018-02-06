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
import {
  Observable,
  Subject,
  Subscription
} from 'rxjs/Rx';
import {
  CoreDefinition,
  McsSearch,
  McsTextContentProvider
} from '../../core';
import { unsubscribeSafely } from '../../utilities';

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

export class SearchComponent implements OnInit, OnDestroy, McsSearch {

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
  private _searchSubscription: Subscription;

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
    this._createSearchSubscription();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._searchSubscription);
  }

  public onChangeKeyEvent(key: any): void {
    // Register the event for the searching when it is closed already
    if (this._searchSubscription.closed) {
      this._createSearchSubscription();
    }
    this._searchSubject.next(key);
  }

  public onEnterKeyUpEvent(key: any): void {
    // We need to unsubcribed to the current subject in order for the
    // event not to trigger anymore
    unsubscribeSafely(this._searchSubscription);
    this.keyword = key;
    this._onSearchChanged();
  }

  public showLoading(showLoading: boolean): void {
    this.searching = showLoading;
    this.iconKey = showLoading ?
      CoreDefinition.ASSETS_GIF_SPINNER :
      CoreDefinition.ASSETS_FONT_SEARCH;
    this._changeDetectorRef.markForCheck();
  }

  private _onSearchChanged() {
    this.showLoading(true);
    this.searchChangedStream.next(this);
    this._changeDetectorRef.markForCheck();
  }

  private _createSearchSubscription(): void {
    // Register stream event for the filtering,
    // This will invoke once the previous keyword and new keyword is not the same
    // @ the given amount of time
    this._searchSubscription = Observable.concat(this._searchSubject)
      .debounceTime(this.delayInSeconds === 'none' ?
        CoreDefinition.SEARCH_TIME : (this.delayInSeconds as number * 1000)
      )
      .distinctUntilChanged()
      .subscribe((searchTerm) => {
        this.keyword = searchTerm;
        this._onSearchChanged();
      });
  }
}
