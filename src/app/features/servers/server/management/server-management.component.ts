import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Server,
  ServerFileSystem,
  ServerPerformanceScale,
  ServerThumbnail,
  ServerPowerState,
  ServerPlatform,
  ServerResource,
  ServerServiceType
} from '../../models';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsApiJob,
  McsNotificationContextService,
  McsBrowserService,
  McsDeviceType,
  McsJobType
} from '../../../../core';
import {
  getEncodedUrl,
  refreshView,
  appendUnitSuffix,
  isNullOrEmpty
} from '../../../../utilities';
import { ServerService } from '../server.service';

@Component({
  selector: 'mcs-server-management',
  styleUrls: ['./server-management.component.scss'],
  templateUrl: './server-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServerManagementComponent implements OnInit, OnDestroy {
  @ViewChild('thumbnailElement')
  public thumbnailElement: ElementRef;

  public serverManagementTextContent: any;
  public primaryVolume: string;
  public secondaryVolumes: string;
  public otherStorage: ServerFileSystem[];
  public serviceType: ServerServiceType;

  public serverThumbnail: ServerThumbnail;
  public serverThumbnailEncoding: string;

  public serverSubscription: any;
  public scalingSubscription: any;
  public notificationsSubscription: any;
  public deviceTypeSubscription: any;
  public serverScaleJobs: McsApiJob[];

  public platformData: ServerPlatform;
  public platformDataSubscription: any;
  public resource: ServerResource;

  public remainingMemory: number;
  public remainingCpu: number;

  public initialServerPerformanceScaleValue: ServerPerformanceScale;

  private _serverCpuSizeScale: ServerPerformanceScale;
  private _deviceType: McsDeviceType;

  private _server: Server;
  public get server(): Server {
    return this._server;
  }
  public set server(value: Server) {
    this._server = value;
    this._changeDetectorRef.markForCheck();
  }

  private _isServerScale: boolean;
  public get isServerScale(): boolean {
    return this._isServerScale;
  }
  public set isServerScale(value: boolean) {
    if (this._isServerScale !== value) {
      this._isServerScale = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _isScaling: boolean;
  public get isScaling(): boolean {
    return this._isScaling;
  }
  public set isScaling(value: boolean) {
    if (this._isScaling !== value) {
      this._isScaling = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _serverMemoryValue: string;
  public get serverMemoryValue(): string {
    return this._serverMemoryValue;
  }
  public set serverMemoryValue(value: string) {
    if (this._serverMemoryValue !== value) {
      this._serverMemoryValue = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _serverCpuValue: string;
  public get serverCpuValue(): string {
    return this._serverCpuValue;
  }
  public set serverCpuValue(value: string) {
    if (this._serverCpuValue !== value) {
      this._serverCpuValue = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.serviceType === ServerServiceType.Managed;
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
    return this.initialServerPerformanceScaleValue &&
      this._serverCpuSizeScale && this._serverCpuSizeScale.valid &&
      (this.initialServerPerformanceScaleValue.memoryMB < this._serverCpuSizeScale.memoryMB ||
        this.initialServerPerformanceScaleValue.cpuCount < this._serverCpuSizeScale.cpuCount);
  }

  public get isPoweredOn(): boolean {
    return this.server.powerState === ServerPowerState.PoweredOn;
  }

  public get hasNetworkInformation(): boolean {
    return !isNullOrEmpty(this.server.interfaces);
  }

  public get hasStorageInformation(): boolean {
    return !isNullOrEmpty(this.primaryVolume)
      || !isNullOrEmpty(this.secondaryVolumes)
      || !isNullOrEmpty(this.server.storagePolicy);
  }

  constructor(
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService,
    private _renderer: Renderer2,
    private _notificationContextService: McsNotificationContextService,
    private _browserService: McsBrowserService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.server = new Server();
    this.initialServerPerformanceScaleValue = new ServerPerformanceScale();
    this._serverCpuSizeScale = new ServerPerformanceScale();
    this.serverScaleJobs = new Array();
    this.platformData = new ServerPlatform();
    this.resource = new ServerResource();
    this.serviceType = ServerServiceType.SelfManaged;
    this.primaryVolume = '';
    this.secondaryVolumes = '';
    this.isServerScale = false;
    this.isScaling = false;
  }

  public ngOnInit() {
    this.serverManagementTextContent = this._textProvider.content.servers.server.management;

    this.platformDataSubscription = this._serverService.getPlatformData()
      .subscribe((data) => {
        this.platformData = data.content;
      });

    this.serverSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        if (server) {
          // Get server data
          this.server = server;

          // Initialize values
          this._getServerDetails();
          this._getServerThumbnail();
          this._getScalingJobStatus();

          refreshView(() => {
            if (!this.consoleEnabled) {
              this._hideThumbnail();
            }
          }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        }
      });

    // Listen to notifications stream
    this.notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((jobs) => {
        this.serverScaleJobs = jobs.filter((job) => {
          return job.type === McsJobType.UpdateServer;
        });

        this._getScalingJobStatus();
      });

    // Listen to device change
    this.deviceTypeSubscription = this._browserService.deviceTypeStream
      .subscribe((deviceType) => {
        this._deviceType = deviceType;
        this._changeDetectorRef.markForCheck();
      });
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

  public scaleServer() {
    if (isNullOrEmpty(this.platformData)) { return; }

    this.resource = this._getResourceByVdc(this.server.vdcName);
    this._initializeServerPerformanceScaleValue();
    this.isServerScale = true;
  }

  public onScaleChanged(scale: ServerPerformanceScale) {
    this._serverCpuSizeScale = scale;
  }

  public onClickScale(): void {
    if (!this._serverCpuSizeScale || !this.hasUpdate) { return; }

    this.isServerScale = false;
    this.isScaling = true;

    // Update the Server CPU size scale
    this.scalingSubscription = this._serverService.setPerformanceScale(
      this.server.id, this._serverCpuSizeScale).subscribe();
  }

  public cancelScale(): void {
    this.isServerScale = false;
    this._serverCpuSizeScale = undefined;
  }

  public ngOnDestroy() {
    if (this.serverSubscription) {
      this.serverSubscription.unsubscribe();
    }

    if (this.scalingSubscription) {
      this.scalingSubscription.unsubscribe();
    }

    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }

    if (this.deviceTypeSubscription) {
      this.deviceTypeSubscription.unsubscribe();

    }

    if (this.platformDataSubscription) {
      this.platformDataSubscription.unsubscribe();
    }

    if (this._serverCpuSizeScale) {
      this._serverCpuSizeScale = undefined;
    }
  }

  private _getResourceByVdc(vdcName: string): ServerResource {
    if (!this.platformData.environments) { return; }

    let serverResource: ServerResource;

    for (let environment of this.platformData.environments) {
      serverResource = environment.resources.find((result) => {
        return result.name === vdcName;
      });

      if (serverResource) {
        break;
      }
    }

    return serverResource;
  }

  private _getServerDetails() {
    if (isNullOrEmpty(this.server)) { return; }

    this._setServerMemoryCpuValues();

    this.serviceType = this.server.serviceType;

    if (this.hasStorage) {
      this.primaryVolume = appendUnitSuffix(this.server.fileSystem[0].capacityGB, 'gigabyte');
      this.secondaryVolumes = this.getSecondaryVolumes(this.server.fileSystem);
    } else {
      this.primaryVolume = '';
      this.secondaryVolumes = '';
    }

    this.isScaling = false;
  }

  private _setServerMemoryCpuValues(): void {
    if (isNullOrEmpty(this.server)) { return; }

    this.serverMemoryValue = appendUnitSuffix(this.server.memoryMB, 'megabyte');
    this.serverCpuValue = appendUnitSuffix(this.server.cpuCount, 'cpu');
  }

  private _initializeServerPerformanceScaleValue() {
    if (this.server) {
      this.initialServerPerformanceScaleValue.memoryMB = this.server.memoryMB;
      this.initialServerPerformanceScaleValue.cpuCount = this.server.cpuCount;
    }

    if (this.resource) {
      this.remainingMemory = this.resource.memoryLimitMB - this.resource.memoryUsedMB;
      this.remainingCpu = this.resource.cpuLimit - this.resource.cpuUsed;
    }

    this._changeDetectorRef.markForCheck();
  }

  private _getScalingJobStatus() {
    if (isNullOrEmpty(this.serverScaleJobs) && this.server) { return; }

    let activeServerJob = this.serverScaleJobs.find((job) => {
      return job.clientReferenceObject.activeServerId === this.server.id;
    });

    if (isNullOrEmpty(activeServerJob)) { return; }

    switch (activeServerJob.status) {
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        if (!isNullOrEmpty(activeServerJob.clientReferenceObject)) {
          this.server.memoryMB = activeServerJob.clientReferenceObject.memoryMB;
          this.server.cpuCount = activeServerJob.clientReferenceObject.cpuCount;
          this._setServerMemoryCpuValues();
        }
        this.isScaling = false;
        break;

      case CoreDefinition.NOTIFICATION_JOB_PENDING:
      case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
        this.isScaling = true;
        break;

      case CoreDefinition.NOTIFICATION_JOB_FAILED:
      default:
        this.isScaling = false;
        break;
    }

    this._changeDetectorRef.markForCheck();
  }

  private _getServerThumbnail() {
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

  private _showThumbnail() {
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

  private _hideThumbnail() {
    if (!this.thumbnailElement) { return; }

    refreshView(() => {
      this._renderer.setStyle(this.thumbnailElement.nativeElement, 'display', 'none');
      this._renderer.removeAttribute(this.thumbnailElement.nativeElement, 'src');
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
