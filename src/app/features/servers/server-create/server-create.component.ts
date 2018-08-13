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
  Subscription,
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsErrorHandlerService,
  McsSafeToNavigateAway,
  CoreRoutes,
  McsRouteKey
} from '../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder,
  unsubscribeSafely,
  unsubscribeSubject,
  getSafeProperty
} from '../../../utilities';
import {
  Resource,
  ResourcesRepository
} from '../../resources';
import { ServerServiceType } from '../models';
import { ServerCreateService } from './server-create.service';
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
  public resourcesSubscription: Subscription;
  public resourceSubscription: Subscription;
  public selectedResource: Resource;
  public faCreationForm: FormArray;

  private _destroySubject = new Subject<void>();

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  public get serviceTypeEnum() { return ServerServiceType; }

  /**
   * Returns the resources list
   */
  public get resources(): Resource[] { return this._resources; }
  private _resources: Resource[];

  @ViewChild(ServerCreateDetailsComponent)
  private _detailsStep: ServerCreateDetailsComponent;

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _resourceRepository: ResourcesRepository,
    private _serverCreateService: ServerCreateService,
    private _serverCreateFlyweightContext: ServerCreateFlyweightContext
  ) {
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.createServer;
    this._getAllResources();
  }

  public ngAfterContentInit() {
    this._listenToFormArrayChanges();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.resourcesSubscription);
    unsubscribeSafely(this.resourceSubscription);
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
    this._router.navigate([CoreRoutes.getNavigationPath(McsRouteKey.Servers)]);
  }

  /**
   * Event that emits whenever a resource is selected
   */
  public onChangeResource(_resource: Resource): void {
    if (isNullOrEmpty(_resource)) { return; }
    this._getResourceById(_resource.id);
  }

  /**
   * Returns the resource displayed text based on resource data
   * @param resource Resource to be displayed
   */
  public getResourceDisplayedText(resource: Resource): string {
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
  private _getAllResources(): void {
    this.resourcesSubscription = this._serverCreateService
      .getCreationResources()
      .pipe(
        catchError((error) => {
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this._resources = response;
        this._setInitialSelection(this._resources);
      });
  }

  /**
   * Selects the first element on the resources
   */
  private _setInitialSelection(resources: Resource[]): void {
    if (isNullOrEmpty(resources)) { return; }
    this.onChangeResource(resources[0]);
  }

  /**
   * Gets the resource based on ID provided
   * @param resourceId Resource Id of the resource to get
   */
  private _getResourceById(resourceId: any): void {
    this.resourceSubscription = this._resourceRepository
      .findRecordById(resourceId)
      .subscribe((updatedResource) => {
        if (isNullOrEmpty(updatedResource)) { return; }
        this.selectedResource = updatedResource;
        this._serverCreateFlyweightContext.setResource(this.selectedResource);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listens to each form array changes
   */
  private _listenToFormArrayChanges(): void {
    this._serverCreateFlyweightContext.formArrayChanges
      .pipe(takeUntil(this._destroySubject))
      .subscribe((_formArray) => {
        this.faCreationForm = _formArray;
        this._changeDetectorRef.markForCheck();
      });
  }
}
