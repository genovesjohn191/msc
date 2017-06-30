import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Router,
  NavigationEnd,
  ActivatedRoute
} from '@angular/router';
import {
  Server,
  ServerFileSystem,
  ServerPerformanceScale
} from '../../models';
import {
  McsTextContentProvider,
  McsApiSuccessResponse,
  CoreDefinition,
  McsBrowserService
} from '../../../../core';
import { Observable } from 'rxjs/Rx';
import { ServerService } from '../server.service';

@Component({
  selector: 'mcs-server-management',
  styles: [require('./server-management.component.scss')],
  templateUrl: './server-management.component.html'
})

export class ServerManagementComponent implements OnInit, OnDestroy {
  public server: Server;
  public serverManagementTextContent: any;
  public subscription: any;
  public primaryVolume: string;
  public secondaryVolumes: string;
  public serviceType: string;

  private _serverCpuSizeScale: ServerPerformanceScale;

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    if (this.serviceType) {
      return this.serviceType.toLowerCase() === CoreDefinition.MANAGED_SERVER.toLowerCase();
    }
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _textProvider: McsTextContentProvider,
    private _browserService: McsBrowserService,
    private _serverService: ServerService
  ) {
    if (this._route.parent.snapshot.data.server.content) {
      this.serverManagementTextContent = this._textProvider.content.servers.server.management;
    } else {
      this._router.navigate(['/page-not-found']);
      return;
    }

    this.subscription = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.server = this._route.parent.snapshot.data.server.content;
        if (this.server.fileSystem.length > 0) {
          this.primaryVolume = this.server.fileSystem[0].capacityInGb + ' GB';
          this.secondaryVolumes = (this.server.fileSystem.length > 1) ?
            this.getSecondaryVolumes(this.server.fileSystem) : '';
        }
        this.serviceType = this.server.serviceType;
        this._browserService.scrollToTop();
      }
    });
  }

  public ngOnInit() {
    // OnInit
  }

  public getSecondaryVolumes(serverfileSystem: ServerFileSystem[]) {
    let storage = new Array();

    for (let fileSystem of serverfileSystem.slice(1)) {
      storage.push(fileSystem.capacityInGb + 'GB');
    }

    return storage.join(', ');
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public getWarningIconKey(): string {
    // TODO: Return the core definition here
    return 'warning';
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
    this._serverService.setCpuSizeScale(this.server.id, this._serverCpuSizeScale);
  }
}
