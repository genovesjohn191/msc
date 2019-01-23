import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
/** Services */
import {
  McsTextContentProvider,
  McsTableListingBase,
  McsTableDataSource,
  McsBrowserService,
  CoreConfig
} from '@app/core';
import { McsToolsRepository } from '@app/services';
import {
  McsPortal,
  McsPortalAccess
} from '@app/models';
import { isNullOrUndefined } from '@app/utilities';

@Component({
  selector: 'mcs-tools',
  templateUrl: './tools.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ToolsComponent
  extends McsTableListingBase<McsTableDataSource<McsPortal>>
  implements AfterViewInit, OnDestroy {
  public textContent: any;
  public toolDescription: Map<string, string>;

  constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _coreConfig: CoreConfig,
    private _textContentProvider: McsTextContentProvider,
    private _toolsRepository: McsToolsRepository
  ) {
    super(_browserService, _changeDetectorRef);
    this.textContent = this._textContentProvider.content.tools;
    this.dataColumns = ['name', 'resourceSpecific', 'portalAccess'];
  }

  public ngAfterViewInit(): void {
    this._initializeToolDescriptionMap();
    Promise.resolve().then(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  /**
   * Retry obtaining datasource from tools
   */
  public retryDatasource(): void {
    this.initializeDatasource();
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    // This is undefined since the table on tools doesnt have filtering of columns
    return undefined;
  }

  /**
   * Initializes the table datasource
   */
  protected initializeDatasource(): void {
    this.dataSource = new McsTableDataSource(this._toolsRepository);
    this.dataSource.dataRenderedChange().subscribe((tools) => {
      if (isNullOrUndefined(tools)) { return; }

      // Add Macquarie View
      let macquarieView = new McsPortal();
      macquarieView.name = 'Macquarie View';
      macquarieView.resourceSpecific = true;

      let macquarieViewPortalAccess = new McsPortalAccess();
      macquarieViewPortalAccess.name = macquarieView.name;
      macquarieViewPortalAccess.url = this._coreConfig.macviewUrl;
      macquarieView.portalAccess = Array(macquarieViewPortalAccess);
      this.dataSource.addOrUpdateRecord(macquarieView, null, 0);

      // Remove resource specific
      tools.slice().forEach((tool) => {
        if (tool.resourceSpecific) { return; }
        this.dataSource.deleteRecordBy((item) => item.id === tool.id);
      });
    });
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Intializes tool description map
   */
  private _initializeToolDescriptionMap(): void {
    let descriptions = this.textContent.table.descriptions;
    this.toolDescription = new Map<string, string>();
    this.toolDescription.set(
      descriptions.macquarieView.name,
      descriptions.macquarieView.description);
    this.toolDescription.set(
      descriptions.vCloud.name,
      descriptions.vCloud.description);
    this.toolDescription.set(
      descriptions.vSphere.name,
      descriptions.vSphere.description);
    this.toolDescription.set(
      descriptions.firewall.name,
      descriptions.firewall.description);
  }
}
