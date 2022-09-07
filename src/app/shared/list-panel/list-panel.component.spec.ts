import { of } from 'rxjs';

import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { CoreTestingModule } from '@app/core/testing';
import { DataStatus } from '@app/models';

import { ListPanelComponent } from './list-panel.component';
import { ListPanelModule } from './list-panel.module';
import { ListPanelDatasource } from './testing';
import { OptionGroupModule } from '../option-group/option-group.module';
import { ItemModule } from '../item/item.module';

@Component({
  selector: 'mcs-test-list-panel',
  template: ``
})
export class TestListPanelComponent {
  @ViewChild(ListPanelComponent)
  public listPanelComponent: ListPanelComponent<any>;

  public listviewDatasource: ListPanelDatasource;
  constructor() {
    this.listviewDatasource = new ListPanelDatasource();
  }
}

describe('ListPanelComponent', () => {
  let component: TestListPanelComponent;

  /** Stub Services/Components */

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestListPanelComponent
      ],
      imports: [
        ListPanelModule,
        CoreTestingModule,
        OptionGroupModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestListPanelComponent, {
      set: {
        template: `
        <mcs-list-panel [dataSource]="listviewDatasource" [config]="listviewDatasource?.config?.panelSettings">
          <ng-container *mcsListPanelContent="let entity">
            <a>
              <mcs-option>
                <mcs-item>
                  <span>entity.name</span>
                </mcs-item>
              </mcs-option>
            </a>
          </ng-container>
        </mcs-list-panel>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestListPanelComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-list-panel element`, () => {
      let listPanelElement: any;
      listPanelElement = document.querySelector('mcs-list-panel');
      expect(listPanelElement).not.toBe(null);
    });
  });

  describe('ngAfterContentInit() | ngAfterContentChecked()', () => {
    it(`should create 3 mcs-option element`, () => {
      let optionElement: NodeListOf<Element>;
      optionElement = document.querySelectorAll('mcs-option');

      expect(optionElement.length).toBe(3);
    });

    it(`should not create the mcs-data-status-in-progress element if data status is success`, () => {
      let dataStatusInProgressElement: any;
      dataStatusInProgressElement = document.querySelector('mcs-data-status-in-progress');
      expect(dataStatusInProgressElement).toBe(null);
    });

    it(`should not create the mcs-data-status-error element if data status is success`, () => {
      let dataStatusErrorElement: any;
      dataStatusErrorElement = document.querySelector('mcs-data-status-error');
      expect(dataStatusErrorElement).toBe(null);
    });

    it(`should not create the mcs-data-status-empty element if it has data`, () => {
      let dataStatusEmptyElement: any;
      dataStatusEmptyElement = document.querySelector('mcs-data-status-empty');
      expect(dataStatusEmptyElement).toBe(null);
    });
  });
});
