import {
  Pipe,
  PipeTransform
} from '@angular/core';
import { isNullOrEmpty } from '../../../../utilities';
import { TicketServiceData } from '../../models';

@Pipe({
  name: 'mcsTicketServicePipe'
})

export class TicketServicePipe implements PipeTransform {
  public transform(services: TicketServiceData[], ...args: any[]): any {
    return services.filter((service) => !isNullOrEmpty(service.serviceId));
  }
}
