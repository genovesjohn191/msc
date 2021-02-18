import {
  Observable,
  Subject
} from 'rxjs';
import {
  filter,
  map,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  forwardRef,
  Directive,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import { SearchComponent } from '../search';

@Directive({
  selector: '[mcsSelectSearch]',
  host: {
    'class': 'select-search-wrapper'
  }
})

export class SelectSearchDirective implements OnInit, OnDestroy {
  public focusReceive = new Subject<void>();

  private _searchChange = new Subject<string>();
  private _destroySubject = new Subject<void>();

  constructor(@Inject(forwardRef(() => SearchComponent)) private _searchHost: SearchComponent) {
  }

  public ngOnInit(): void {
    this._validateSearchControl();
    this._subscribeToSearchControl();
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
    this._searchHost.searchChangedStream.pipe(
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
    if (!isNullOrEmpty(this._searchHost)) { return; }
    throw new Error('Unable to find search component on select-search element.');
  }
}
