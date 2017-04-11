import {
  Component,
  OnInit
} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
/** Models */
import {
  StatusBoxAttribute,
  StatusBoxType
} from '../../shared';
import { Dashboard } from './dashboard';
/** Services */
import { FilterProvider } from '../../core';

@Component({
  selector: 'mcs-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [require('./dashboard.component.scss')]
})

export class DashboardComponent implements OnInit {
  public title: string;
  public statusBoxAttribute: StatusBoxAttribute;
  public model: NgbDateStruct;
  public date: { year: number, month: number };
  public currentDate: Date;
  public filterItems: any;
  public dashboards: Dashboard[];
  public textboxValue: string;
  public disabled: boolean;

  public constructor() {
    this.title = 'Dashboard component';
    this.statusBoxAttribute = new StatusBoxAttribute();
    this.currentDate = new Date();
    this.dashboards = new Array();
  }

  public ngOnInit() {
    this.setDashboards();
    this.onDisplayStatusBox();
    this.statusBoxAttribute.dialogState = 'hide';
    this.textboxValue = 'Windows Server 2012';
    this.disabled = true;
  }

  /**
   * TODO: Remove this for official implementation
   * Data should obtained from API
   */
  public setDashboards(): void {
    let dashboard: Dashboard;

    dashboard = new Dashboard();
    dashboard.id = 1;
    dashboard.serverName = 'server 1';
    dashboard.networking = 'networking 1';
    dashboard.catalog = 'catalog 1';
    dashboard.others = 'others 1';
    dashboard.dashboard = 'dashboard 1';
    this.dashboards.push(dashboard);

    dashboard = new Dashboard();
    dashboard.id = 2;
    dashboard.serverName = 'server 2';
    dashboard.networking = 'networking 2';
    dashboard.catalog = 'catalog 2';
    dashboard.others = 'others 2';
    dashboard.dashboard = 'dashboard 2';
    this.dashboards.push(dashboard);

    dashboard = new Dashboard();
    dashboard.id = 3;
    dashboard.serverName = 'server 3';
    dashboard.networking = 'networking 3';
    dashboard.catalog = 'catalog 3';
    dashboard.others = 'others 3';
    dashboard.dashboard = 'dashboard 3';
    this.dashboards.push(dashboard);
  }

  public onGetFilterItems(filters: any): void {
    if (filters) {
      this.filterItems = filters;
    }
  }

  public onSelectToday() {
    this.model = {
      year: this.currentDate.getFullYear(),
      month: this.currentDate.getMonth() + 1,
      day: this.currentDate.getDate()
    };
  }

  public onDisplayStatusBox() {
    this.statusBoxAttribute.type = StatusBoxType.Success;
    this.statusBoxAttribute.dialogState = 'show';
    this.statusBoxAttribute.title = 'mongo-db-1';
    this.statusBoxAttribute.user = 'Arrian';
    this.statusBoxAttribute.description = 'The virtual machine successfully started. ';
  }

  public onButtonClicked(button: any) {
    button.showLoader();
    console.log('start process');
    setTimeout(() => {
      console.log('done');
      button.hideLoader();
    }, 3000);
  }

  public onSearch(textbox: any) {
    textbox.showLoader();
    console.log('start search');
    setTimeout(() => {
      console.log('done');
      textbox.hideLoader();
    }, 2000);
  }
}
