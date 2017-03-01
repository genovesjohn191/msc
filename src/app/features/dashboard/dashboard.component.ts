import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
/** Models */
import { StatusBoxAttribute, StatusBoxType } from '../../shared';

@Component({
  selector: 'mfp-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [require('./dashboard.component.scss')]
})

export class DashboardComponent implements OnInit {
  public title: string;
  public statusBoxAttr: StatusBoxAttribute;
  public model: NgbDateStruct;
  public date: { year: number, month: number };
  public curDate: Date;

  public constructor() {
    this.title = 'Dashboard component';
    this.statusBoxAttr = new StatusBoxAttribute();
    this.curDate = new Date();
  }

  public ngOnInit() {
    this.OnDisplayStatusBox();
    this.statusBoxAttr.dialogState = 'hide';
  }

  public OnSelectToday() {
    this.model = {
      year: this.curDate.getFullYear(),
      month: this.curDate.getMonth() + 1,
      day: this.curDate.getDate()
    };
  }

  public OnDisplayStatusBox() {
    this.statusBoxAttr.type = StatusBoxType.Success;
    this.statusBoxAttr.dialogState = 'show';
    this.statusBoxAttr.title = 'mongo-db-1';
    this.statusBoxAttr.user = 'Arrian';
    this.statusBoxAttr.description = 'The virtual machine successfully started. Check the status';
  }
}
