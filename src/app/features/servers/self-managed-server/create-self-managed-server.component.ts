import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ChangeDetectorRef
} from '@angular/core';
import { Router } from '@angular/router';
import {
  McsList,
  McsListItem,
  CoreDefinition,
  McsTextContentProvider
} from '../../../core';
import {
  mergeArrays,
  refreshView
} from '../../../utilities';
import { ContextualHelpDirective } from '../shared/contextual-help/contextual-help.directive';
import { CreateSelfManagedServerService } from './create-self-managed-server.service';

@Component({
  selector: 'mcs-create-self-managed-server',
  templateUrl: './create-self-managed-server.component.html',
  styles: [require('./create-self-managed-server.component.scss')]
})

export class CreateSelfManagedServerComponent implements OnInit, AfterViewInit {
  public contextualTextContent: any;
  public createServerTextContent: any;
  public intellicentreValue: any;
  public intellicentres: any;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  private _mainContextInformations: ContextualHelpDirective[];
  private _subContextInformations: ContextualHelpDirective[];

  public get addIconKey() {
    return CoreDefinition.ASSETS_SVG_ADD_BLACK;
  }

  public constructor(
    private _managedServerService: CreateSelfManagedServerService,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
  }

  public ngOnInit() {
    this.createServerTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.contextualTextContent = this.createServerTextContent.contextualHelp;

    this.intellicentres = this.getIntellicentres();
    // TODO: Navigate to create/new
    // this.navigateToNewServer();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      if (this.contextualHelpDirectives) {
        this._mainContextInformations = this.contextualHelpDirectives
          .map((description) => {
            return description;
          });
      }

      this._managedServerService.contextualHelpStream
        .subscribe((routedContextInformations) => {
          if (routedContextInformations) {
            this._subContextInformations = routedContextInformations;
          }
        });
    });
  }

  public getAllContextualInformations() {
    return mergeArrays(this._mainContextInformations, this._subContextInformations);
  }

  public getIntellicentres(): McsList {
    // TODO: Set the actual obtainment of real data to be displayed here
    let itemList: McsList = new McsList();

    itemList.push('intellicentres',
      new McsListItem('intellicentre1', 'Intellicentre 1 (Syd) - VC 27117006'));
    itemList.push('intellicentres',
      new McsListItem('intellicentre2', 'Intellicentre 2 (Syd) - VC 27117007'));
    itemList.push('intellicentres',
      new McsListItem('intellicentre3', 'Intellicentre 3 (Syd) - VC 27117008'));
    return itemList;
  }

  public navigateToNewServer() {
    this._router.navigate(['./servers/create/new']);
  }

  public onDeployClick(event: any) {
    this._router.navigate(['./servers/provisioning']);
  }
}
