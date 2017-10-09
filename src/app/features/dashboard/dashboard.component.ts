import {
  Component,
  OnInit
} from '@angular/core';
import { McsTextContentProvider } from '../../core';

@Component({
  selector: 'mcs-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  public dashboardTextContent: any;

  public constructor(private _textContent: McsTextContentProvider) {
  }

  public ngOnInit() {
    this.dashboardTextContent = this._textContent.content.dashboard;
  }
}
