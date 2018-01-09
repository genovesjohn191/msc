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
  McsListItem,
  McsPaginator,
  McsSearch,
  CoreValidators,
  CoreDefinition
} from '../../core';
import { refreshView } from '../../utilities';
import {
  FormControl,
  FormGroup
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
  public numberModel: number;
  public wizardModel: any;
  public progressValue: number = 10;

  public radioButtonHorizontal: any;
  public radioButtonVertical: any;

  public sliderValue: number = 0;

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

  public fgTestWizard: FormGroup;
  public fcFirstName: FormControl;
  public fcMiddleName: FormControl;
  public fcLastName: FormControl;

  public fgWizardSecondForm: FormGroup;
  public fcEmailAddress: FormControl;
  public fcContactNo: FormControl;

  public fcInputBinding: FormControl;

  public constructor(
    private _serversServices: ServersService
  ) {
    this.title = 'Gadgets component';
    this.gadgets = new Array();
    this.radioButtonHorizontal = 'dhcp';
    this.radioButtonVertical = 'next';
    this.showPreviousStep = true;
    this.showNextStep = true;
    this.showSecretStep = false;
    this.gifIcons = new Array();
    this.svgIcons = new Array();
    this.fontIcons = new Array();
  }

  public ngOnInit() {
    this._serversServices.getServers()
      .subscribe((response) => {
        this.servers = response.content;
      });

    this.setGadgets();
    this.getAllIcons();
    this.disabled = true;

    this.fcFirstName = new FormControl('', [
      CoreValidators.required
    ]);
    this.fcMiddleName = new FormControl('', [
      CoreValidators.required
    ]);
    this.fcLastName = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcEmailAddress = new FormControl('', [
      CoreValidators.email
    ]);
    this.fcContactNo = new FormControl('');

    this.fgTestWizard = new FormGroup({
      formControlFirstName: this.fcFirstName,
      formControlMiddleName: this.fcMiddleName,
      formControlLastName: this.fcLastName
    });

    this.fgWizardSecondForm = new FormGroup({
      formControlEmailAddress: this.fcEmailAddress,
      formControlContactNo: this.fcContactNo,
    });
    this.fcInputBinding = new FormControl('Windows Server 2012');
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

  public get searchIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SEARCH;
  }

  public get calendarIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CALENDAR;
  }

  public get notificationBellSvgKey(): string {
    return CoreDefinition.ASSETS_SVG_NOTIFICATION_BELL;
  }
}
