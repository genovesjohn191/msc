import {
  Component,
  OnInit
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { Server } from '../server';

@Component({
  selector: 'mcs-server',
  styles: [require('./server.component.scss')],
  templateUrl: './server.component.html'
})
export class ServerComponent implements OnInit {
  public servers: Server[];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  public ngOnInit() {
    if (this._route.snapshot.data.servers.content) {
      this.servers = this._route.snapshot.data.servers.content;
    } else {
      this._router.navigate(['/page-not-found']);
    }
  }

}
