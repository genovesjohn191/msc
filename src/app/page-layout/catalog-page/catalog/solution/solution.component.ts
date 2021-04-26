import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  finalize,
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { EnquiryformViewModel } from '@app/features-shared';
import {
  CatalogViewType,
  McsCatalogEnquiryRequest,
  McsCatalogProductUseCase,
  McsCatalogSolution,
  McsStateNotification,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { ScrollableLinkGroup } from '@app/shared';
import {
  createObject,
  getSafeFormValue,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

import { CatalogService } from '../catalog.service';
import {
  CatalogHeader,
  CatalogItemDetails,
  CatalogType
} from '../shared';

@Component({
  selector: 'mcs-catalog-solution',
  templateUrl: './solution.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'product-wrapper'
  }
})
export class SolutionComponent implements OnInit {
  public showEnquiryForm: boolean;
  public selectedUseCase$: Observable<McsCatalogProductUseCase>;
  public solution$: Observable<McsCatalogSolution>;

  public benefitAndLimitationColumns = ['benefit', 'limitation'];

  @ViewChild('scrollableLinkGroup')
  private _scrollableLink: ScrollableLinkGroup;

  private _selectedUseCaseChange = new BehaviorSubject<McsCatalogProductUseCase>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute,
    private _catalogService: CatalogService,
    private _apiService: McsApiService,
    private _eventBusDispatcher: EventBusDispatcherService
  ) { }

  public ngOnInit(): void {
    this._subscribeToSelectedUseCaseChange();
    this._subscribeToSolutionResolver();
  }

  public get cloudIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOUD_BLUE;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public onClickUseCase(useCase: McsCatalogProductUseCase): void {
    this._selectedUseCaseChange.next(useCase);
  }

  public onSubmitEnquiry(viewmodel: EnquiryformViewModel, productId: string): void {
    if (isNullOrEmpty(viewmodel)) { return; }

    let enquiryRequest = new McsCatalogEnquiryRequest();
    enquiryRequest.notes = getSafeFormValue(viewmodel.fcNote, obj => obj.value);
    enquiryRequest.preferredContactMethod = +getSafeFormValue(viewmodel.fcContact, obj => obj.value);

    this._apiService.createCatalogSolutionEnquiry(productId, enquiryRequest)
      .pipe(
        tap(() => {
          this._eventBusDispatcher.dispatch(McsEvent.stateNotificationShow,
            new McsStateNotification('success', 'message.requestSubmitted'));
        }),
        finalize(() => {
          this.showEnquiryForm = false;
          this._changeDetectorRef.markForCheck();
        })
      ).subscribe();
  }

  private _subscribeToSelectedUseCaseChange(): void {
    this.selectedUseCase$ = this._selectedUseCaseChange.pipe(
      takeUntil(this._destroySubject)
    );
  }

  private _subscribeToSolutionResolver(): void {
    this.solution$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.solution)),
      tap((solution) => {
        if (!isNullOrEmpty(solution)) {
          let catalogItemDetails = new CatalogItemDetails();
          catalogItemDetails.id = solution.id;
          catalogItemDetails.data = solution;
          catalogItemDetails.catalogViewType = CatalogViewType.Solution;
          catalogItemDetails.catalogType = CatalogType.Solutions;
          catalogItemDetails.header = createObject(CatalogHeader, {
            title: solution.name,
            version: solution.version || ''
          });

          this._catalogService.updateActiveCatalogItemDetails(catalogItemDetails);
          this._catalogService.updateCatalogItemMenuByType(CatalogType.Solutions, true);
        }
        if (isNullOrEmpty(this._scrollableLink)) { return; }
        this._scrollableLink.reset();
        this.showEnquiryForm = false;
        this._changeDetectorRef.markForCheck();
      }),
      shareReplay(1)
    );
  }
}
