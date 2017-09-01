import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { ListPanelComponent } from './list-panel.component';
import { ListPanelModule } from './list-panel.module';
import { ListPanelDatasource } from './testing';
import { CoreTestingModule } from '../../core/testing';

@Component({
  selector: 'mcs-test-table',
  template: ``
})
export class TestListPanelComponent {
  @ViewChild(ListPanelComponent)
  public component: ListPanelComponent<any>;

  public dataSource: ListPanelDatasource;
  constructor() {
    this.dataSource = new ListPanelDatasource();
  }
}

describe('TableComponent', () => {

  /** Stub Services/Components */
  let component: TestListPanelComponent;
  let dataSource = new ListPanelDatasource();

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestListPanelComponent
      ],
      imports: [
        ListPanelModule,
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestListPanelComponent, {
      set: {
        template: `
        <mcs-list-panel [dataSource]="dataSource">
          <ng-container mcsListDef>
            <mcs-list-header *mcsListHeaderDef="let propValue; propertyName: 'color';"
              [groupName]="propValue">
              <a >{{ propValue }}</a>
            </mcs-list-header>

            <mcs-list-item *mcsListItemDef="let item"
              [itemId]="item.userId" [groupName]="item.color">
              {{ item.name }}
            </mcs-list-item>
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
    it(`should create 3 mcs-list-header element`, () => {
      let headerElement: NodeListOf<Element>;
      headerElement = document.querySelectorAll('mcs-list-header');
      expect(headerElement.length).toBe(3);
    });

    it(`should create <a> element tag based on the content of the mcs-list-header`, () => {
      let tagElement: NodeListOf<Element>;
      tagElement = document.querySelectorAll('a');
      expect(tagElement.length).toBe(3);
    });

    it(`should create mcs-list-item element based on the datasource record`, () => {
      let dataRowElement: NodeListOf<Element>;
      dataRowElement = document.querySelectorAll('mcs-list-item');
      expect(dataRowElement.length).toBe(4);
    });
  });

  describe('onClickItems()', () => {
    it(`should set the class to active when mcs-list-item element is clicked`, () => {
      let itemElements: NodeListOf<Element>;
      itemElements = document.querySelectorAll('mcs-list-item');
      let item = itemElements.item(0);

      item.dispatchEvent(new Event('click'));
      expect(item.classList.contains('active')).toBeTruthy();
    });

    it(`should remove the active class of the other item
    when mcs-list-item element is clicked`, () => {
      let itemElements: NodeListOf<Element>;
      itemElements = document.querySelectorAll('mcs-list-item');
      let item = itemElements.item(0);

      item.dispatchEvent(new Event('click'));
      expect(itemElements.item(1).classList.contains('active')).toBeFalsy();
    });

    it(`should set the class of mcs-list-header to active
    when mcs-list-item element is clicked`, () => {
      let itemElements: NodeListOf<Element>;
      let headerElements: NodeListOf<Element>;
      itemElements = document.querySelectorAll('mcs-list-item');
      headerElements = document.querySelectorAll('mcs-list-header');
      let item = itemElements.item(0);

      item.dispatchEvent(new Event('click'));
      expect(headerElements.item(0).classList.contains('active')).toBeTruthy();
    });
  });
});
