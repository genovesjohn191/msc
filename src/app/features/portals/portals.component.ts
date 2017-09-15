import {
  Component,
  OnInit
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
/** Services */
import { McsTextContentProvider } from '../../core';
import { PortalsService } from './portals.service';
import { PortalsDataSource } from './portals.datasource';

@Component({
  selector: 'mcs-portals',
  templateUrl: './portals.component.html',
  styles: [require('./portals.component.scss')]
})

export class PortalsComponent implements OnInit {
  public textContent: any;

  // Table variables
  public dataSource: PortalsDataSource;
  public dataColumns: string[];

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _portalsService: PortalsService
  ) {
    this.textContent = this._textContentProvider.content.portals;
    this.dataColumns = ['serviceType','description', 'portal'];
  }

  public ngOnInit(): void {
    this._initiliazeDatasource();
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  private _initiliazeDatasource(): void {
    // Set datasource
    this.dataSource = new PortalsDataSource(this._portalsService);
  }
}
