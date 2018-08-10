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
import {
  Subscription,
  throwError,
  Subject
} from 'rxjs';
import {
  catchError,
  takeUntil,
  startWith
} from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsErrorHandlerService,
  CoreDefinition,
  CoreRoutes,
  McsRouteKey,
  McsRoutingTabBase,
  McsSearch,
  McsDataStatusFactory
} from '../../../core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  unsubscribeSubject,
  getSafeProperty
} from '../../../utilities';
import { Media } from '../models';
import { MediaRepository } from '../repositories/media.repository';
import { ComponentHandlerDirective } from '../../../shared';
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
  public search: McsSearch;

  @ViewChild(ComponentHandlerDirective)
  public componentHandler: ComponentHandlerDirective;

  public textContent: any;
  public mediaTextContent: any;
  public selectedMedium: Media;
  public mediumSubscription: Subscription;
  public mediaListSource: MediaListSource | null;
  public mediaMap: Map<string, Media[]>;
  public listStatusFactory: McsDataStatusFactory<Map<string, Media[]>>;
  private _destroySubject = new Subject<void>();

  public constructor(
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _mediaRepository: MediaRepository,
    private _mediumService: MediumService
  ) {
    super(_router, _activatedRoute);
    this.selectedMedium = new Media();
    this.listStatusFactory = new McsDataStatusFactory(_changeDetectorRef);
  }

  public ngOnInit() {
    this.mediaTextContent = this._textContentProvider.content.media;
    this.textContent = this.mediaTextContent.medium;
    // Initialize base class
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
    unsubscribeSafely(this.mediumSubscription);
    unsubscribeSubject(this._destroySubject);
  }

  public get angleDoubleRightIconKey(): string {
    return CoreDefinition.ASSETS_SVG_NEXT_ARROW;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  /**
   * Navigate to media listing
   */
  public gotoMedia(): void {
    this.router.navigate([CoreRoutes.getPath(McsRouteKey.Media)]);
  }

  /**
   * Event that emits when the media is selected on the list panel
   * @param media Selected media instance
   */
  public onMediumSelect(medium: Media): void {
    if (isNullOrEmpty(medium)) { return; }
    this.router.navigate([CoreRoutes.getPath(McsRouteKey.Media), medium.id]);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  protected onTabChanged(tab: any) {
    this.router.navigate([
      CoreRoutes.getPath(McsRouteKey.Media),
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
    this._getMediumById(id);
    this._setSelectedMediumById(id);
  }

  private _getMediumById(mediumId: string): void {
    this.mediumSubscription = this._mediaRepository
      .findRecordById(mediumId)
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      )
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this._setSelectedMediumById(response.id);
      });
  }

  private _setSelectedMediumById(mediumId: string): void {
    if (isNullOrEmpty(mediumId)) { return; }

    // Set the selection of server based on its ID
    let mediumFound = this._mediaRepository.dataRecords
      .find((server) => server.id === mediumId);
    if (isNullOrEmpty(mediumFound)) {
      this.selectedMedium = { id: mediumId } as Media;
      return;
    }
    this.selectedMedium = mediumFound;
    this._mediumService.setSelectedMedium(this.selectedMedium);
    this._changeDetectorRef.markForCheck();
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
    let keyFn = (item: Media) => {
      return getSafeProperty(item, (obj) => obj.catalogName, 'Others');
    };

    // Listen to all records changed
    this.mediaListSource.findAllRecordsMapStream(keyFn)
      .pipe(
        takeUntil(this._destroySubject),
        catchError((error) => {
          this.listStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.mediaMap = response;
        this.search.showLoading(false);
        this.listStatusFactory.setSuccessful(response);
      });
  }
}
