import {
  Component,
  OnInit
} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
/** Models */
import { Dashboard } from './dashboard';
import { Server } from '../servers/server';
import {
  McsList,
  McsListItem
} from '../../core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';

@Component({
  selector: 'mcs-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [require('./dashboard.component.scss')]
})

export class DashboardComponent implements OnInit {
  public title: string;
  public filterItems: any;
  public dashboards: Dashboard[];
  public textboxValue: string;
  public disabled: boolean;
  public servers: Server[];
  public dropdownData: McsList;
  public dropdownValue: string;
  public numberModel: number;
  public textboxModel: any;

  public textEmail: FormControl;
  public reactiveForm: FormGroup;

  public radioButtonHorizontal: any;
  public radioButtonVertical: any;

  public constructor(private _route: ActivatedRoute) {
    this.title = 'Dashboard component';
    this.dashboards = new Array();
    this.dropdownValue = '';
    this.radioButtonHorizontal = 'dhcp';
    this.radioButtonVertical = 'next';
    this.textboxModel = {
      email: '',
      ipAddress: null,
      alphanumeric: '',
      numeric: null,
      pattern: ''
    };
  }

  public ngOnInit() {
    this.setDashboards();
    this.textboxValue = 'Windows Server 2012';
    this.disabled = true;
    this.servers = this._route.snapshot.data.servers.content;
    this.dropdownData = this.servers ? this.mapDropdownData(this.servers) : new McsList();
    this.reactiveForm = new FormGroup({
      textEmail: new FormControl(null, Validators.required),
      textIpAddress: new FormControl(null, Validators.required),
      textAlphanumeric: new FormControl(null, Validators.required),
      textNumeric: new FormControl(null, Validators.required),
      textPattern: new FormControl(null, Validators.required)
    });
  }

  /**
   * TODO: Remove this for official implementation
   */
  public getRadioButtonGroup(): McsListItem[] {
    let items: McsListItem[] = new Array();

    items.push(new McsListItem('dhcp', 'DHCP'));
    items.push(new McsListItem('next', 'Next in my static pool'));
    items.push(new McsListItem('fishy', 'Fishy'));
    return items;
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

  public mapDropdownData(servers: Server[]): McsList {
    if (!servers) { return; }

    let dropdownData = new McsList();

    for (let server of servers) {
      dropdownData.push(
        server.serviceType,
        new McsListItem(server.managementName, server.managementName)
      );
    }

    return dropdownData;
  }
}
