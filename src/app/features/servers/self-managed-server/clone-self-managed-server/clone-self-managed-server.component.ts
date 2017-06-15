import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList
} from '@angular/core';
import {
  McsList,
  McsListItem,
  McsTextContentProvider,
  CoreDefinition
} from '../../../../core';
import { CreateSelfManagedServerService } from '../create-self-managed-server.service';
import { ContextualHelpDirective } from '../../shared/contextual-help/contextual-help.directive';

@Component({
  selector: 'mcs-clone-self-managed-server',
  templateUrl: './clone-self-managed-server.component.html',
  styles: [require('./clone-self-managed-server.component.scss')]
})

export class CloneSelfManagedServerComponent implements OnInit, AfterViewInit {
  public serverCatalogValue: any;
  public serverCatalogItems: McsList;

  public contextualTextContent: any;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  public constructor(
    private _managedServerService: CreateSelfManagedServerService,
    private _textContentProvider: McsTextContentProvider
  ) {
  }

  public ngOnInit() {
    this.contextualTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer.contextualHelp;

    this.serverCatalogItems = this.getServerCatalogs();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      if (this.contextualHelpDirectives) {
        let contextInformations: ContextualHelpDirective[];
        contextInformations = this.contextualHelpDirectives
          .map((description) => {
            return description;
          });
        this._managedServerService.contextualHelpStream.next(contextInformations);
      }
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  public getServerCatalogs(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('Server Catalog', new McsListItem('serverCatalog1', 'mongo-db-prod 1'));
    itemList.push('Server Catalog', new McsListItem('serverCatalog2', 'mongo-db-prod 2'));
    itemList.push('Server Catalog', new McsListItem('serverCatalog3', 'mongo-db-prod 3'));
    return itemList;
  }
}
