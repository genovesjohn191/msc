import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CatalogViewType,
  McsCatalogProductUseCase,
  McsCatalogSolution,
  RouteKey
} from '@app/models';
import { ScrollableLinkGroup } from '@app/shared';
import {
  createObject,
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
  public selectedUseCase$: Observable<McsCatalogProductUseCase>;
  public solution$: Observable<McsCatalogSolution>;

  public benefitAndLimitationColumns = ['benefit', 'limitation'];

  @ViewChild('scrollableLinkGroup')
  private _scrollableLink: ScrollableLinkGroup;

  private _selectedUseCaseChange = new BehaviorSubject<McsCatalogProductUseCase>(null);
  private _destroySubject = new Subject<void>();

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _catalogService: CatalogService
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
          this._catalogService.updateActiveCatalogItemDetails(createObject(CatalogItemDetails, {
            id: solution.id,
            catalogViewType: CatalogViewType.Solution,
            catalogType: CatalogType.Solutions,
            header: createObject(CatalogHeader, {
              title: solution.name,
              version: solution.version || ''
            })
          }));
          this._catalogService.updateCatalogItemMenuByType(CatalogType.Solutions, true);
        }
        if (isNullOrEmpty(this._scrollableLink)) { return; }
        this._scrollableLink.reset();
      }),
      shareReplay(1)
    );
  }
}
