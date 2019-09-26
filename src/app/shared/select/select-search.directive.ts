import {
  Directive,
  ContentChild,
  AfterContentInit,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs';
import {
  takeUntil,
  map,
  tap,
  filter
} from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import {
  Search,
  SearchComponent
} from '../search';

@Directive({
  selector: '[mcsSelectSearch]',
  host: {
    'class': 'select-search-wrapper'
  }
})

export class SelectSearchDirective implements AfterContentInit, OnDestroy {

  public focusReceive = new Subject<void>();

  @ContentChild(SearchComponent, { static: false })
  private _search: Search;

  private _searchChange = new Subject<string>();
  private _destroySubject = new Subject<void>();

  public ngAfterContentInit(): void {
    Promise.resolve().then(() => {
      this._validateSearchControl();
      this._subscribeToSearchControl();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._searchChange);
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event that emits when the search keyword has been changed
   */
  public searchChange(): Observable<string> {
    return this._searchChange.asObservable();
  }

  /**
   * Subscribes to search control component
   */
  private _subscribeToSearchControl(): void {
    this._search.searchChangedStream.pipe(
      takeUntil(this._destroySubject),
      filter((searchControl) => !isNullOrEmpty(searchControl)),
      tap((searchControl) => searchControl.showLoading(false)),
      map((searchControl) => searchControl.keyword)
    ).subscribe(this._searchChange);
  }

  /**
   * Validates the search control component is declared
   */
  private _validateSearchControl(): void {
    if (!isNullOrEmpty(this._search)) { return; }
    throw new Error('Unable to find search component on select-search element.');
  }
}
