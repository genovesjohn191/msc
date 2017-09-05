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
  Subject,
  BehaviorSubject
} from 'rxjs/Rx';
import {
  CoreDefinition,
  McsSearch
} from '../../core';
import { isNullOrEmpty } from '../../utilities';

@Component({
  selector: 'mcs-search',
  templateUrl: './search.component.html',
  styles: [require('./search.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchComponent implements OnInit, OnDestroy, McsSearch {

  /** Search subscription */
  public searchSubject: BehaviorSubject<string>;
  public searchSubscription: any;

  /** Interface implementation */
  public keyword: string;
  public searchChangedStream: EventEmitter<any>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.keyword = '';
    this.searchSubject = new BehaviorSubject<string>('');
    this.searchChangedStream = new EventEmitter<any>();
  }

  public ngOnInit(): void {
    // Register stream event for the filtering,
    // This will invoke once the previous keyword and new keyword is not the same
    // @ the given amount of time
    this.searchSubscription = Observable.concat(this.searchSubject)
      .debounceTime(CoreDefinition.SEARCH_TIME)
      .distinctUntilChanged()
      .subscribe((searchTerm) => {
        this.keyword = searchTerm;
        this._onSearchChanged();
      });
  }

  public ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  public onChangeKeyEvent(key: any): void {
    this.searchSubject.next(key);
  }

  public onEnterKeyUpEvent(key: any): void {
    this.searchSubject.next(key);
  }

  private _onSearchChanged() {
    this.searchChangedStream.next(this);
    this._changeDetectorRef.markForCheck();
  }
}
