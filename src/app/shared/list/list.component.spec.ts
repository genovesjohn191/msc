import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { ListComponent } from './list.component';
import { ListModule } from './list.module';

@Component({
  selector: 'mcs-test-list',
  template: ``
})
export class TestListComponent {
  @ViewChild(ListComponent)
  public listComponent: ListComponent;
}

describe('ListComponent', () => {

  /** Stub Services/Components */

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestListComponent
      ],
      imports: [
        ListModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestListComponent, {
      set: {
        template: `
        <mcs-list [header]="Account">
          <mcs-list-item>Settings</mcs-list-item>
          <mcs-list-item>Profile</mcs-list-item>
          <mcs-list-item>Logout</mcs-list-item>
        </mcs-list>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(TestListComponent);
      fixture.detectChanges();
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-list element`, () => {
      let element: any;
      element = document.querySelector('mcs-list');
      expect(element).not.toBe(null);
    });

    it(`should create 3 content mcs-list-item`, () => {
      let element = document.querySelectorAll('mcs-list-item');
      expect(element).not.toBe(null);
      expect(element.length).toBe(3);
    });
  });
});
