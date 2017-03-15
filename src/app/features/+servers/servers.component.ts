import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
/** Services */
import { TextContentProvider } from '../../core';
import { ServersService } from './servers.service';
import { Server } from './server';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  styles: [require('./servers.component.scss')]
})

export class ServersComponent implements OnInit {
  public title: string;
  public servers: Server[];
  public hasError: boolean = false;
  public loadedSuccesfully: boolean = false;

  public constructor(
    private _textProvider: TextContentProvider,
    private _serversService: ServersService
  ) {
    this.title = _textProvider.content.servers.header;
  }

  public ngOnInit() {
    this._getServers();
  }

  private _getServers() {
    this._serversService.getServers()
    .catch(this.handleError)
    .subscribe((response) => {
      this.loadedSuccesfully = true;
      this.servers = response;
    });
  }

  private handleError (error: Response | any) {
    alert('Oops! Something went wrong while getting server list.');
    console.log(this.hasError);
    return Observable.throw(error);
  }
}
