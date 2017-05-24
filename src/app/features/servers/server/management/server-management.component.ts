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
import { Server } from '../../server';
import { ServerFileSystem } from '../../server-file-system';
import {
  McsTextContentProvider,
  McsApiSuccessResponse
} from '../../../../core';
import { Observable } from 'rxjs/Rx';

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

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _textProvider: McsTextContentProvider
  ) {}

  public ngOnInit() {
    if (this._route.parent.snapshot.data.server.content) {
      this.serverManagementTextContent = this._textProvider.content.servers.server.management;
    } else {
      this._router.navigate(['/page-not-found']);
      return;
    }

    this.subscription = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.server = this._route.parent.snapshot.data.server.content;
        this.primaryVolume = this.server.fileSystem[0].capacityInGb + ' GB';
        this.secondaryVolumes = (this.server.fileSystem.length > 1) ?
          this.getSecondaryVolumes(this.server.fileSystem) : '';
      }
    });
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

}
