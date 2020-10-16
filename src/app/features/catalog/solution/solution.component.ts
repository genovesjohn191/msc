import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  map,
  tap,
  shareReplay
} from 'rxjs/operators';
import {
  McsCatalogSolution,
  RouteKey,
  CatalogViewType
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition,
  createObject
} from '@app/utilities';
import { ScrollableLinkGroup } from '@app/shared';
import { CatalogService } from '../catalog.service';
import {
  CatalogType,
  CatalogHeader,
  CatalogItemDetails
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

  public solution$: Observable<McsCatalogSolution>;

  public benefitAndLimitationColumns = ['benefit', 'limitation'];

  @ViewChild('scrollableLinkGroup')
  private _scrollableLink: ScrollableLinkGroup;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _catalogService: CatalogService
  ) { }

  public ngOnInit(): void {
    this._subscribeToSolutionResolver();
  }

  public get cloudIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOUD_BLUE;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
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
