import {
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
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterEvent
} from '@angular/router';
import {
  CoreRoutes,
  ListViewListingConfig,
  McsAccessControlService,
  McsErrorHandlerService,
  McsListViewDatasource,
  McsNavigationService
} from '@app/core';
import {
  CatalogViewType,
  HttpStatusCode,
  McsCatalog,
  McsCatalogProduct,
  McsCatalogProductBracket,
  McsCatalogProductFamily,
  McsCatalogProductPlatform,
  McsCatalogSolution,
  McsCatalogSolutionBracket,
  McsCatalogSolutionGroup,
  McsFeatureFlag,
  McsOption,
  RouteKey
} from '@app/models';
import { Search } from '@app/shared';
import {
  cloneObject,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { CatalogService } from './catalog.service';
import {
  catalogTypeText,
  CatalogItem,
  CatalogItemDetails,
  CatalogItemMenu,
  CatalogType
} from './shared';

@Component({
  selector: 'mcs-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [CatalogService],
  host: {
    'class': 'catalog-wrapper'
  }
})
export class CatalogComponent implements OnInit, OnDestroy {
  public catalogOptions$: Observable<McsOption[]>;
  public catalogItemMenu$: Observable<CatalogItemMenu>;
  public activeCatalogItemDetails$: Observable<CatalogItemDetails>;

  public listViewConfig: ListViewListingConfig;
  public listviewDatasource = new McsListViewDatasource<McsCatalogProductPlatform[] | McsCatalogSolutionGroup[]>();

  private _search: Search;
  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _translate: TranslateService,
    private _catalogService: CatalogService,
    private _accessControlService: McsAccessControlService,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  public ngOnInit(): void {
    this._initializeListViewConfig();
    this._subscribeToCatalogResolver();
    this._subscribeToCatalogItemDetailsChange();
    this._subscribeToCatalogItemMenuChange();
    this._subscribeToRouterChange();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (this._search !== value) {
      this._search = value;
      this.listviewDatasource.registerSearch(value);
      this.listviewDatasource.registerSearchPredicate(this._onFilterRecords.bind(this));
    }
  }

  @ViewChild('useCaseSearch')
  public set useCaseSearch(value: Search) {
    if (!isNullOrEmpty(value)) {
      this._catalogService.updateUseCaseSeachRef(value);
    }
  }

  public get catalogViewTypeEnum(): typeof CatalogViewType {
    return CatalogViewType;
  }

  public get catalogTypeEnum(): typeof CatalogType {
    return CatalogType;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public onCatalogTypeChange(
    selectedCatalogType: CatalogType,
    currentViewType: CatalogViewType,
    currentCatalogType: CatalogType
  ): void {
    if (isNullOrEmpty(selectedCatalogType) || currentCatalogType === selectedCatalogType) { return; }

    let isItemDetailsViewType = currentViewType === CatalogViewType.Solution || currentViewType === CatalogViewType.Product;
    if (isItemDetailsViewType) {
      this._catalogService.updateCatalogItemMenuByType(selectedCatalogType, true);
      return;
    }

    if (selectedCatalogType === CatalogType.Solutions) {
      this._navigationService.navigateTo(RouteKey.CatalogSolutions);
      return;
    }

    this._navigateToDefaultView(this._catalogService.catalogOptionsCached);
  }

  public onProductsPlatformChange(platform: McsCatalogProductPlatform): void {
    if (isNullOrEmpty(platform)) { return; }
    this._navigationService.navigateTo(RouteKey.CatalogProductsPlatform, [platform.id]);
  }

  public onProductChange(id: string): void {
    if (isNullOrEmpty(id)) { return; }
    this._navigationService.navigateTo(RouteKey.CatalogProduct, [id]);
  }

  public onSolutionChange(id: string): void {
    if (isNullOrEmpty(id)) { return; }
    this._navigationService.navigateTo(RouteKey.CatalogSolution, [id]);
  }

  public sortPlatforms(platforms: McsCatalogProductPlatform[]): McsCatalogProductPlatform[] {
    return platforms.sort(this._sortPlatformPredicate.bind(this));
  }

  private _subscribeToCatalogResolver(): void {
    this.catalogOptions$ = this._activatedRoute.data.pipe(
      map((resolver) => {
        let catalog = getSafeProperty(resolver, (obj) => obj.catalog) as McsCatalog;
        let catalogOptions: McsOption[] = [];

        let products = createObject(CatalogItem, {
          type: CatalogType.Products,
          content: catalog.productCatalog
        });
        catalogOptions.push(new McsOption(products, catalogTypeText[CatalogType.Products]));

        if (this._accessControlService.hasAccessToFeature(McsFeatureFlag.CatalogSolutionListing)) {
          let solutions = createObject(CatalogItem, {
            type: CatalogType.Solutions,
            content: catalog.solutionCatalog
          });
          catalogOptions.push(new McsOption(solutions, catalogTypeText[CatalogType.Solutions]));
        }

        return catalogOptions;
      }),
      tap((response) => {
        // Save the whole catalog options
        this._catalogService.catalogOptionsCached = response;
        if (this._isBaseCatalogRoute(this._router.url)) {
          this._navigateToDefaultView(this._catalogService.catalogOptionsCached);
        }
      }),
      shareReplay(1)
    );
  }

  private _subscribeToCatalogItemMenuChange(): void {
    this.catalogItemMenu$ = this._catalogService.catalogItemMenuChange.pipe(
      takeUntil(this._destroySubject),
      tap((catalogItemMenu: CatalogItemMenu) => {
        let content = getSafeProperty(catalogItemMenu, (obj) => obj.catalogItem.content);
        if (isNullOrEmpty(content)) { return; }

        let dataSource = catalogItemMenu.catalogItem.type === CatalogType.Products ?
          content.platforms : content.groups;

        this.listviewDatasource.updateDatasource(dataSource);
      }),
      shareReplay(1)
    );
  }

  private _subscribeToCatalogItemDetailsChange(): void {
    this.activeCatalogItemDetails$ = this._catalogService.activeCatalogItemDetailsChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  private _subscribeToRouterChange(): void {

    this._router.events.pipe(
      tap((event: RouterEvent) => {
        if (!(event instanceof NavigationEnd)) { return; }

        if (this._isBaseCatalogRoute(event.url)) {
          this._navigateToDefaultView(this._catalogService.catalogOptionsCached);
        }
      })
    ).subscribe();
  }

  private _initializeListViewConfig(): void {
    this.listViewConfig = {
      panelSettings: {
        inProgressText: this._translate.instant('products.loading'),
        emptyText: this._translate.instant('products.noProducts'),
        errorText: this._translate.instant('products.errorMessage')
      }
    };
  }

  private _navigateToDefaultView(options: McsOption[]): void {
    let productCatalog = options.map((option) => option.value).find(
      (item) => item.type === CatalogType.Products
    ) as CatalogItem<McsCatalogProductBracket>;

    if (!isNullOrEmpty(productCatalog)) {
      let firstPlatformWithFamilies = productCatalog.content.platforms
        .sort(this._sortPlatformPredicate.bind(this))
        .find((platform) => !isNullOrEmpty(platform.families));
      this._navigationService.navigateTo(RouteKey.CatalogProductsPlatform, [firstPlatformWithFamilies.id]);
      return;
    }

    let solutionCatalog = options.map((option) => option.value).find(
      (item) => item.type === CatalogType.Solutions
    ) as CatalogItem<McsCatalogSolutionBracket>;

    if (!isNullOrEmpty(solutionCatalog)) {
      this._navigationService.navigateTo(RouteKey.CatalogSolutions);
      return;
    }

    this._errorHandlerService.redirectToErrorPage(HttpStatusCode.NotFound);
  }

  private _sortPlatformPredicate(platformA, platformB): number {
    if (platformA.displayOrder < platformB.displayOrder) { return -1; }
    if (platformA.displayOrder > platformB.displayOrder) { return 1; }
    return 0;
  }

  private _isBaseCatalogRoute(url: string): boolean {
    let normalizedUrl = url.slice(1, url.length);
    let catalogPath = CoreRoutes.getNavigationPath(RouteKey.Catalog);
    return normalizedUrl === catalogPath;
  }

  private _onFilterRecords(
    data: McsCatalogProductPlatform | McsCatalogSolutionGroup,
    keyword: string
  ): boolean {
    if (isNullOrEmpty(keyword)) { return true; }

    data = (data instanceof McsCatalogProductPlatform) ?
      this._filterRecordsByProduct(data, keyword) :
      this._filterRecordsBySolution(data, keyword);
    return !isNullOrEmpty(data);
  }

  private _filterRecordsByProduct(
    productPlatform: McsCatalogProductPlatform,
    keyword: string
  ): McsCatalogProductPlatform {
    if (isNullOrEmpty(productPlatform?.families)) { return productPlatform };

    let dataFamilies = new Array<McsCatalogProductFamily>();
    for (let family of productPlatform.families) {
      if (isNullOrEmpty(family)) { continue; }

      let tempFamily = new McsCatalogProductFamily();
      tempFamily.groups = [];

      for (let group of family.groups) {
        if (isNullOrEmpty(group.products)) { continue; }

        let filteredProducts = new Array<McsCatalogProduct>();
        for (let product of group.products) {
          let productIsIncluded = product.name.toLocaleLowerCase()
            .includes(keyword.toLocaleLowerCase());
          if (!productIsIncluded) { continue; }

          let clonedProduct = cloneObject(product);
          filteredProducts.push(clonedProduct);
        }

        if (!isNullOrEmpty(filteredProducts)) {
          let clonedGroup = cloneObject(group);
          clonedGroup.products = filteredProducts;
          tempFamily.groups.push(clonedGroup);
        }
      }

      if (!isNullOrEmpty(tempFamily.groups)) {
        tempFamily.displayOrder = family.displayOrder;
        tempFamily.id = family.id;
        tempFamily.name = family.name;
        dataFamilies.push(tempFamily);
      }
    }

    if (isNullOrEmpty(dataFamilies)) { return null; }
    productPlatform.families = dataFamilies;
    return productPlatform;
  }

  private _filterRecordsBySolution(
    solutionGroup: McsCatalogSolutionGroup,
    keyword: string
  ): McsCatalogSolutionGroup {
    if (isNullOrEmpty(solutionGroup?.solutions)) { return solutionGroup };

    let filteredSolutions = new Array<McsCatalogSolution>();
    for (let solution of solutionGroup.solutions) {
      if (isNullOrEmpty(solution)) { continue; }

      let solutionIncluded = solution.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase());
      if (solutionIncluded) {
        filteredSolutions.push(solution);
      }
    }

    if (isNullOrEmpty(filteredSolutions)) { return null; }
    solutionGroup.solutions = filteredSolutions;
    return solutionGroup;
  }
}
