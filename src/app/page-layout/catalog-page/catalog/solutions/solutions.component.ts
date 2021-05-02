import {
  combineLatest,
  of,
  Observable
} from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  McsErrorHandlerService,
  McsNavigationService
} from '@app/core';
import {
  CatalogViewType,
  HttpStatusCode,
  McsCatalogSolution,
  McsCatalogSolutionBracket,
  McsCatalogSolutionGroup,
  RouteKey
} from '@app/models';
import { Search } from '@app/shared';
import {
  containsString,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  TreeDatasource,
  TreeGroup,
  TreeItem,
  TreeUtility
} from '@app/utilities';

import { CatalogService } from '../catalog.service';
import {
  CatalogHeader,
  CatalogItemDetails,
  CatalogType
} from '../shared';

@Component({
  selector: 'mcs-catalog-solutions',
  templateUrl: './solutions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SolutionsComponent implements OnInit {
  public treeDatasource = new TreeDatasource<McsCatalogSolutionGroup>(null);

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _catalogService: CatalogService,
    private _navigationService: McsNavigationService,
    private _errorHandlerService: McsErrorHandlerService
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
    combineLatest([
      this._activatedRoute.data,
      this._catalogService.useCaseSearchRefChange()
    ]).pipe(
      map(([resolver, useCaseFilter]) => {
        let solutions = getSafeProperty(resolver, (obj) => obj.solutions) as McsCatalogSolutionBracket;
        this._updateSolutionDetails(solutions, useCaseFilter);
        return solutions;
      }),
      tap(solutions => {
        if (isNullOrEmpty(solutions)) {
          this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
        }

        let catalogItemDetails = new CatalogItemDetails();
        catalogItemDetails.catalogViewType = CatalogViewType.Solutions;
        catalogItemDetails.catalogType = CatalogType.Solutions;
        catalogItemDetails.header = createObject(CatalogHeader, {
          title: 'Solutions'
        });

        this._catalogService.updateActiveCatalogItemDetails(catalogItemDetails);
        this._catalogService.updateCatalogItemMenuByType(CatalogType.Solutions, false);
      })
    ).subscribe();
  }

  private _updateSolutionDetails(
    details: McsCatalogSolutionBracket,
    search: Search
  ): void {
    this.treeDatasource.updateDatasource(this._convertFamiliesToTreeItems.bind(this, details));
    this.treeDatasource
      .registerSearch(search)
      .registerSearchPredicate(this._useCaseFilterPredicate.bind(this));
  }

  private _convertFamiliesToTreeItems(details: McsCatalogSolutionBracket): Observable<TreeItem<any>[]> {
    return of(TreeUtility.convertEntityToTreemItems(
      details?.groups,
      group => new TreeGroup(group.name, group.id, group.solutions),
      solution => new TreeGroup(solution.name)
    ));
  }

  private _useCaseFilterPredicate(
    solution: McsCatalogSolution,
    keyword: string
  ): boolean {
    if (isNullOrEmpty(keyword)) { return true; }
    // We want to skip those are not solution instance in the searching
    if (!(solution instanceof McsCatalogSolution)) { return false; }

    let useCases = solution.useCases || [];
    let useCaseFound = useCases.find(useCase => {
      if (typeof useCase === 'string') {
        return containsString(useCase, keyword);
      }

      return containsString(useCase.name, keyword) ||
        containsString(useCase.description, keyword);
    });
    return !isNullOrEmpty(useCaseFound);
  }
}
