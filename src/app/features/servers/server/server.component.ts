import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { Server } from '../shared';
import { CoreDefinition } from '../../../core';

@Component({
  selector: 'mcs-server',
  styles: [require('./server.component.scss')],
  templateUrl: './server.component.html'
})
export class ServerComponent implements OnInit {
  public servers: Server[];
  public serviceType: string;

  // Check if the current server's serverType is managed
  public get isManaged(): boolean {
    return this.serviceType && this.serviceType.toLowerCase()
      === CoreDefinition.MANAGED_SERVER.toLowerCase();
  }

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  public ngOnInit() {
    if (this._route.snapshot.data.servers.content && this._route.snapshot.data.server.content) {
      this.serviceType = this._route.snapshot.data.server.content.serviceType;
      this.servers = this._route.snapshot.data.servers.content;
    } else {
      this._router.navigate(['/page-not-found']);
    }
  }

}
