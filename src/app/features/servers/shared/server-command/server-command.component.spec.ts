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
  let mockTextContent = {
    start: 'Start',
    stop: 'Stop',
    restart: 'Restart',
    scale: 'Scale',
    clone: 'Clone',
    vcloud: 'View in vCloud'
  };

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

  describe('getServerCommandLabel()', () => {
    it('should return the label for Start command', () => {
      expect(component.getServerCommandLabel(ServerCommand.Start))
        .toEqual(mockTextContent.start);
    });

    it('should return the label for Stop command', () => {
      expect(component.getServerCommandLabel(ServerCommand.Stop))
        .toEqual(mockTextContent.stop);
    });

    it('should return the label for Restart command', () => {
      expect(component.getServerCommandLabel(ServerCommand.Restart))
        .toEqual(mockTextContent.restart);
    });

    it('should return the label for Scale command', () => {
      expect(component.getServerCommandLabel(ServerCommand.Scale))
        .toEqual(mockTextContent.scale);
    });

    it('should return the label for Clone command', () => {
      expect(component.getServerCommandLabel(ServerCommand.Clone))
        .toEqual(mockTextContent.clone);
    });

    it('should return the label for ViewVCloud command', () => {
      expect(component.getServerCommandLabel(ServerCommand.ViewVCloud))
        .toEqual(mockTextContent.vcloud);
    });
  });

  describe('onExecuteCommand()', () => {
    it('should output the selected server command', () => {
      spyOn(component.onClick, 'emit');
      component.onExecuteCommand(ServerCommand.Start);
      expect(component.onClick.emit).toHaveBeenCalled();
    });
  });

  describe('disableAction()', () => {
    it('should disable start button when the current command is Start', () => {
      component.command = ServerCommand.Start;
      expect(component.disableAction(ServerCommand.Start)).toBeTruthy();
    });

    it('should disable stop and restart button when the current command is Stop', () => {
      component.command = ServerCommand.Stop;
      expect(component.disableAction(ServerCommand.Stop)).toBeTruthy();
      expect(component.disableAction(ServerCommand.Restart)).toBeTruthy();
    });
  });
});
