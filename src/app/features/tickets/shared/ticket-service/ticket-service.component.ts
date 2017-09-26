import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  isNullOrEmpty,
  refreshView
} from '../../../../utilities';
import {
  CoreDefinition,
  McsSearch
} from '../../../../core';
import {
  TicketService,
  TicketServiceData,
  TicketActivity
} from '../../models';

@Component({
  selector: 'mcs-ticket-service',
  templateUrl: './ticket-service.component.html',
  styles: [require('./ticket-service.component.scss')]
})

export class TicketServiceComponent implements AfterViewInit, OnDestroy {

  @ViewChild('search')
  public search: McsSearch;

  @Output()
  public selectionChanged: EventEmitter<any>;

  @Input()
  public get services(): TicketService[] {
    return this._services;
  }
  public set services(value: TicketService[]) {
    if (this._services !== value) {
      this._services = value;
      this.setSelectedService(this._services[0]);
    }
  }
  private _services: TicketService[];

  /**
   * Selected Service
   *
   * `@Note:` This will update overtime when the service is changed
   */
  private _selectedService: TicketService;
  public get selectedService(): TicketService {
    return this._selectedService;
  }
  public set selectedService(value: TicketService) {
    if (this._selectedService !== value) {
      this._selectedService = value;
    }
  }

  /**
   * Selected services items to be outputted on the caller component
   */
  private _selectedServiceItems: TicketServiceData[];
  public get selectedServiceItems(): TicketServiceData[] {
    return this._selectedServiceItems;
  }
  public set selectedServiceItems(value: TicketServiceData[]) {
    if (this._selectedServiceItems !== value) {
      this._selectedServiceItems = value;
    }
  }

  /**
   * Filtered displayed services items based on search key
   */
  private _displayedServices: TicketServiceData[];
  public get displayedServices(): TicketServiceData[] {
    return this._displayedServices;
  }
  public set displayedServices(value: TicketServiceData[]) {
    if (this._displayedServices !== value) {
      this._displayedServices = value;
    }
  }

  private _searchkeySubscription: any;

  public constructor() {
    this.services = new Array();
    this.selectionChanged = new EventEmitter<any>();
    this.selectedServiceItems = new Array();
    this.displayedServices = new Array();
  }

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._setServicesDisplayed();
    });
  }

  public ngOnDestroy() {
    if (!isNullOrEmpty(this._searchkeySubscription)) {
      this._searchkeySubscription.unsubscribe();
    }
  }

  /**
   * Return true when the service is currently active otherwise false
   * @param service Service to be check
   */
  public isActive(service: TicketService): boolean {
    if (isNullOrEmpty(this.selectedService)) { return false; }
    return this.selectedService.serviceName === service.serviceName;
  }

  /**
   * Emit the selection changed event when service item is tick
   * @param serviceItem Service items that ticked
   */
  public onCheckedService(serviceItem: TicketServiceData) {
    if (isNullOrEmpty(serviceItem)) { return; }

    // Remove from selection if item is unchecked and add
    // the item if is checked
    if (serviceItem.isChecked === false) {
      let index = this.selectedServiceItems.indexOf(serviceItem.serviceId);
      this.selectedServiceItems.splice(index, 1);
    } else {
      this.selectedServiceItems.push(serviceItem);
    }

    // Notify output subscriber for any data changed
    this.selectionChanged.emit(this.selectedServiceItems);
  }

  /**
   * Set the selected service and notify the search event
   * @param service Service to be selected
   */
  public setSelectedService(service: TicketService): void {
    if (isNullOrEmpty(service)) { return; }
    this.selectedService = service;
    this.search.searchChangedStream.next(true);
  }

  /**
   * Set the displayed services based on the search key
   */
  private _setServicesDisplayed(): void {
    const displayDataChanges = [
      Observable.of(undefined),
      this.search.searchChangedStream,
    ];

    this._searchkeySubscription = Observable.merge(...displayDataChanges)
      .subscribe(() => {
        this.displayedServices = this.selectedService.serviceItems.filter((service) => {
          return service.name.includes(this.search.keyword);
        });
      });
  }
}
