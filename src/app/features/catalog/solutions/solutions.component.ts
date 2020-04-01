import {
  ChangeDetectionStrategy,
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  map,
  tap,
  shareReplay
} from 'rxjs/operators';
import { McsNavigationService } from '@app/core';
import {
  RouteKey,
  CatalogViewType,
  McsCatalogSolutionBracket
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty,
  createObject
} from '@app/utilities';
import { CatalogService } from '../catalog.service';
import {
  CatalogItemDetails,
  CatalogHeader,
  CatalogType
} from '../shared';

@Component({
  selector: 'mcs-catalog-solutions',
  templateUrl: './solutions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolutionsComponent implements OnInit {

  public solutionCatalog$: Observable<McsCatalogSolutionBracket>;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _catalogService: CatalogService,
    private _navigationService: McsNavigationService
  ) { }

  public ngOnInit(): void {
    this._subscribeToSolutionsResolver();
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public onSolutionChange(id: string): void {
    if (isNullOrEmpty(id)) { return; }
    this._navigationService.navigateTo(RouteKey.CatalogSolution, [id]);
  }

  private _subscribeToSolutionsResolver(): void {
    this.solutionCatalog$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.solutions)),
      tap((solutions) => {
        if (isNullOrEmpty(solutions)) { return; }
        this._catalogService.updateActiveCatalogItemDetails(createObject(CatalogItemDetails, {
          catalogViewType: CatalogViewType.Solutions,
          catalogType: CatalogType.Solutions,
          header: createObject(CatalogHeader, {
            title: 'Solutions'
          })
        }));
        this._catalogService.updateCatalogItemMenuByType(CatalogType.Solutions, false);
      }),
      shareReplay(1)
    );
  }
}
