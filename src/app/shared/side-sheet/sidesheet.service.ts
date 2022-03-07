import {
  Overlay,
  OverlayConfig,
  OverlayRef
} from '@angular/cdk/overlay';
import {
  ComponentPortal,
  ComponentType
} from '@angular/cdk/portal';
import {
  Injectable,
  Injector
} from '@angular/core';
import {
  deleteArrayRecord,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';

import { SideSheetRef } from './models/sidesheet-ref';
import {
  MCS_SIDESHEET_CONTAINER,
  MCS_SIDESHEET_DATA,
  SideSheetConfig
} from './models/sidesheet.config';
import { SideSheetComponent } from './sidesheet.component';

@Injectable()
export class SideSheetService {
  private _openedSidesheets: Array<SideSheetRef<any>>;

  constructor(private _overlay: Overlay) {
    this._openedSidesheets = new Array();
  }

  public open<TData>(
    component: ComponentType<TData>,
    config?: SideSheetConfig
  ): SideSheetRef<TData> {
    // Return immediately the instance once it was found
    let sideSheetFound = this._openedSidesheets.find(
      sideSheet => sideSheet.id === config?.id
    );
    if (!isNullOrUndefined(sideSheetFound)) { return sideSheetFound; }

    // Create the instance necessary items to do the sidesheet on top of overlay
    let overlay = this._createOverlay(config);
    let createdSideSheet = this._createSideSheetContainer(overlay, config);
    let sideSheetRef = this._createSideSheetContent(component, overlay, createdSideSheet, config);
    this._openedSidesheets.push(sideSheetRef);

    // Remove reference once closed
    sideSheetRef.afterClosed().subscribe(() => this._deleteSideSheetFromList(sideSheetRef));
    return sideSheetRef;
  }

  public closeAll(): void {
    if (isNullOrEmpty(this._openedSidesheets)) { return; }

    let closedIds = new Array<string>();
    this._openedSidesheets.forEach(sideSheetRef => {
      let closeResult = sideSheetRef.close();
      if (closeResult) closedIds.push(sideSheetRef.id);
    });

    if (!isNullOrEmpty(closedIds)) {
      this._openedSidesheets = deleteArrayRecord(this._openedSidesheets,
        openedSidesheet => !!closedIds.find(closedId => closedId === openedSidesheet.id)
      );
    }
  }

  private _deleteSideSheetFromList(sideSheetRef: SideSheetRef<any>): void {
    const index = this._openedSidesheets.indexOf(sideSheetRef);
    if (index > -1) {
      this._openedSidesheets.splice(index, 1);
    }
  }

  private _createOverlay(config: SideSheetConfig): OverlayRef {
    let overlayConfig = new OverlayConfig();
    overlayConfig.hasBackdrop = config.hasBackdrop || true;
    overlayConfig.backdropClass = config.backdropClass;
    overlayConfig.panelClass = 'mcs-sidesheet-overlay-panel';

    let overlayRef = this._overlay.create(overlayConfig);
    return overlayRef;
  }

  private _createSideSheetContainer(
    overlay: OverlayRef,
    config?: SideSheetConfig
  ): SideSheetComponent {

    let component = new ComponentPortal<any>(SideSheetComponent);
    let containerRef = overlay.attach(component);
    containerRef.instance.config = config;
    return containerRef.instance;
  }

  private _createSideSheetContent<TData>(
    component: ComponentType<TData>,
    overlayRef: OverlayRef,
    container: SideSheetComponent,
    config?: SideSheetConfig
  ): SideSheetRef<TData> {

    // Create reference instance
    let sideSheetRef = new SideSheetRef<TData>(
      config?.id, overlayRef, container
    );

    // Add event when backdrop has been clicked.
    if (config.hasBackdrop) {
      overlayRef.backdropClick().subscribe(() => {
        sideSheetRef.close();
      });
    }

    // Create necessary inputs to the sidesheet
    let injector = Injector.create({
      providers: [
        { provide: SideSheetRef, useValue: sideSheetRef },
        { provide: MCS_SIDESHEET_CONTAINER, useValue: container },
        { provide: MCS_SIDESHEET_DATA, useValue: config.data }
      ]
    });
    let componentRef = container.attachComponent(
      new ComponentPortal<any>(component, null, injector)
    );
    sideSheetRef.componentInstance = componentRef.instance;
    return sideSheetRef;
  }
}
