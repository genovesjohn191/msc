import {
  Component,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Server } from '../server';

@Component({
  selector: 'mcs-server',
  styles: [require('./server.component.scss')],
  templateUrl: './server.component.html'
})
export class ServerComponent implements OnInit {
  public servers: Server[];

  constructor(private _route: ActivatedRoute) {}

  public ngOnInit() {
    this.servers = this._route.snapshot.data.servers.content;
  }

}
