import {
  Component,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  CoreRoutes,
  McsTableDataSource
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  RouteKey,
  McsSystemMessage
} from '@app/models';
import { McsSystemMessagesRepository } from '@app/services';

@Component({
  selector: 'mcs-system-messages',
  templateUrl: './messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class SystemMessagesComponent
  extends McsTableListingBase<McsTableDataSource<McsSystemMessage>>
  implements AfterViewInit, OnDestroy {

  public get addIconKey(): string {
    return CoreDefinition.ASSETS_FONT_PLUS;
  }

  constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _systemMessagesRepository: McsSystemMessagesRepository,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Navigate to system message details page
   * @param message System Message to view the details
   */
  public navigateToMessage(message: McsSystemMessage): void {
    if (isNullOrEmpty(message)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.SystemMessageDetails), message.id]);
  }

  /**
   * This will navigate to system message creation page
   */
  public onClickNewMessage(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.SystemMessageCreate)]);
  }

  /**
   * Retry obtaining datasource from system messages
   */
  public retryDatasource(): void {
    this.initializeDatasource();
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_SYSTEM_MESSAGE_LISTING;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    this.dataSource = new McsTableDataSource(this._systemMessagesRepository);
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }
}
