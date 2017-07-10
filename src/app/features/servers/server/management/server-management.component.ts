import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2
} from '@angular/core';
import { Router } from '@angular/router';
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
  McsListItem
} from '../../../../core';
import {
  getEncodedUrl,
  animateFactory,
  refreshView
} from '../../../../utilities';
import { Observable } from 'rxjs/Rx';
import { ServerService } from '../server.service';

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

  public subscription: any;

  public isServerScale: boolean;

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

  constructor(
    private _router: Router,
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService,
    private _renderer: Renderer2
  ) {
    this.isServerScale = false;
  }

  public ngOnInit() {
    // OnInit
    this.serverManagementTextContent = this._textProvider.content.servers.server.management;

    this.subscription = this._serverService.selectedServerStream.subscribe((server) => {
      if (server) {
        this.server = server;
        this.serviceType = this.server.serviceType;
        this._getServerThumbnail();
      }
    });
  }

  public getSecondaryVolumes(serverfileSystems: ServerFileSystem[]) {
    let storage = new Array();

    for (let fileSystems of serverfileSystems.slice(1)) {
      storage.push(fileSystems.capacityGB + 'GB');
    }

    return storage.join(', ');
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

  public onClickScale(scaleModal: any): void {
    // Close Modal
    if (scaleModal) { scaleModal.close(); }
    if (!this._serverCpuSizeScale) { return; }

    // TODO: Check for dirty/prestine to prevent sending of API request if no data was changed
    // Update the Server CPU size scale
    this._serverService.setPerformanceScale(this.server.id, this._serverCpuSizeScale);
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
    this._renderer.setAttribute(this.thumbnailElement.nativeElement,
      'src', this.serverThumbnailEncoding);
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
