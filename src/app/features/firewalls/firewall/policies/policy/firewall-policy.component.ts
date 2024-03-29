import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonDefinition } from '@app/utilities';
import { McsFirewallPolicy } from '@app/models';

@Component({
  selector: 'mcs-firewall-policy',
  templateUrl: './firewall-policy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallPolicyComponent {

  @Output()
  public panelClose = new EventEmitter<void>();

  @Input()
  public get firewallPolicy(): McsFirewallPolicy { return this._firewallPolicy; }
  public set firewallPolicy(value: McsFirewallPolicy) {
    if (value !== this.firewallPolicy) {
      this._firewallPolicy = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _firewallPolicy: McsFirewallPolicy;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Returns the close icon key
   */
  public get closeIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  /**
   * Closes the policy window
   */
  public closePolicy(): void {
    this.panelClose.emit();
  }
}
