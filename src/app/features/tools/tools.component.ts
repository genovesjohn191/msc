import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Injector
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CoreConfig,
  McsTableListingBase
} from '@app/core';
import { McsApiService } from '@app/services';
import {
  McsPortal,
  McsPortalAccess,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { cloneObject } from '@app/utilities';
import { McsEvent } from '@app/event-manager';

@Component({
  selector: 'mcs-tools',
  templateUrl: './tools.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ToolsComponent extends McsTableListingBase<McsPortal> {
  public toolDescription: Map<string, string>;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _coreConfig: CoreConfig,
    private _translateService: TranslateService,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, McsEvent.dataChangeTools);
    this.dataColumns = ['name', 'resourceSpecific', 'portalAccess'];
    this._initializeToolDescriptionMap();
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    // This is undefined since the table on tools doesnt have filtering of columns
    return undefined;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsPortal>> {
    return this._apiService.getPortals(query).pipe(
      map((response) => {
        let macquarieTools: McsPortal[] = [];

        // Add Macquarie View
        let macquarieView = new McsPortal();
        macquarieView.name = 'Macquarie View';
        macquarieView.resourceSpecific = true;

        let macquarieViewPortalAccess = new McsPortalAccess();
        macquarieViewPortalAccess.name = macquarieView.name;
        macquarieViewPortalAccess.url = this._coreConfig.macviewUrl;
        macquarieView.portalAccess = Array(macquarieViewPortalAccess);
        macquarieTools.push(macquarieView, ...cloneObject(response.collection));

        let portalCollection = new McsApiCollection<McsPortal>();
        portalCollection.collection = macquarieTools.filter((tool) => tool.resourceSpecific);
        portalCollection.totalCollectionCount = portalCollection.collection.length;
        return portalCollection;
      })
    );
  }

  /**
   * Intializes tool description map
   */
  private _initializeToolDescriptionMap(): void {
    let descriptions = this._translateService.instant('tools.table.descriptions');
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
