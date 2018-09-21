import {
  Component,
  ViewChild
} from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { TabGroupComponent } from './tab-group.component';
import { TabGroupModule } from './tab-group.module';
import { CoreTestingModule } from '@app/core/testing';

@Component({
  selector: 'mcs-test-tab-group',
  template: ``
})
export class TabGroupTestComponent {
  @ViewChild(TabGroupComponent)
  public tabGroupComponent: TabGroupComponent;
}

describe('TabGroupComponent', () => {

  /** Stub Services/Components */
  let component: TabGroupTestComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TabGroupTestComponent
      ],
      imports: [
        CoreTestingModule,
        TabGroupModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TabGroupTestComponent, {
      set: {
        template: `
        <mcs-tab-group selectedTabIndex="1">
          <mcs-tab label="Tab1">
            Content 1
          </mcs-tab>
          <mcs-tab label="Tab2">
            Content 2
          </mcs-tab>
          <mcs-tab label="Tab3">
            <ng-template mcsTabLabel>
              <span>Tab Template</span>
            </ng-template>
          </mcs-tab>
        </mcs-tab-group>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TabGroupTestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.tabGroupComponent.ngAfterContentInit();
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-tab-group element`, () => {
      let element = document.querySelector('mcs-tab-group');
      expect(element).not.toBe(null);
    });

    it(`should create 3 mcs-tab-header-item elements`, () => {
      let elements = document.querySelectorAll('mcs-tab-header-item');
      expect(elements.length).toBe(3);
    });

    it(`should create 3 mcs-tab-body elements`, () => {
      let elements = document.querySelectorAll('mcs-tab-body');
      expect(elements.length).toBe(3);
    });
  });

  describe('selectTab()', () => {
    beforeEach(async((() => {
      component.tabGroupComponent.onClickTab(
        component.tabGroupComponent.tabs.toArray()[1]
      );
    })));

    it(`should set the selected tab to active element variable`, () => {
      let selectedTab = component.tabGroupComponent.tabs.toArray()[1];
      expect(selectedTab.id).toBe(component.tabGroupComponent.activeTab.id);
    });
  });
});
