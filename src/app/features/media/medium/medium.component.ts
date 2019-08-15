import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  throwError,
  Subject,
  Observable
} from 'rxjs';
import {
  catchError,
  takeUntil,
  startWith,
  tap,
  shareReplay,
  map
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsRoutingTabBase,
  McsDataStatusFactory,
  McsNavigationService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import {
  RouteKey,
  McsResourceMedia
} from '@app/models';
import {
  Search,
  ComponentHandlerDirective
} from '@app/shared';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import { MediaListSource } from '../media.listsource';
import { MediumService } from './medium.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview' | 'servers';

@Component({
  selector: 'mcs-medium',
  templateUrl: './medium.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediumComponent
  extends McsRoutingTabBase<tabGroupType>
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: Search;

  @ViewChild(ComponentHandlerDirective)
  public componentHandler: ComponentHandlerDirective;

  public media$: Observable<McsResourceMedia>;
  public mediaListing$: Observable<Map<string, McsResourceMedia[]>>;
  public mediaListSource: MediaListSource | null;
  public mediaMap: Map<string, McsResourceMedia[]>;
  public listStatusFactory: McsDataStatusFactory<Map<string, McsResourceMedia[]>>;

  private _destroySubject = new Subject<void>();

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public constructor(
    _eventDispatcher: EventBusDispatcherService,
    _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _mediumService: MediumService
  ) {
    super(_eventDispatcher, _activatedRoute);
    this.listStatusFactory = new McsDataStatusFactory(_changeDetectorRef);
  }

  public ngOnInit() {
    super.onInit();
    this._subscribeToMediumResolve();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.search.searchChangedStream
        .pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this.listStatusFactory.setInProgress());
      this._initializeListsource();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get angleDoubleRightIconKey(): string {
    return CoreDefinition.ASSETS_SVG_NEXT_ARROW;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Navigate to media listing
   */
  public gotoMedia(): void {
    this._navigationService.navigateTo(RouteKey.Media);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    this._navigationService.navigateTo(RouteKey.Medium, [this.paramId, tab.id]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string) {
    if (isNullOrEmpty(id)) { return; }
    this._mediumService.setMediaId(id);
    if (!isNullOrEmpty(this.componentHandler)) {
      this.componentHandler.recreateComponent();
    }
  }

  /**
   * Subcribes to medium resolve
   */
  private _subscribeToMediumResolve(): void {
    this.media$ = this.activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.medium)),
      tap((medium) => this._mediumService.setSelectedMedium(medium)),
      shareReplay(1)
    );
  }

  /**
   * Initializes the list source of the media
   */
  private _initializeListsource(): void {
    this.mediaListSource = new MediaListSource(
      this._apiService,
      this.search
    );

    // Key function pointer for mapping objects
    let keyFn = (item: McsResourceMedia) => {
      return getSafeProperty(item, (obj) => obj.catalogName, 'Others');
    };

    // Listen to all records changed
    this.mediaListing$ = this.mediaListSource.findAllRecordsMapStream(keyFn).pipe(
      catchError((error) => {
        this.listStatusFactory.setError();
        return throwError(error);
      }),
      tap((response) => {
        this.search.showLoading(false);
        this.listStatusFactory.setSuccessful(response);
      })
    );
    this._changeDetectorRef.markForCheck();
  }
}
