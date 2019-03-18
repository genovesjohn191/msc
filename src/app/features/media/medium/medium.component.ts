import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
  finalize
} from 'rxjs/operators';
import {
  McsErrorHandlerService,
  CoreDefinition,
  CoreRoutes,
  McsRoutingTabBase,
  McsDataStatusFactory,
  McsLoadingService
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
import { McsMediaRepository } from '@app/services';
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
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _loadingService: McsLoadingService,
    private _errorHandlerService: McsErrorHandlerService,
    private _mediaRepository: McsMediaRepository,
    private _mediumService: MediumService
  ) {
    super(_router, _activatedRoute);
    this.listStatusFactory = new McsDataStatusFactory(_changeDetectorRef);
  }

  public ngOnInit() {
    super.onInit();
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
    this.router.navigate([CoreRoutes.getNavigationPath(RouteKey.Media)]);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    this.router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.Medium),
      this.paramId,
      tab.id
    ]);
  }

  /**
   * Event that emits when the parameter id is changed
   * @param id Id of the parameter
   */
  protected onParamIdChanged(id: string) {
    if (isNullOrEmpty(id)) { return; }

    // We need to recreate the component in order for the
    // component to generate new instance
    if (!isNullOrEmpty(this.componentHandler)) {
      this.componentHandler.recreateComponent();
    }
    this._subscribeToMediaById(id);
  }

  /**
   * Subscribes to media based on the ID pProvided
   * @param mediumId Media id to be selected
   */
  private _subscribeToMediaById(mediumId: string): void {
    this._loadingService.showLoader(this._translateService.instant('mediaMedium.loading'));
    this.media$ = this._mediaRepository.getById(mediumId).pipe(
      catchError((error) => {
        this._errorHandlerService.redirectToErrorPage(error.status);
        return throwError(error);
      }),
      tap((media) => this._mediumService.setSelectedMedium(media)),
      finalize(() => this._loadingService.hideLoader()),
      shareReplay(1)
    );
  }

  /**
   * Initializes the list source of the media
   */
  private _initializeListsource(): void {
    this.mediaListSource = new MediaListSource(
      this._mediaRepository,
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
