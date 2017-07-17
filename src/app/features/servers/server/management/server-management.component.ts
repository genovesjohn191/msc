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
  ServerThumbnail
} from '../../models';
import {
  McsTextContentProvider,
  CoreDefinition,
  McsList,
  McsListItem,
  McsApiSuccessResponse,
  McsApiJob,
  McsNotificationContextService
} from '../../../../core';
import {
  getEncodedUrl,
  animateFactory,
  refreshView,
  getElementStyle
} from '../../../../utilities';
import { Observable } from 'rxjs/Rx';
import { ServerService } from '../server.service';
import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

const THUMBNAIL_ANIMATION_FADE = 100;

@Component({
  selector: 'mcs-server-management',
  styles: [require('./server-management.component.scss')],
  templateUrl: './server-management.component.html',
  animations: [animateFactory({ duration: THUMBNAIL_ANIMATION_FADE })]
})

export class ServerManagementComponent implements OnInit, OnDestroy {
  public server: Server;
  public serverManagementTextContent: any;
  public primaryVolume: string;
  public secondaryVolumes: string;
  public otherStorage: ServerFileSystem[];
  public serviceType: string;

  public thumbnailFadeIn: string;
  public thumbnailVisible: boolean;

  public serverThumbnail: ServerThumbnail;
  public serverThumbnailEncoding: string;

  public serverSubscription: any;
  public scalingSubscription: any;
  public notificationsSubscription: any;
  public activeNotifications: any;

  public isServerScale: boolean;
  public isValidScale: boolean;
  public isScaling: boolean;
  public scalingResponse: McsApiSuccessResponse<McsApiJob>;

  public initialServerPerformanceScaleValue: ServerPerformanceScale;

  @ViewChild('thumbnailElement')
  public thumbnailElement: ElementRef;

  private _serverCpuSizeScale: ServerPerformanceScale;

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    if (this.serviceType) {
      return this.serviceType.toLowerCase() === CoreDefinition.MANAGED_SERVER.toLowerCase();
    }
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SPINNER;
  }

  public get hasMedia(): boolean {
    return this.server.media && this.server.media.length < 0;
  }

  public get hasUpdate(): boolean {
    return this.initialServerPerformanceScaleValue &&
      this._serverCpuSizeScale && this.isValidScale &&
        (this.initialServerPerformanceScaleValue.memoryMB < this._serverCpuSizeScale.memoryMB ||
          this.initialServerPerformanceScaleValue.cpuCount < this._serverCpuSizeScale.cpuCount);
  }

  constructor(
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService,
    private _renderer: Renderer2,
    private _notificationContextService: McsNotificationContextService
  ) {
    this.initialServerPerformanceScaleValue = new ServerPerformanceScale();
    this._serverCpuSizeScale = new ServerPerformanceScale();
  }

  public ngOnInit() {
    this.serverManagementTextContent = this._textProvider.content.servers.server.management;

    this.serverSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        if (server) {
          this.server = server;
          this.serviceType = this.server.serviceType;
          this.primaryVolume = this.server.fileSystem[0].capacityGB + 'GB';
          this.secondaryVolumes = this.getSecondaryVolumes(this.server.fileSystem);
          this._getServerThumbnail();
          this._initializeServerPerformanceScaleValue();
          this.isServerScale = false;
          this.isValidScale = false;
          this.isScaling = false;
        }
      });

    // Listen to the active notifications
    this.notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((updatedNotifications) => {
        this.activeNotifications = updatedNotifications;
        this._getScalingNotificationStatus();
      });
  }

  public getSecondaryVolumes(serverfileSystem: ServerFileSystem[]) {
    let storage = new Array();

    for (let fileSystem of serverfileSystem.slice(1)) {
      storage.push(fileSystem.capacityGB + 'GB');
    }

    return storage.join(', ');
  }

  public onClickViewConsole() {
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

  public onScaleChanged(scale: ServerPerformanceScale) {
    this._serverCpuSizeScale = scale;
  }

  public onValidateScaleChanged(event) {
    this.isValidScale = event;
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

    if (this._serverCpuSizeScale) {
      this._serverCpuSizeScale = undefined;
    }
  }

  private _getScalingNotificationStatus() {
    if (this.activeNotifications.length > 0 && this.scalingResponse) {
      let serverScalingNotification = this.activeNotifications.find((notification) => {
        return notification.id === this.scalingResponse.content.id;
      });

      this.isScaling = !(serverScalingNotification.status ===
        CoreDefinition.NOTIFICATION_JOB_COMPLETED);
    }
  }

  private _initializeServerPerformanceScaleValue() {
    this.initialServerPerformanceScaleValue.memoryMB = this.server.memoryMB;
    this.initialServerPerformanceScaleValue.cpuCount = this.server.cpuCount;
  }

  private _getServerThumbnail() {
    if (!this.server) { return; }

    // Hide thumbnail if it is already dispayed in initial routing
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

    this.thumbnailVisible = true;
    this.thumbnailFadeIn = 'fadeIn';

    // Clear thumbnail size
    this._renderer.removeStyle(this.thumbnailElement.nativeElement, 'height');
    this._renderer.removeStyle(this.thumbnailElement.nativeElement, 'width');

    // Add thumbnail source
    this._renderer.setAttribute(this.thumbnailElement.nativeElement,
      'src', this.serverThumbnailEncoding);

    // Adjust size of the thumbnail
    this._setThumbnailSize();
  }

  private _setThumbnailSize(): void {
    refreshView(() => {
      let width = getElementStyle(this.thumbnailElement.nativeElement, 'width');
      this._renderer.setStyle(this.thumbnailElement.nativeElement, 'width', `calc(${width} * 2)`);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  private _hideThumbnail() {
    if (!this.thumbnailElement) { return; }

    this.thumbnailFadeIn = 'fadeOut';
    refreshView(() => {
      this.thumbnailVisible = false;
      this._renderer.removeAttribute(this.thumbnailElement.nativeElement, 'src');
    }, THUMBNAIL_ANIMATION_FADE + 50);
  }
}
