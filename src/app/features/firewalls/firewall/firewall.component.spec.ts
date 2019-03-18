import { EventEmitter } from '@angular/core';
import {
  async,
  TestBed
} from '@angular/core/testing';
import { FirewallComponent } from './firewall.component';
import { FirewallsTestingModule } from '../testing';

describe('FirewallComponent', () => {
  /** Stub Services/Components */
  let component: FirewallComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FirewallComponent
      ],
      imports: [
        FirewallsTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(FirewallComponent, {
      set: {
        template: `
          <div>Firewall Component Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(FirewallComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
      component.search = {
        keyword: '',
        searchChangedStream: new EventEmitter(),
        searching: false,
        showLoading() { return true; }
      };
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should set the firewall listsource', () => {
      expect(component.firewallsListSource).toBeDefined();
    });
  });
});
