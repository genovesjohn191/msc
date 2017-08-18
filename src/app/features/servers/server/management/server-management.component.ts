import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2
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
  McsList,
  McsListItem,
  McsApiSuccessResponse,
  McsApiJob,
  McsNotificationContextService,
  McsBrowserService,
  McsDeviceType
} from '../../../../core';
import {
  getEncodedUrl,
  animateFactory,
  refreshView,
  getElementStyle,
  appendUnitSuffix
} from '../../../../utilities';
import { Observable } from 'rxjs/Rx';
import { ServerService } from '../server.service';
import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

@Component({
  selector: 'mcs-server-management',
  styles: [require('./server-management.component.scss')],
  templateUrl: './server-management.component.html'
})

export class ServerManagementComponent implements OnInit, OnDestroy {
  public server: Server;
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
  public activeNotifications: McsApiJob[];

  public platformData: ServerPlatform;
  public platformDataSubscription: any;
  public resource: ServerResource;

  public serverMemoryValue: string;
  public serverCpuValue: string;

  public remainingMemory: number;
  public remainingCpu: number;

  public isServerScale: boolean;
  public isScaling: boolean;
  public scalingResponse: McsApiSuccessResponse<McsApiJob>;

  public initialServerPerformanceScaleValue: ServerPerformanceScale;

  @ViewChild('thumbnailElement')
  public thumbnailElement: ElementRef;

  private _serverCpuSizeScale: ServerPerformanceScale;
  private _deviceType: McsDeviceType;

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
    return CoreDefinition.ASSETS_FONT_SPINNER;
  }

  public get hasStorage(): boolean {
    return this.server.fileSystem && this.server.fileSystem.length > 0;
  }

  public get hasMedia(): boolean {
    return this.server.media && this.server.media.length < 0;
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

  constructor(
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService,
    private _renderer: Renderer2,
    private _notificationContextService: McsNotificationContextService,
    private _browserService: McsBrowserService
  ) {
    this.initialServerPerformanceScaleValue = new ServerPerformanceScale();
    this._serverCpuSizeScale = new ServerPerformanceScale();
    this.activeNotifications = new Array();
    this.platformData = new ServerPlatform();
    this.resource = new ServerResource();
    this.serviceType = ServerServiceType.SelfManaged;
  }

  public ngOnInit() {
    this.serverManagementTextContent = this._textProvider.content.servers.server.management;

    this.serverSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        if (server) {
          // Get server data
          this.server = server;
          this.serviceType = this.server.serviceType;

          this.serverMemoryValue = appendUnitSuffix(server.memoryMB, 'megabyte');
          this.serverCpuValue = appendUnitSuffix(server.cpuCount, 'cpu');

          if (this.hasStorage) {
            this.primaryVolume = appendUnitSuffix(this.server.fileSystem[0].capacityGB, 'gigabyte');
            this.secondaryVolumes = this.getSecondaryVolumes(this.server.fileSystem);
          }
          this._getServerThumbnail();

          // Initialize values
          this.isServerScale = false;
          this.isScaling = false;
          this._getScalingNotificationStatus();

          refreshView(() => {
            if (!this.consoleEnabled) {
              this._hideThumbnail();
            }
          }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
        }
      });

    // Listen to notifications stream
    this.notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((updatedNotifications) => {
        this.activeNotifications = updatedNotifications;
        this._getScalingNotificationStatus();
      });

    // Listen to device change
    this.deviceTypeSubscription = this._browserService.deviceTypeStream
      .subscribe((deviceType) => {
        this._deviceType = deviceType;
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

  public getServerStorageProfile() {
    let list: McsList = new McsList();

    list.push('', new McsListItem('disk-storage-profile', 'Disk Storage Profile'));

    return list;
  }

  public getServerStorageCapacity() {
    let list: McsList = new McsList();

    list.push('', new McsListItem('100GB', '100 GB'));
    list.push('', new McsListItem('150GB', '150 GB'));
    list.push('', new McsListItem('200GB', '200 GB'));
    list.push('', new McsListItem('500GB', '500 GB'));
    list.push('', new McsListItem('1TB', '1 TB'));

    return list;
  }

  public scaleServer() {
    if (this.platformDataSubscription) {
      this.platformDataSubscription.unsubscribe();
    }

    this.platformDataSubscription = this._serverService.getPlatformData()
      .subscribe((data) => {
        this.platformData = data.content;
        this.resource = this._getResourceByVdc(this.server.vdcName);
        this._initializeServerPerformanceScaleValue();
        this.isServerScale = true;
      });
  }

  public onScaleChanged(scale: ServerPerformanceScale) {
    this._serverCpuSizeScale = scale;
  }

  public onClickScale(): void {
    if (!this._serverCpuSizeScale || !this.hasUpdate) { return; }

    this.isServerScale = false;
    this.isScaling = true;

    // Update the Server CPU size scale
    this.scalingSubscription =
      this._serverService.setPerformanceScale(this.server.id, this._serverCpuSizeScale)
        .subscribe((response) => {
          this.scalingResponse = response;
        });
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

  private _getScalingNotificationStatus() {
    if (this.activeNotifications.length > 0 && this.server) {
      let serverScalingNotification: McsApiJob = this.activeNotifications.find((notification) => {
        let isFound: boolean = false;
        if (notification.clientReferenceObject) {
          isFound = notification.clientReferenceObject.activeServerId === this.server.id;
        }
        return isFound;
      });

      this.isScaling = serverScalingNotification &&
        !(serverScalingNotification.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED);
    }
  }

  private _initializeServerPerformanceScaleValue() {
    if (this.server) {
      this.initialServerPerformanceScaleValue.memoryMB = this.server.memoryMB;
      this.initialServerPerformanceScaleValue.cpuCount = this.server.cpuCount;
    }

    if (this.resource) {
      this.remainingMemory = this.resource.memoryAllocationMB - this.resource.memoryReservationMB;
      this.remainingCpu = this.resource.cpuAllocation - this.resource.cpuReservation;
    }
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
