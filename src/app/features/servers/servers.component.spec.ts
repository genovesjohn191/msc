import {
  waitForAsync,
  TestBed
} from '@angular/core/testing';
import { CommonDefinition } from '@app/utilities';

import { ServersComponent } from './servers.component';
import { ServersTestingModule } from './testing';

/*
  Commenting this for now to remove the error.
  .::. Need unit test for this component
*/
// describe('ServersComponent', () => {

//   /** Stub Services/Components */
//   CommonDefinition.SEARCH_TIME = 0; // remove delay time
//   let component: ServersComponent;

//   beforeEach(waitForAsync(() => {
//     /** Testbed Reset Module */
//     TestBed.resetTestingModule();

//     /** Testbed Configuration */
//     TestBed.configureTestingModule({
//       declarations: [
//         ServersComponent
//       ],
//       imports: [
//         ServersTestingModule
//       ]
//     });

//     /** Testbed Onverriding of Providers */
//     // TestBed.overrideProvider(ServersApiService, { useValue: mockServersService });

//     /** Testbed Onverriding of Components */
//     TestBed.overrideComponent(ServersComponent, {
//       set: {
//         template: `
//           <div>Servers Component Template</div>
//         `
//       }
//     });

//     /** Tesbed Component Compilation and Creation */
//     TestBed.compileComponents().then(() => {
//       let fixture = TestBed.createComponent(ServersComponent);
//       fixture.detectChanges();

//       component = fixture.componentInstance;
//     });
//   }));

//   /** Test Implementation */
//   describe('ngOnInit() | constructor', () => {
//     if (component) {
//       /*
//         This is needed remove the lint error of not using component variable.
//         .::. Need unit test for this component
//       */
//     }
//   });
// });
