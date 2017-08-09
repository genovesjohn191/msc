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
  McsApiJob,
  McsApiTask,
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
  public notifications: McsApiJob[];

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives;

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
    this.notifications = new Array();
  }

  public ngOnInit() {
    this.createServerTextContent = this._textContentProvider.content
      .servers.createSelfManagedServer;
    this.contextualTextContent = this.createServerTextContent.contextualHelp;

    this.intellicentres = this.getIntellicentres();
    // TODO: Navigate to create/new
    // this.navigateToNewServer();

    // TODO: Set the notifications temporarily
    this._populateNotifications();
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

    itemList.push('Intellicentres',
      new McsListItem('intellicentre1', 'Intellicentre 1 (Syd) - VC 27117006'));
    itemList.push('Intellicentres',
      new McsListItem('intellicentre2', 'Intellicentre 2 (Syd) - VC 27117007'));
    itemList.push('Intellicentres',
      new McsListItem('intellicentre3', 'Intellicentre 3 (Syd) - VC 27117008'));
    return itemList;
  }

  public navigateToNewServer() {
    this._router.navigate(['./servers/create/new']);
  }

  public onDeployClick(event: any) {
    this._router.navigate(['./servers/provisioning']);
  }

  public onNavigateToServerPage() {
    this._router.navigate(['/servers']);
  }

  // TODO: remove this method in official release
  private _populateNotifications() {
    let notification = new McsApiJob();
    // Record 1
    {
      notification.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
      notification.id = '0001';
      notification.description = 'Deploying "mongo-db-prod" in Intellicentre 1 (Syd)';
      notification.tasks = new Array();
      notification.ectInSeconds = 30;
      {
        let task = new McsApiTask();
        task.id = '000A';
        task.description = 'Initializing the new Server';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      {
        let task = new McsApiTask();
        task.id = '000B';
        task.description = 'Preparing the server for deployment.';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      {
        let task = new McsApiTask();
        task.id = '000C';
        task.description = 'Deploying mongo-db-prod: 50GB, 8GB / 2vCPU';
        task.status = CoreDefinition.NOTIFICATION_JOB_ACTIVE;
        notification.tasks.push(task);
      }
      this.notifications.push(notification);
    }
    // Record 2
    {
      notification = new McsApiJob();
      notification.tasks = new Array();
      notification.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
      notification.id = '0002';
      notification.endedOn = new Date('2017-04-26 01:10:45');
      notification.description = 'Deploying "mongo-db-prod" in Intellicentre 2 (Syd)';
      notification.ectInSeconds = 100;
      {
        let task = new McsApiTask();
        task.id = '000A';
        task.description = 'Initializing the new Server';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      {
        let task = new McsApiTask();
        task.id = '000B';
        task.description = 'Deploying web-app-prod: 50GB, 8GB / 2vCPU';
        task.status = CoreDefinition.NOTIFICATION_JOB_COMPLETED;
        notification.tasks.push(task);
      }
      this.notifications.push(notification);
    }
  }
}
