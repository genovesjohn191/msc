
import { McsEntityBase } from '../common/mcs-entity.base';
import { JsonProperty } from '@app/utilities';

export class McsAzureResource extends McsEntityBase {

    @JsonProperty()
    public name: string = undefined;

    @JsonProperty()
    public type: string = undefined;

    @JsonProperty()
    public serviceId: string = undefined;

    @JsonProperty()
    public subscriptionName: string = undefined;

    @JsonProperty()
    public subscriptionId: string = undefined;

}

