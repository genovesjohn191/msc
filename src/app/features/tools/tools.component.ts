import {
  Component,
  OnInit
} from '@angular/core';
/** Services */
import { McsTextContentProvider } from '../../core';
import { ToolsService } from './tools.service';
import { ToolsDataSource } from './tools.datasource';

@Component({
  selector: 'mcs-tools',
  templateUrl: './tools.component.html'
})

export class ToolsComponent implements OnInit {
  public textContent: any;
  public toolDescription: Map<string, string>;

  // Table variables
  public dataSource: ToolsDataSource;
  public dataColumns: string[];

  public constructor(
    private _textContentProvider: McsTextContentProvider,
    private _toolsService: ToolsService
  ) {
    this.textContent = this._textContentProvider.content.tools;
    this._initializeToolDescriptionMap();
    this.dataColumns = ['name', 'resourceSpecific', 'portalAccess'];
  }

  public ngOnInit(): void {
    this._initiliazeDatasource();
  }

  /**
   * Retry obtaining datasource from tools
   */
  public retryDatasource(): void {
    // We need to initialize again the datasource in order for the
    // observable merge work as expected, since it is closing the
    // subscription when error occured.
    this._initiliazeDatasource();
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  private _initiliazeDatasource(): void {
    // Set datasource
    this.dataSource = new ToolsDataSource(this._toolsService);
  }

  private _initializeToolDescriptionMap(): void {
    let descriptions = this.textContent.table.descriptions;
    this.toolDescription = new Map<string, string>();
    this.toolDescription.set(
      descriptions.macquarieView.name,
      descriptions.macquarieView.description);
    this.toolDescription.set(
      descriptions.vCloud.name,
      descriptions.vCloud.description);
    this.toolDescription.set(
      descriptions.vSphere.name,
      descriptions.vSphere.description);
    this.toolDescription.set(
      descriptions.firewall.name,
      descriptions.firewall.description);
  }
}
