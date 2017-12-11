import {
  async,
  TestBed
} from '@angular/core/testing';
import { ServerCommandComponent } from './server-command.component';
import { CoreDefinition } from '../../../../core';
import { ServerCommand } from '../../models';
import { ServersTestingModule } from '../../testing';

describe('ServerCommandComponent', () => {
  /** Stub Services/Components */
  let component: ServerCommandComponent;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ServerCommandComponent
      ],
      imports: [
        ServersTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ServerCommandComponent, {
      set: {
        template: `
          <div>ServerCommandComponent Template</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(ServerCommandComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('IconKey() | Property', () => {
    it('should get the gear icon key definition', () => {
      expect(component.gearIconKey).toBe(CoreDefinition.ASSETS_SVG_COG);
    });
  });

  describe('onExecuteCommand()', () => {
    it('should output the selected server command', () => {
      spyOn(component.onClick, 'emit');
      component.onExecuteCommand(ServerCommand.Start);
      expect(component.onClick.emit).toHaveBeenCalled();
    });
  });
});
