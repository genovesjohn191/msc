import { Component } from '@angular/core';
/** Services */
import { McsTextContentProvider } from '../../core';
/** Models */
import { NetworkingModel } from './networking.model';

@Component({
  selector: 'mcs-networking',
  templateUrl: './networking.component.html',
  styleUrls: ['./networking.component.scss']
})

export class NetworkingComponent {
  public title: string;
  public modelData: NetworkingModel[];

  public constructor(private _textContentProvider: McsTextContentProvider) {
    this.title = this._textContentProvider.content.networking.title;
  }
}
