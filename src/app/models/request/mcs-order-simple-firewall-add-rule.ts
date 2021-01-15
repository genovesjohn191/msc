import { JsonProperty } from '@app/utilities';

export class McsOrderSimpleFirewallAddRule {
    @JsonProperty()
    public action: string = undefined;

    @JsonProperty()
    public sourceZone: string = undefined;

    @JsonProperty()
    public sourceIpAddress: string = undefined;

    @JsonProperty()
    public destinationZone: string = undefined;

    @JsonProperty()
    public destinationIpAddress: string = undefined;

    @JsonProperty()
    public destinationPort: string = undefined;

    @JsonProperty()
    public protocol: string = undefined;
}
