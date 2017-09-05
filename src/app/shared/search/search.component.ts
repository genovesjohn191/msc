import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter
} from '@angular/core';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  CoreDefinition,
  McsSearch,
  McsTextContentProvider
} from '../../core';
import { isNullOrEmpty } from '../../utilities';

@Component({
  selector: 'mcs-search',
  templateUrl: './search.component.html',
  styles: [require('./search.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchComponent implements OnInit, OnDestroy, McsSearch {

  @Input()
  public delay: number;
  public textContent: any;

  /** Interface implementation */
  public keyword: string;
  public searchChangedStream: EventEmitter<any>;

  /** Search subscription */
  private _searchSubject: BehaviorSubject<string>;
  private _searchSubscription: any;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
    this.keyword = '';
    this._searchSubject = new BehaviorSubject<string>('');
    this.searchChangedStream = new EventEmitter<any>();
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.shared.search;
    // Register stream event for the filtering,
    // This will invoke once the previous keyword and new keyword is not the same
    // @ the given amount of time
    this._searchSubscription = Observable.concat(this._searchSubject)
      .debounceTime(isNullOrEmpty(this.delay) ? CoreDefinition.SEARCH_TIME : this.delay)
      .distinctUntilChanged()
      .subscribe((searchTerm) => {
        this.keyword = searchTerm;
        this._onSearchChanged();
      });
  }

  public ngOnDestroy(): void {
    if (this._searchSubscription) {
      this._searchSubscription.unsubscribe();
    }
  }

  public onChangeKeyEvent(key: any): void {
    this._searchSubject.next(key);
  }

  public onEnterKeyUpEvent(key: any): void {
    this.keyword = key;
    this._onSearchChanged();
  }

  private _onSearchChanged() {
    this.searchChangedStream.next(this);
    this._changeDetectorRef.markForCheck();
  }
}
