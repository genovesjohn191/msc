import {
  Component,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  McsTableDataSource
} from '@app/core';
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
    private _systemMessagesRepository: McsSystemMessagesRepository
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
