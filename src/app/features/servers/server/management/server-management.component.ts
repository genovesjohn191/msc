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
import { Subscription } from 'rxjs/Rx';
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
  McsNotificationContextService,
  McsBrowserService,
  McsDeviceType,
  McsApiJob,
  McsJobType,
  McsDialogService
} from '../../../../core';
import {
  getEncodedUrl,
  refreshView,
  appendUnitSuffix,
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  deleteArrayRecord
} from '../../../../utilities';
import { ServerService } from '../server.service';
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
  public primaryVolume: string;
  public secondaryVolumes: string;
  public otherStorage: ServerFileSystem[];

  public serverThumbnail: ServerThumbnail;
  public serverThumbnailEncoding: string;

  private _scalingSubscription: Subscription;
  private _paramsSubscription: Subscription;
  private _deviceTypeSubscription: Subscription;

  private _serverPerformanceScale: ServerPerformanceScale;
  private _deviceType: McsDeviceType;

  private _serverJobType: McsJobType;
  private _serverJobCommandAction: ServerCommand;

  private _activeMediaId: string;
  public get activeMediaId(): string {
    return this._activeMediaId;
  }
  public set activeMediaId(value: string) {
    if (this._activeMediaId !== value) {
      this._activeMediaId = value;
      this._changeDetectorRef.markForCheck();
    }
  }

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
    return this.isProcessing && this._serverJobType === McsJobType.UpdateServerCompute;
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
    return appendUnitSuffix(this.serverCpuCount, 'megabyte');
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
    return !isNullOrEmpty(this.server.nics);
  }

  public get hasStorageInformation(): boolean {
    return !isNullOrEmpty(this.primaryVolume)
      || !isNullOrEmpty(this.secondaryVolumes);
  }

  public get hasAvailableMedia(): boolean {
    return !isNullOrEmpty(this.resourceMediaList);
  }

  public get scalingIsDisabled(): boolean {
    return this.isProcessing || this.isManaged || !this.server.isOperable;
  }

  public get mediaIsDisabled(): boolean {
    return !this.hasAvailableMedia || this.isProcessing
      || this.isManaged || !this.server.isOperable;
  }

  private _hasScaleParam: boolean;

  constructor(
    _notificationContextService: McsNotificationContextService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider,
    private _renderer: Renderer2,
    private _browserService: McsBrowserService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _dialogService: McsDialogService
  ) {
    super(
      _notificationContextService,
      _serverService,
      _changeDetectorRef
    );
    this.primaryVolume = '';
    this.secondaryVolumes = '';
    this.isAttachMedia = false;
    this.isProcessing = false;
    this._serverPerformanceScale = new ServerPerformanceScale();
    this._hasScaleParam = false;
  }

  public ngOnInit(): void {
    this.textContent = this._textProvider.content.servers.server.management;
    this._getScaleParam();
    this._listenToDeviceChange();
  }

  public ngOnDestroy(): void {
    this.dispose();

    if (this._scalingSubscription) {
      this._scalingSubscription.unsubscribe();
    }

    if (this._deviceTypeSubscription) {
      this._deviceTypeSubscription.unsubscribe();

    }

    if (this._paramsSubscription) {
      this._paramsSubscription.unsubscribe();
    }

    if (this._serverPerformanceScale) {
      this._serverPerformanceScale = undefined;
    }
  }

  public get serverStatusLabel(): string {
    let status: string = this.textContent.status.running;

    switch (this.server.powerState) {
      case ServerPowerState.PoweredOn:
        status = this.textContent.status.running;
        break;

      case ServerPowerState.PoweredOff:
        status = this.textContent.status.stopped;
        break;

      default:
        switch (this._serverJobCommandAction) {
          case ServerCommand.Stop:
            status = this.textContent.status.stopping;
            break;

          case ServerCommand.Restart:
            status = this.textContent.status.restarting;
            break;

          default:
            // Do nothing
            break;
        }
        break;
    }

    return status;
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
    this._serverService.executeServerCommand({ server: this.server }, ServerCommand.Scale);
  }

  public onClickScale(): void {
    if (!this._serverPerformanceScale.valid || !this.hasUpdate) { return; }

    this.isProcessing = true;

    // Update the Server CPU size scale
    this._scalingSubscription = this._serverService.setPerformanceScale(
      this.server.id, this._serverPerformanceScale, this.server.powerState)
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
    if (isNullOrEmpty(this.selectedMedia)) { return; }

    this.isProcessing = true;

    let mediaValues = new ServerManageMedia();
    mediaValues.name = this.selectedMedia;
    mediaValues.clientReferenceObject = {
      serverId: this.server.id,
      mediaName: this.selectedMedia,
      powerState: this.server.powerState
    };

    this.selectedMedia = undefined;

    this._serverService.attachServerMedia(this.server.id, mediaValues)
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.isAttachMedia = false;
        }
      });
  }

  public detachMedia(media: ServerMedia): void {
    if (isNullOrEmpty(media)) { return; }

    this.isProcessing = true;

    let mediaValues = new ServerManageMedia();
    mediaValues.clientReferenceObject = {
      serverId: this.server.id,
      mediaId: media.id,
      powerState: this.server.powerState
    };

    this._serverService.detachServerMedia(this.server.id, media.id, mediaValues).subscribe();
  }

  protected serverSelectionChanged(): void {
    this._setServerFileSystem();
    this._getServerThumbnail();

    refreshView(() => {
      if (!this.consoleEnabled) {
        this._hideThumbnail();
      }
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  protected serverJobStatusChanged(selectedServerJob: McsApiJob): void {
    let media = new ServerMedia();
    this.activeMediaId = selectedServerJob.clientReferenceObject.mediaId;
    this._serverJobType = selectedServerJob.type;
    this._serverJobCommandAction = selectedServerJob.clientReferenceObject.commandAction;

    switch (selectedServerJob.type) {
      case McsJobType.UpdateServerCompute:
        if (this.hasCompletedJob && !isNullOrEmpty(this.server.compute) &&
          !isNullOrEmpty(selectedServerJob.clientReferenceObject)) {
          this.server.compute.memoryMB = selectedServerJob.clientReferenceObject.memoryMB;
          this.server.compute.cpuCount = selectedServerJob.clientReferenceObject.cpuCount;
        }
        break;

      case McsJobType.AttachServerMedia:
        if (this.hasCompletedJob || this.hasFailedJob) {
          deleteArrayRecord(this.server.media, (targetMedia) => {
            return isNullOrEmpty(targetMedia.id);
          }, 1);
        }

        if (this.hasFailedJob) { break; }

        if (!isNullOrEmpty(selectedServerJob.clientReferenceObject)) {
          media.name = selectedServerJob.clientReferenceObject.mediaName;
        }

        if (this.hasCompletedJob) {
          let referenceObject = selectedServerJob.tasks[0].referenceObject;

          if (!isNullOrEmpty(referenceObject.resourceId)) {
            media.id = referenceObject.resourceId;
          }
        }

        addOrUpdateArrayRecord(this.server.media, media, false,
          (_first: any, _second: any) => {
            return _first.id === _second.id;
          });
        break;

      case McsJobType.DetachServerMedia:
        if (this.hasCompletedJob) {
          if (!isNullOrEmpty(selectedServerJob.clientReferenceObject)) {
            media = this.server.media.find((result) => {
              return result.id === this.activeMediaId;
            });
          }

          if (!isNullOrEmpty(media)) {
            deleteArrayRecord(this.server.media, (targetMedia) => {
              return media.id === targetMedia.id;
            });
          }
        }
        break;

      default:
        // do nothing
        break;
    }
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

  private _setServerFileSystem(): void {
    if (isNullOrEmpty(this.server)) { return; }

    if (this.hasStorage) {
      this.primaryVolume = appendUnitSuffix(this.server.fileSystem[0].capacityGB, 'gigabyte');
      this.secondaryVolumes = this.getSecondaryVolumes(this.server.fileSystem);
    } else {
      this.primaryVolume = '';
      this.secondaryVolumes = '';
    }
  }

  private _getServerThumbnail(): void {
    if (!this.server || !this.consoleEnabled) { return; }

    // Hide thumbnail if it is already displayed in initial routing
    this._hideThumbnail();

    // Get the server thumbnail to be encoded and display in the image
    this._serverService.getServerThumbnail(this.server.id)
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
}
