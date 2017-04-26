import {
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Server } from '../../';
import { TextContentProvider } from '../../../../core';

@Component({
  selector: 'mcs-server-management',
  styles: [require('./server-management.component.scss')],
  templateUrl: './server-management.component.html'
})

export class ServerManagementComponent implements OnInit {
  public server: Server;
  public serverManagementCopyTexts: any;

  constructor(
    private _route: ActivatedRoute,
    private _textProvider: TextContentProvider
  ) {}

  public ngOnInit() {
    this.server = this._route.parent.snapshot.data.server;
    this.serverManagementCopyTexts = this._textProvider.content.servers.server.management;
  }

}
