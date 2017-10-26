import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';
/** Models */
import { Gadgets } from './gadgets';
import { GadgetsDatabase } from './gadgets.database';
import { GadgetsDataSource } from './gadgets.datasource';
import { GadgetsListSource } from './gadgets.listsource';
import { Server } from '../servers/models';
import {
  McsList,
  McsListItem,
  McsPaginator,
  McsModal,
  McsSearch
} from '../../core';
import { refreshView } from '../../utilities';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';
import { ServersService } from '../servers';

@Component({
  selector: 'mcs-gadgets',
  templateUrl: './gadgets.component.html',
  styleUrls: ['./gadgets.component.scss']
})

export class GadgetsComponent implements OnInit, AfterViewInit {
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
  public wizardModel: any;

  public progressValue: number = 10;

  public textEmail: FormControl;
  // public textFirstName: FormControl;

  public reactiveForm: FormGroup;
  public formName: FormGroup;
  public formDetails: FormGroup;

  public radioButtonHorizontal: any;
  public radioButtonVertical: any;

  public sliderValue: number;

  // Wizard variables
  public showSecretStep: boolean;
  public showPreviousStep: boolean;
  public showNextStep: boolean;

  // All Icons Variables
  public gifIcons: string[];
  public svgIcons: string[];
  public fontIcons: string[];

  // Listing variables
  public listingSource: GadgetsListSource | null;
  // Search
  @ViewChild('listPanelSearch')
  public listPanelSearch: McsSearch;

  // Table variables
  public displayedColumns = ['userId', 'userName', 'progress', 'color'];
  public gadgetsDatabase = new GadgetsDatabase();
  public dataSource: GadgetsDataSource | null;

  // Paginator
  @ViewChild('paginator')
  public paginator: McsPaginator;

  @ViewChild('mcsModal1')
  public mcsModal1: McsModal;
  // Search
  @ViewChild('search')
  public search: McsSearch;

  // Select
  public selectedValue: any = 'steak-0';
  public foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' }
  ];

  public constructor(
    private _serversServices: ServersService,
    private _formBuilder: FormBuilder
  ) {
    this.title = 'Gadgets component';
    this.gadgets = new Array();
    this.dropdownValue = '';
    this.radioButtonHorizontal = 'dhcp';
    this.radioButtonVertical = 'next';
    this.showPreviousStep = true;
    this.showNextStep = true;
    this.showSecretStep = false;
    this.gifIcons = new Array();
    this.svgIcons = new Array();
    this.fontIcons = new Array();
    this.textboxModel = {
      email: '',
      ipAddress: null,
      alphanumeric: '',
      numeric: null,
      pattern: ''
    };
    this.wizardModel = {
      firstName: '',
      middleName: '',
      lastName: '',
      age: '',
      emailAddress: '',
      contact: ''
    };
    this.sliderValue = 300;
  }

  public ngOnInit() {
    this._serversServices.getServers()
      .subscribe((response) => {
        this.servers = response.content;
      });

    this.setGadgets();
    this.getAllIcons();
    this.textboxValue = 'Windows Server 2012';
    this.disabled = true;
    this.dropdownData = this.servers ? this.mapDropdownData(this.servers) : new McsList();
    this.reactiveForm = new FormGroup({
      textEmail: new FormControl(null, Validators.required),
      textIpAddress: new FormControl(null, Validators.required),
      textAlphanumeric: new FormControl(null, Validators.required),
      textNumeric: new FormControl(null, Validators.required),
      textPattern: new FormControl(null, Validators.required)
    });

    this.formName = this._formBuilder.group({
      textFirstName: ['', [Validators.required, Validators.minLength(2)]],
      textMiddleName: ['', [Validators.required, Validators.minLength(2)]],
      textLastName: ['', [Validators.required, Validators.minLength(2)]],
      textAge: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.formDetails = this._formBuilder.group({
      textEmailAddress: ['', [Validators.required, Validators.minLength(2)]],
      textContactNo: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  public ngAfterViewInit(): void {
    refreshView(() => {
      this.onInitTable();
      this.onInitListing();
    });
  }

  public onInitTable() {
    this.dataSource = new GadgetsDataSource(
      this.gadgetsDatabase,
      this.paginator,
      this.search
    );
  }

  public onInitListing() {
    this.listingSource = new GadgetsListSource(
      this.gadgetsDatabase,
      this.listPanelSearch
    );
  }

  public getAllIcons(): void {
    let config = require('../../config/assets.config.json');
    let gifIcons = config['gifIcons'];
    let svgIcons = config['svgIcons'];
    let fontIcons = config['fontIcons'];
    let gifKeys = Object.keys(gifIcons);
    let svgKeys = Object.keys(svgIcons);
    let fontKeys = Object.keys(fontIcons);

    // Add GIF Icons
    for (let key of Object.keys(gifKeys)) {
      this.gifIcons.push(gifKeys[key]);
    }

    // Add SVG Icons
    for (let key of Object.keys(svgKeys)) {
      this.svgIcons.push(svgKeys[key]);
    }

    // Add Font Icons
    for (let key of Object.keys(fontKeys)) {
      this.fontIcons.push(fontKeys[key]);
    }
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

  public onThrowError(): void {
    throw new Error('Sample error in gadgets triggered.');
  }

  public onButtonClicked(button: any) {
    button.showLoader();
    console.log('start process');
    refreshView(() => {
      console.log('done');
      button.hideLoader();
    }, 3000);
  }

  public onSearch(textbox: any) {
    textbox.showLoader();
    console.log('start search');
    refreshView(() => {
      console.log('done');
      textbox.hideLoader();
    }, 2000);
  }

  public mapDropdownData(servers: Server[]): McsList {
    if (!servers) { return; }

    let dropdownData = new McsList();

    for (let server of servers) {
      dropdownData.push(
        server.serviceType.toString(),
        new McsListItem(server.managementName, server.managementName)
      );
    }

    let groupName = dropdownData.getGroupNames()[0];
    this.dropdownValue = dropdownData.getGroup(groupName)[0].key;

    return dropdownData;
  }

  public closeModal1() {
    if (!this.mcsModal1) { return; }
    this.mcsModal1.close();
  }
}
