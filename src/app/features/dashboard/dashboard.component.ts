import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
/** Models */
import { StatusBoxAttribute, StatusBoxType } from '../../shared';

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

  public constructor() {
    this.title = 'Dashboard component';
    this.statusBoxAttribute = new StatusBoxAttribute();
    this.currentDate = new Date();
  }

  public ngOnInit() {
    this.onDisplayStatusBox();
    this.statusBoxAttribute.dialogState = 'hide';
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
}
