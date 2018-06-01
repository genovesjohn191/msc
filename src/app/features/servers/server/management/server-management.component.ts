import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  ServerPerformanceScale,
  ServerThumbnail,
  ServerServiceType,
  ServerMedia,
  ServerManageMedia,
  ServerCommand,
  ServerCatalogItem,
  ServerIpAllocationMode
} from '../../models';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsDeviceType,
  McsDialogService,
  McsErrorHandlerService,
  McsUnitType
} from '../../../../core';
import {
  getEncodedUrl,
  refreshView,
  appendUnitSuffix,
  isNullOrEmpty,
  unsubscribeSafely
} from '../../../../utilities';
import { ServersService } from '../../servers.service';
import { ServerService } from '../server.service';
import { ServersRepository } from '../../servers.repository';
import { ServersResourcesRepository } from '../../servers-resources.repository';
import {
  ServerDetailsBase,
  DetachMediaDialogComponent
} from '../../shared';

@Component({
  selector: 'mcs-server-management',
  styleUrls: ['./server-management.component.scss'],
  templateUrl: './server-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerManagementComponent extends ServerDetailsBase
  implements OnInit, OnDestroy {
  @ViewChild('thumbnailElement')
  public thumbnailElement: ElementRef;

  public textContent: any;

  public serverThumbnail: ServerThumbnail;
  public serverThumbnailEncoding: string;
  public selectedMedia: ServerCatalogItem;

  public computeSubscription: Subscription;
  private _notificationsChangeSubscription: Subscription;
  private _scalingSubscription: Subscription;
  private _paramsSubscription: Subscription;
  private _deviceTypeSubscription: Subscription;

  private _serverPerformanceScale: ServerPerformanceScale;
  private _deviceType: McsDeviceType;
  private _hasScaleParam: boolean;

  private _isAttachMedia: boolean;
  public get isAttachMedia(): boolean {
    return this._isAttachMedia;
  }
  public set isAttachMedia(value: boolean) {
    if (this._isAttachMedia !== value) {
      this._isAttachMedia = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public get serverMemoryMB(): number {
    return !isNullOrEmpty(this.server.compute) ? this.server.compute.memoryMB : 0;
  }

  public get serverCpuCount(): number {
    return !isNullOrEmpty(this.server.compute) ?
      this.server.compute.cpuCount * this.server.compute.coreCount : 0;
  }

  public get serverMemoryValue(): string {
    return appendUnitSuffix(this.serverMemoryMB, McsUnitType.Megabyte);
  }

  public get serverCpuValue(): string {
    return appendUnitSuffix(this.serverCpuCount, McsUnitType.CPU);
  }

  public get availableMemoryMB(): number {
    return this._serversService.computeAvailableMemoryMB(this.serverResource);
  }

  public get availableCpu(): number {
    return this._serversService.computeAvailableCpu(this.serverResource);
  }

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.server.serviceType === ServerServiceType.Managed;
  }

  public get consoleEnabled(): boolean {
    return this.server.consoleEnabled &&
      this._deviceType !== McsDeviceType.MobilePortrait;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get consoleIconKey(): string {
    return CoreDefinition.ASSETS_SVG_DOS_PROMPT_GREY;
  }

  public get invalidStorage(): string {
    return this._textProvider.content.servers.shared.storageScale.invalidStorage;
  }

  public get scaleOptionIsVisible(): boolean {
    return !isNullOrEmpty(this.server.id) && this._hasScaleParam && !this.isManaged;
  }

  public get isScaling(): boolean {
    return this.server.isProcessing && this.server.commandAction === ServerCommand.Scale;
  }

  public get hasMedia(): boolean {
    return !isNullOrEmpty(this.server.media);
  }

  public get hasUpdate(): boolean {
    return this._serverPerformanceScale.valid && !isNullOrEmpty(this.server.compute)
      && (this.serverMemoryMB < this._serverPerformanceScale.memoryMB
        || this.serverCpuCount < this._serverPerformanceScale.cpuCount);
  }

  public get isPoweredOn(): boolean {
    return this.server.isPoweredOn;
  }

  public get hasNics(): boolean {
    return !isNullOrEmpty(this.server.nics);
  }

  public get hasStorageInformation(): boolean {
    return !isNullOrEmpty(this.server.storageDevices);
  }

  public get hasAvailableMedia(): boolean {
    return !isNullOrEmpty(this.resourceMediaList);
  }

  public get attachMediaIsDisabled(): boolean {
    return !this.server.executable || !this.hasAvailableMedia;
  }

  public get ipAllocationModeEnum(): any {
    return ServerIpAllocationMode;
  }

  constructor(
    _serversResourcesRepository: ServersResourcesRepository,
    _serversRepository: ServersRepository,
    _serversService: ServersService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    _errorHandlerService: McsErrorHandlerService,
    private _renderer: Renderer2,
    private _browserService: McsBrowserService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _dialogService: McsDialogService
  ) {
    super(
      _serversResourcesRepository,
      _serversRepository,
      _serversService,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService
    );
    this.isAttachMedia = false;
    this._serverPerformanceScale = new ServerPerformanceScale();
    this._hasScaleParam = false;
  }

  public ngOnInit(): void {
    this.textContent = this._textProvider.content.servers.server.management;
    this.initialize();
    this._getScaleParam();
    this._listenToDeviceChange();
  }

  public ngOnDestroy(): void {
    this.dispose();
    unsubscribeSafely(this._notificationsChangeSubscription);
    unsubscribeSafely(this._scalingSubscription);
    unsubscribeSafely(this._deviceTypeSubscription);
    unsubscribeSafely(this._paramsSubscription);

    if (!isNullOrEmpty(this._serverPerformanceScale)) {
      this._serverPerformanceScale = undefined;
    }
  }

  public mergeIpAddresses(ipAddresses: string[]): string {
    if (!ipAddresses || ipAddresses.length === 0) { return ''; }

    return ipAddresses.join(', ');
  }

  public hasIpAddress(ipAddress: string[]): boolean {
    return !isNullOrEmpty(ipAddress);
  }

  public onClickViewConsole() {
    if (!this.consoleEnabled) { return; }

    let windowFeatures = `directories=yes,titlebar=no,toolbar=no,
    status=no,menubar=no,resizable=yes,scrollbars=yes`;
    window.open(`/console/${this.server.id}`, this.server.id, windowFeatures);
  }

  public onScaleChanged(scale: ServerPerformanceScale) {
    this._serverPerformanceScale = scale;
  }

  public showScaleOption(): void {
    this._serversService.executeServerCommand({ server: this.server }, ServerCommand.Scale);
  }

  public onClickScale(): void {
    if (!this._serverPerformanceScale.valid || !this.hasUpdate) { return; }

    // Update the Server CPU size scale
    this._serversService.setServerSpinner(this.server);
    this._scalingSubscription = this._serverService.setPerformanceScale(
      this.server.id,
      this._serverPerformanceScale,
      this.server.powerState,
      ServerCommand.Scale
    )
      .catch((error) => {
        this._serversService.clearServerSpinner(this.server);
        return Observable.throw(error);
      })
      .subscribe(() => {
        this._routeToServerManagement();
      });
  }

  public cancelScale(): void {
    this._serverPerformanceScale = new ServerPerformanceScale();
    this._routeToServerManagement();
  }

  public onAttachMedia(): void {
    if (this.isManaged) { return; }

    this.isAttachMedia = true;
  }

  public cancelAttachMedia(): void {
    this.isAttachMedia = false;
    this.selectedMedia = undefined;
  }

  public onDetachMedia(media: ServerMedia): void {
    let dialogRef = this._dialogService.open(DetachMediaDialogComponent, {
      data: media,
      size: 'medium'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.detachMedia(media);
      }
    });
  }

  public attachMedia(): void {
    if (this.attachMediaIsDisabled || isNullOrEmpty(this.selectedMedia)) { return; }

    let mediaValues = new ServerManageMedia();
    mediaValues.name = this.selectedMedia.itemName;
    mediaValues.clientReferenceObject = {
      serverId: this.server.id,
      mediaName: this.selectedMedia.itemName,
      powerState: this.server.powerState
    };

    this.selectedMedia = undefined;

    // Set initial server status so that the spinner will show up immediately
    this._serversService.setServerSpinner(this.server);
    this._serversService.attachServerMedia(this.server.id, mediaValues)
      .catch((error) => {
        this._serversService.clearServerSpinner(this.server);
        return Observable.throw(error);
      })
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.isAttachMedia = false;
        }
      });
  }

  public detachMedia(media: ServerMedia): void {
    if (isNullOrEmpty(media)) { return; }

    let mediaValues = new ServerManageMedia();
    mediaValues.clientReferenceObject = {
      serverId: this.server.id,
      mediaId: media.id,
      powerState: this.server.powerState
    };

    // Set initial server status so that the spinner will show up immediately
    this._serversService.setServerSpinner(this.server);
    this._serversService
      .detachServerMedia(this.server.id, media.id, mediaValues)
      .catch((error) => {
        this._serversService.clearServerSpinner(this.server);
        return Observable.throw(error);
      })
      .subscribe();
  }

  protected serverSelectionChanged(): void {
    this._getServerCompute();
    this._getServerThumbnail();

    refreshView(() => {
      if (!this.consoleEnabled) {
        this._hideThumbnail();
      }
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  private _getScaleParam(): void {
    this._paramsSubscription = this._activatedRoute.queryParams
      .subscribe((params: ParamMap) => {
        this._hasScaleParam = !isNullOrEmpty(params['scale']);
        this._changeDetectorRef.markForCheck();
      });
  }

  private _routeToServerManagement(): void {
    this._router.navigate(['/servers/', this.server.id, 'management']);
  }

  private _getServerThumbnail(): void {
    if (!this.server || !this.consoleEnabled) { return; }

    // Hide thumbnail if it is already displayed in initial routing
    this._hideThumbnail();

    // Get the server thumbnail to be encoded and display in the image
    this._serversService.getServerThumbnail(this.server.id)
      .subscribe((response) => {
        this.serverThumbnail = response.content;

        if (this.serverThumbnail && this.thumbnailElement) {
          this.serverThumbnailEncoding = getEncodedUrl(
            this.serverThumbnail.file,
            this.serverThumbnail.fileType,
            this.serverThumbnail.encoding
          );
          this._showThumbnail();
        }

        this._changeDetectorRef.markForCheck();
      });
  }

  private _showThumbnail(): void {
    if (!this.thumbnailElement) { return; }

    // Add thumbnail source
    this._renderer.setAttribute(this.thumbnailElement.nativeElement,
      'src', this.serverThumbnailEncoding);

    // Adjust size of the thumbnail
    this._setThumbnailSize();
  }

  private _setThumbnailSize(): void {
    refreshView(() => {
      this._renderer.setStyle(this.thumbnailElement.nativeElement, 'display', 'block');
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  private _hideThumbnail(): void {
    refreshView(() => {
      if (!this.thumbnailElement) { return; }

      this._renderer.setStyle(this.thumbnailElement.nativeElement, 'display', 'none');
      this._renderer.removeAttribute(this.thumbnailElement.nativeElement, 'src');
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  private _listenToDeviceChange(): void {
    this._deviceTypeSubscription = this._browserService.deviceTypeStream
      .subscribe((deviceType) => {
        this._deviceType = deviceType;
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Get the server resource compute
   */
  private _getServerCompute(): void {
    if (isNullOrEmpty(this.serverResource)) { return; }
    this.computeSubscription = this._serversResourcesRespository
      .findResourceCompute(this.serverResource)
      .subscribe(() => {
        // Subscribe to update the compute of the selected server resource
      });
  }
}
