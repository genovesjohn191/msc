import {
  Component,
  OnInit,
  AfterContentInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Subject,
  throwError,
  Observable
} from 'rxjs';
import {
  catchError,
  takeUntil,
  tap,
  shareReplay,
  finalize,
  map
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsErrorHandlerService,
  CoreRoutes,
  McsLoadingService
} from '@app/core';
import {
  ServiceType,
  RouteKey,
  McsResource,
  DataStatus,
  McsOrder
} from '@app/models';
import {
  isNullOrEmpty,
  replacePlaceholder,
  unsubscribeSubject,
  getSafeProperty,
  McsSafeToNavigateAway
} from '@app/utilities';
import { McsResourcesRepository } from '@app/services';
import { ServerCreateDetailsComponent } from './details/server-create-details.component';
import { ServerCreateFlyweightContext } from './server-create-flyweight.context';

@Component({
  selector: 'mcs-server-create',
  templateUrl: 'server-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServerCreateFlyweightContext]
})

export class ServerCreateComponent implements
  OnInit, AfterContentInit, OnDestroy, McsSafeToNavigateAway {
  public textContent: any;
  public order$: Observable<McsOrder>;
  public orderIsUpdating$: Observable<boolean>;
  public resources$: Observable<McsResource[]>;
  public resource$: Observable<McsResource>;
  public faCreationForm: FormArray;

  private _destroySubject = new Subject<void>();
  private _resourceChange = new Subject<McsResource>();

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  public get serviceTypeEnum() { return ServiceType; }

  /**
   * Returns the resources list
   */
  public get resources(): McsResource[] { return this._resources; }
  private _resources: McsResource[];

  @ViewChild(ServerCreateDetailsComponent)
  private _detailsStep: ServerCreateDetailsComponent;

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _resourcesRepository: McsResourcesRepository,
    private _serverCreateFlyweightContext: ServerCreateFlyweightContext,
    private _loaderService: McsLoadingService
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer;
    this._subscribeToAllResources();
  }

  public ngAfterContentInit() {
    this._subscribeToFormArrayChanges();
    this._subscribeToOrderChanges();
    this._subscribeToUpdateOrderChanges();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Event that emits when navigating away from create server page to other route
   */
  public safeToNavigateAway(): boolean {
    return getSafeProperty(this._detailsStep, (obj) => obj.safeToNavigateAway(), true);
  }

  /**
   * Navigate to servers listing page
   */
  public gotoServers() {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Servers)]);
  }

  /**
   * Event that emits whenever a resource is selected
   */
  public onChangeResource(_resource: McsResource): void {
    if (isNullOrEmpty(_resource)) { return; }
    this._resourceChange.next(_resource);
    this._subscribeResourceById(_resource.id);
  }

  /**
   * Returns the resource displayed text based on resource data
   * @param resource Resource to be displayed
   */
  public getResourceDisplayedText(resource: McsResource): string {
    let prefix = replacePlaceholder(
      this.textContent.vdcDropdownList.prefix,
      ['service_type', 'zone'],
      [resource.serviceTypeLabel, resource.availabilityZone]
    );
    return `${prefix} ${resource.name}`;
  }

  /**
   * Gets the list of resources from repository
   */
  private _subscribeToAllResources(): void {
    this._loaderService.showLoader('Loading resources');
    this.resources$ = this._resourcesRepository.getResourcesByFeature().pipe(
      catchError((error) => {
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return throwError(error);
      })
    );
  }

  /**
   * Gets the resource based on ID provided
   * @param resourceId Resource Id of the resource to get
   */
  private _subscribeResourceById(resourceId: any): void {
    this._loaderService.showLoader('Loading resource details');
    this.resource$ = this._resourcesRepository.getById(resourceId)
      .pipe(
        shareReplay(1),
        tap((_updatedResource) => {
          if (isNullOrEmpty(_updatedResource)) { return; }
          this._serverCreateFlyweightContext.setResource(_updatedResource);
          this._changeDetectorRef.markForCheck();
        }),
        finalize(() => this._loaderService.hideLoader())
      );
  }

  /**
   * Listens/Subscribes to each form array changes
   */
  private _subscribeToFormArrayChanges(): void {
    this._serverCreateFlyweightContext.formArrayChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe((_formArray) => {
        this.faCreationForm = _formArray;
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Subscribe to order changes and always get the latest obtained from api
   */
  private _subscribeToOrderChanges(): void {
    this.order$ = this._serverCreateFlyweightContext.orderChanges.pipe(
      tap(() => this._changeDetectorRef.markForCheck())
    );
  }

  /**
   * Subscribe to updating order state changes
   */
  private _subscribeToUpdateOrderChanges(): void {
    this.orderIsUpdating$ = this._serverCreateFlyweightContext
      .updateOrderStateChanges.pipe(
        map((state) => state === DataStatus.InProgress ? true : false)
      );
  }
}
