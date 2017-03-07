import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Http, Headers, Response } from '@angular/http';
/** Services */
import {
  TextContentProvider,
  McsPortalApiService
} from '../../core';
import { NetworkingService } from './networking.service';
/** Models */
import { NetworkingModel } from './networking.model';

@Component({
  selector: 'mcs-networking',
  templateUrl: './networking.component.html',
  styles: [require('./networking.component.scss')]
})

export class NetworkingComponent implements OnInit {
  public title: string;
  public modelData: NetworkingModel[];

  public constructor(
    private _textProvider: TextContentProvider,
    private _netService: NetworkingService) {
    this.title = this._textProvider.content.networking.title;
  }

  public ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this._netService.getLeadDescription()
      .subscribe((response) => {
        this.modelData = response;
      });
  }
}
