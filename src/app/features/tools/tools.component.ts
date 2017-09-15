import {
  Component,
  OnInit
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
/** Services */
import { McsTextContentProvider } from '../../core';
import { ToolsService } from './tools.service';
import { ToolsDataSource } from './tools.datasource';

@Component({
  selector: 'mcs-tools',
  templateUrl: './tools.component.html',
  styles: [require('./tools.component.scss')]
})

export class ToolsComponent implements OnInit {
  public textContent: any;

  // Table variables
  public dataSource: ToolsDataSource;
  public dataColumns: string[];

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _toolsService: ToolsService
  ) {
    this.textContent = this._textContentProvider.content.tools;
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
    this.dataSource = new ToolsDataSource(this._toolsService);
  }
}
