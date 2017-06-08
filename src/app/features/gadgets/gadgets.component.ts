import {
  Component,
  OnInit
} from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
/** Models */
import { Gadgets } from './gadgets';
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
  selector: 'mcs-gadgets',
  templateUrl: './gadgets.component.html',
  styles: [require('./gadgets.component.scss')]
})

export class GadgetsComponent implements OnInit {
  public title: string;
  public filterItems: any;
  public gadgets: Gadgets[];
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

  public sliderValue: number;

  public constructor(private _route: ActivatedRoute) {
    this.title = 'Gadgets component';
    this.gadgets = new Array();
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
    this.sliderValue = 300;
  }

  public ngOnInit() {
    this.setGadgets();
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
  public setGadgets(): void {
    let gadget: Gadgets;

    gadget = new Gadgets();
    gadget.id = 1;
    gadget.serverName = 'server 1';
    gadget.networking = 'networking 1';
    gadget.catalog = 'catalog 1';
    gadget.others = 'others 1';
    gadget.dashboard = 'dashboard 1';
    this.gadgets.push(gadget);

    gadget = new Gadgets();
    gadget.id = 2;
    gadget.serverName = 'server 2';
    gadget.networking = 'networking 2';
    gadget.catalog = 'catalog 2';
    gadget.others = 'others 2';
    gadget.dashboard = 'dashboard 2';
    this.gadgets.push(gadget);

    gadget = new Gadgets();
    gadget.id = 3;
    gadget.serverName = 'server 3';
    gadget.networking = 'networking 3';
    gadget.catalog = 'catalog 3';
    gadget.others = 'others 3';
    gadget.dashboard = 'dashboard 3';
    this.gadgets.push(gadget);
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
