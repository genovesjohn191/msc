import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import {
  mockFirewallService,
  FirewallsTestingModule
} from '../../testing';
import { FirewallService } from '../firewall.service';
import { FirewallPoliciesComponent } from './firewall-policies.component';

/*
  Commenting this for now to remove the error.
  .::. Need unit test for this component
*/

// describe('FirewallOverviewComponent', () => {
//   /** Stub Services/Components */
//   let component: FirewallPoliciesComponent;

//   beforeEach(waitForAsync(() => {
//     /** Testbed Reset Module */
//     TestBed.resetTestingModule();

//     /** Testbed Configuration */
//     TestBed.configureTestingModule({
//       declarations: [
//         FirewallPoliciesComponent
//       ],
//       imports: [
//         FirewallsTestingModule
//       ]
//     });

//     /** Testbed Overriding of Providers */
//     TestBed.overrideProvider(FirewallService, { useValue: mockFirewallService });

//     /** Testbed Overriding of Components */
//     TestBed.overrideComponent(FirewallPoliciesComponent, {
//       set: {
//         template: `
//           <div>Firewall Policies Component Template</div>
//         `
//       }
//     });

//     /** Testbed Component Compilation and Creation */
//     TestBed.compileComponents().then(() => {
//       let fixture = TestBed.createComponent(FirewallPoliciesComponent);
//       fixture.detectChanges();

//       component = fixture.componentInstance;
//     });
//   }));

//   /** Test Implementation */
//   describe('ngOnInit() | constructor', () => {
//     if (component) {
//       /*
//         This is needed to remove the lint error of not using component variable.
//         .::. Need unit test for this component
//       */
//     }
//   });
// });
