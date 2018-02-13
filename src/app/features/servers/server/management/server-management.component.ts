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
  ServerFileSystem,
  ServerPerformanceScale,
  ServerThumbnail,
  ServerPowerState,
  ServerServiceType,
  ServerMedia,
  ServerManageMedia,
  ServerCommand
} from '../../models';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsDeviceType,
  McsDialogService,
  McsErrorHandlerService
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
import { ServersResourcesRespository } from '../../servers-resources.repository';
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
  public otherStorage: ServerFileSystem[];

  public serverThumbnail: ServerThumbnail;
  public serverThumbnailEncoding: string;

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

  private _selectedMedia: string;
  public get selectedMedia(): string {
    return this._selectedMedia;
  }
  public set selectedMedia(value: string) {
    if (this._selectedMedia !== value) {
      this._selectedMedia = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public get isActiveScale(): boolean {
    return !isNullOrEmpty(this.server.id) && this._hasScaleParam && !this.isManaged;
  }

  public get isScaling(): boolean {
    return this.isProcessingJob && this.server.commandAction === ServerCommand.Scale;
  }

  public get serverMemoryMB(): number {
    return !isNullOrEmpty(this.server.compute) ? this.server.compute.memoryMB : 0;
  }

  public get serverCpuCount(): number {
    return !isNullOrEmpty(this.server.compute) ?
      this.server.compute.cpuCount * this.server.compute.coreCount : 0;
  }

  public get serverMemoryValue(): string {
    return appendUnitSuffix(this.serverMemoryMB, 'megabyte');
  }

  public get serverCpuValue(): string {
    return appendUnitSuffix(this.serverCpuCount, 'cpu');
  }

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.server.serviceType === ServerServiceType.Managed;
  }

  public get consoleEnabled(): boolean {
    return this.isPoweredOn && this._deviceType === McsDeviceType.Desktop;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get invalidStorage(): string {
    return this._textProvider.content.servers.shared.storageScale.invalidStorage;
  }

  public get hasStorage(): boolean {
    return !isNullOrEmpty(this.server.fileSystem);
  }

  public get hasMedia(): boolean {
    return !isNullOrEmpty(this.server.media);
  }

  public get hasUpdate(): boolean {
    return this._serverPerformanceScale.valid && !isNullOrEmpty(this.server.compute)
      && (this.server.compute.memoryMB < this._serverPerformanceScale.memoryMB
        || this.server.compute.cpuCount < this._serverPerformanceScale.cpuCount);
  }

  public get isPoweredOn(): boolean {
    return this.server.powerState === ServerPowerState.PoweredOn;
  }

  public get hasNics(): boolean {
    return !isNullOrEmpty(this.server.nics) && !isNullOrEmpty(
      this.server.nics.find((nic) => {
        return !isNullOrEmpty(nic.ipAddress);
      }));
  }

  public get hasStorageInformation(): boolean {
    return !isNullOrEmpty(this.server.storageDevice);
  }

  public get hasAvailableMedia(): boolean {
    return !isNullOrEmpty(this.resourceMediaList);
  }

  public get scalingIsDisabled(): boolean {
    return this.isProcessingJob || this.isManaged || !this.server.isOperable;
  }

  public get mediaIsDisabled(): boolean {
    return this.isProcessingJob || this.isManaged || !this.server.isOperable;
  }

  constructor(
    _serversResourcesRepository: ServersResourcesRespository,
    _serversRepository: ServersRepository,
    _serversService: ServersService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
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
      _textProvider
    );
    this.isAttachMedia = false;
    this._serverPerformanceScale = new ServerPerformanceScale();
    this._hasScaleParam = false;
  }

  public ngOnInit(): void {
    this.textContent = this._textProvider.content.servers.server.management;
    this._getScaleParam();
    this._listenToNotificationsChange();
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

  public getSecondaryVolumes(serverfileSystem: ServerFileSystem[]) {
    let storage = new Array();
    let secondaryVolumes = serverfileSystem.slice(1);

    for (let fileSystem of secondaryVolumes) {
      storage.push(appendUnitSuffix(fileSystem.capacityGB, 'gigabyte'));
    }

    return storage.join(', ');
  }

  public onClickViewConsole() {
    if (!this.consoleEnabled) { return; }

    let windowFeatures = `directories=yes,titlebar=no,toolbar=no,
    status=no,menubar=no,resizable=yes,scrollbars=yes,
    width=${CoreDefinition.CONSOLE_DEFAULT_WIDTH},
    height=${CoreDefinition.CONSOLE_DEFAULT_HEIGHT}`;

    window.open(`/console/${this.server.id}`, 'VM Console', windowFeatures);
  }

  public onScaleChanged(scale: ServerPerformanceScale) {
    this._serverPerformanceScale = scale;
  }

  public scaleServer(): void {
    this._serversService.executeServerCommand({ server: this.server }, ServerCommand.Scale);
  }

  public onClickScale(): void {
    if (!this._serverPerformanceScale.valid || !this.hasUpdate) { return; }

    // Update the Server CPU size scale
    this._serversService.setServerExecutionStatus(this.server);
    this._scalingSubscription = this._serverService.setPerformanceScale(
      this.server.id,
      this._serverPerformanceScale,
      this.server.powerState,
      ServerCommand.Scale
    ).subscribe(() => {
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
        // Set initial server status so that the spinner will show up immediately
        this._serversService.setServerExecutionStatus(this.server, media);
        this.detachMedia(media);
      }
    });
  }

  public attachMedia(): void {
    if (isNullOrEmpty(this.selectedMedia)) { return; }

    let mediaValues = new ServerManageMedia();
    mediaValues.name = this.selectedMedia;
    mediaValues.clientReferenceObject = {
      serverId: this.server.id,
      mediaName: this.selectedMedia,
      powerState: this.server.powerState
    };

    this.selectedMedia = undefined;

    // Set initial server status so that the spinner will show up immediately
    this._serversService.setServerExecutionStatus(this.server);
    this._serversService.attachServerMedia(this.server.id, mediaValues)
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

    this._serversService.detachServerMedia(this.server.id, media.id, mediaValues).subscribe();
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

  /**
   * Listen to notifications changes
   */
  private _listenToNotificationsChange(): void {
    this._notificationsChangeSubscription = this._serversRepository.notificationsChanged
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
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
    this.computeSubscription = this._serversResourcesRespository
      .findResourceCompute(this.serverResource)
      .catch((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe(() => {
        // Subscribe to update the compute of the selected server resource
      });
  }
}
