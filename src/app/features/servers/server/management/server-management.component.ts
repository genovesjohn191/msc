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
  Server,
  ServerFileSystem,
  ServerPerformanceScale,
  ServerThumbnail,
  ServerPowerState,
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

  public resource: ServerResource;

  public jobs: McsApiJob[];
  public remainingMemory: number;
  public remainingCpu: number;

  public serverSubscription: Subscription;
  public resourceSubscription: Subscription;

  private _resourceMap: Map<string, ServerResource>;
  private _serverPerformanceScale: ServerPerformanceScale;
  private _deviceType: McsDeviceType;

  private _hasServer: boolean;

  private _scalingSubscription: Subscription;
  private _paramsSubscription: Subscription;
  private _notificationsSubscription: Subscription;
  private _deviceTypeSubscription: Subscription;

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

  private _isProcessing: boolean;
  public get isProcessing(): boolean {
    return this._isProcessing;
  }
  public set isProcessing(value: boolean) {
    if (this._isProcessing !== value) {
      this._isProcessing = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public get serverMemoryValue(): string {
    return appendUnitSuffix(this.server.memoryMB, 'megabyte');
  }

  public get serverCpuValue(): string {
    return appendUnitSuffix(this.server.cpuCount, 'cpu');
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
    return this._serverPerformanceScale.valid &&
      (this.server.memoryMB < this._serverPerformanceScale.memoryMB ||
        this.server.cpuCount < this._serverPerformanceScale.cpuCount);
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
      || (!isNullOrEmpty(this.server.environment)
      && !isNullOrEmpty(this.server.environment.resource)
      && !isNullOrEmpty(this.server.environment.resource.storage)
      && !isNullOrEmpty(this.server.environment.resource.storage.name));
  }

  constructor(
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService,
    private _renderer: Renderer2,
    private _notificationContextService: McsNotificationContextService,
    private _browserService: McsBrowserService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {
    this.primaryVolume = '';
    this.secondaryVolumes = '';
    this.serviceType = ServerServiceType.SelfManaged;
    this.resource = new ServerResource();
    this.server = new Server();
    this.jobs = new Array();
    this._resourceMap = new Map<string, ServerResource>();
    this._hasServer = false;
    this.isServerScale = false;
    this.isScaling = false;
    this.isProcessing = false;
    this._serverPerformanceScale = new ServerPerformanceScale();
  }

  public ngOnInit(): void {
    this.serverManagementTextContent = this._textProvider.content.servers.server.management;

    this._setServerData();
    this._getScaleParam();
    this._listenToNotificationsStream();
    this._listenToDeviceChange();
  }

  public ngOnDestroy(): void {
    if (this.serverSubscription) {
      this.serverSubscription.unsubscribe();
    }

    if (this.resourceSubscription) {
      this.resourceSubscription.unsubscribe();
    }

    if (this._scalingSubscription) {
      this._scalingSubscription.unsubscribe();
    }

    if (this._notificationsSubscription) {
      this._notificationsSubscription.unsubscribe();
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

  public scaleServer(): void {
    this._setResourceData();
    this.isServerScale = true;
  }

  public onScaleChanged(scale: ServerPerformanceScale) {
    this._serverPerformanceScale = scale;
  }

  public onClickScale(): void {
    if (!this._serverPerformanceScale || !this.hasUpdate) { return; }

    this.isServerScale = false;
    this.isScaling = true;

    // Update the Server CPU size scale
    this._scalingSubscription = this._serverService.setPerformanceScale(
      this.server.id, this._serverPerformanceScale, this.server.powerState).subscribe();
    this._router.navigate(['/servers/', this.server.id, 'management']);
  }

  public cancelScale(): void {
    this._serverPerformanceScale = new ServerPerformanceScale();
    this.isServerScale = false;
  }

  private _setServerData(): void {
    this.serverSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        if (server) {
          // Get server data
          this.server = server;

          // Initialize values
          this._getServerDetails();
          this._getServerThumbnail();
          this._getScalingJobStatus();
          this._getScaleParam();

          refreshView(() => {
            if (!this.consoleEnabled) {
              this._hideThumbnail();
            }
          }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        }
      });
  }

  private _setResourceData(): void {
    this.resourceSubscription = this._serverService.getResources()
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }

        this._resourceMap = this._serverService.setResourceMap(response.content);

        let hasResource = !isNullOrEmpty(this.server.environment)
          && !isNullOrEmpty(this.server.environment.resource);

        if (hasResource) {
          let resourceName = this.server.environment.resource.name;

          if (this._resourceMap.has(resourceName)) {
            this.resource = this._resourceMap.get(resourceName);
          }
        }

        this._setRemainingValues();
      });
  }

  private _setRemainingValues(): void {
    if (isNullOrEmpty(this.server) || isNullOrEmpty(this.resource)) { return; }

    this.remainingMemory = this._serverService.computeAvailableMemoryMB(this.resource);
    this.remainingCpu = this._serverService.computeAvailableCpu(this.resource);

    this._changeDetectorRef.markForCheck();
  }

  private _getServerDetails(): void {
    if (isNullOrEmpty(this.server)) { return; }

    this.serviceType = this.server.serviceType;

    if (this.hasStorage) {
      this.primaryVolume = appendUnitSuffix(this.server.fileSystem[0].capacityGB, 'gigabyte');
      this.secondaryVolumes = this.getSecondaryVolumes(this.server.fileSystem);
    } else {
      this.primaryVolume = '';
      this.secondaryVolumes = '';
    }

    this._hasServer = true;
    this.isServerScale = false;
    this.isScaling = false;
  }

  private _getScalingJobStatus(): void {
    if (isNullOrEmpty(this.jobs) && this.server) { return; }

    let activeServerJob = this.jobs.find((job) => {
      return !isNullOrEmpty(job.clientReferenceObject) &&
        job.clientReferenceObject.serverId === this.server.id;
    });

    this.isProcessing = !isNullOrEmpty(activeServerJob) &&
      (activeServerJob.status === CoreDefinition.NOTIFICATION_JOB_PENDING ||
      activeServerJob.status === CoreDefinition.NOTIFICATION_JOB_ACTIVE);

    if (!isNullOrEmpty(activeServerJob) && activeServerJob.type === McsJobType.UpdateServer) {
      switch (activeServerJob.status) {
        case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
          if (!isNullOrEmpty(activeServerJob.clientReferenceObject)) {
            this.server.memoryMB = activeServerJob.clientReferenceObject.memoryMB;
            this.server.cpuCount = activeServerJob.clientReferenceObject.cpuCount;
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
    }

    this._changeDetectorRef.markForCheck();
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

  private _getScaleParam(): void {
    this._paramsSubscription = this._activatedRoute.queryParams
      .subscribe((params: ParamMap) => {
        if (this._hasServer && params['scale']) {
          this.scaleServer();
        }
      });
  }

  private _listenToNotificationsStream(): void {
    this._notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((jobs) => {
        this.jobs = jobs;
        this._getScalingJobStatus();
      });
  }

  private _listenToDeviceChange(): void {
    this._deviceTypeSubscription = this._browserService.deviceTypeStream
      .subscribe((deviceType) => {
        this._deviceType = deviceType;
        this._changeDetectorRef.markForCheck();
      });
  }
}
