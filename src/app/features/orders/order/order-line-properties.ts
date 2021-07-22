import { TranslateService } from '@ngx-translate/core';
import {
 McsOrderItem,
 OrderIdType
} from '@app/models';
import {
  convertMbToGb,
  formatTime,
  isNullOrEmpty,
  parseCronStringToJson
} from '@app/utilities';

export class LineProperties {
  private translate: TranslateService;
  constructor(_translate: TranslateService) {
    this.translate = _translate;
  }

  public setLineProperties(order: McsOrderItem): string {
    if (isNullOrEmpty(order)) { return; }
    let property = order.properties;
    let lineProperty: string;

    switch(order.itemOrderType) {
      case OrderIdType.ServiceCustomChange:
        lineProperty = `${this._linkedService(order.serviceId)}
          ${this._phoneConfirmationRequired(property?.phoneConfirmationRequired)}
          ${this._customerRefNum(property.customerReferenceNumber)}
          ${this._changeRequired(property.change)}
          ${this._objective(property.changeObjective)}
          ${this._testCases(property.testCases)}
          ${this._notes(property.notes)}`;
        break;

      case OrderIdType.MsRequestChange:
        lineProperty = `${this._linkedService(order.serviceId)}
          ${this._type(property.type)}
          ${this._category(property.category)}
          ${this._phoneConfirmationRequired(property?.phoneConfirmationRequired)}
          ${this._customerRefNum(property.customerReferenceNumber)}
          ${this._requestDescription(property.requestDescription)}`;
        break;

      case OrderIdType.ColocationRemoteHands:
        lineProperty = `${this._linkedService(order.serviceId)}
          ${this._cabinetLocation(property?.locationWithinCabinet)}
          ${this._phoneConfirmationRequired(property?.phoneConfirmationRequired)}
          ${this._customerRefNum(property.customerReferenceNumber)}
          ${this._remoteInstructions(property.remoteHandsInstructions)}
          ${this._testCases(property.testCases)}
          ${this._notes(property.notes)}`;
        break;

      case OrderIdType.ColocationDeviceRestart:
        lineProperty = `${this._linkedService(order.serviceId)}
          ${this._cabinetLocation(property?.locationWithinCabinet)}
          ${this._deviceMakeModel(property.deviceMakeModel)}
          ${this._deviceNameLabel(property.label)}
          ${this._phoneConfirmationRequired(property?.phoneConfirmationRequired)}
          ${this._customerRefNum(property.customerReferenceNumber)}
          ${this._restartInstructions(property.restartInstructions)}
          ${this._testCases(property.testCases)}
          ${this._notes(property.notes)}`;
        break;

      case OrderIdType.RaiseInviewLevel:
        lineProperty = `${this._linkedService(order.serviceId)}`;
        break;

      case OrderIdType.AddBat:
        lineProperty = `${this._retentionPeriod(property.retentionPeriodDays)}
          ${this._inViewLevel(property.inviewLevel)}
          ${this._dailyQuota(property.dailyBackupQuotaGB)}`;
        break;

      case OrderIdType.AddServerBackup:
        lineProperty = `${this._linkedServer(order.serviceId)}
          ${this._aggregationTarget(property.backupAggregationTarget)}
          ${this._retentionPeriod(property.retentionPeriodDays)}
          ${this._inViewLevel(property.inviewLevel)}
          ${this._dailySchedule(property.dailySchedule)}
          ${this._dailyQuota(property.dailyBackupQuotaGB)}`;
        break;

      case OrderIdType.AddVmBackup:
        lineProperty = `${this._linkedServer(order.serviceId)}
          ${this._aggregationTarget(property.backupAggregationTarget)}
          ${this._retentionPeriod(property.retentionPeriodDays)}
          ${this._inViewLevel(property.inviewLevel)}
          ${this._dailySchedule(property.dailySchedule)}
          ${this._dailyQuota(property.dailyBackupQuotaGB)}`;
        break;

      case OrderIdType.AddAntiVirus:
        lineProperty = `${this._linkedServer(order.serviceId)}`;
        break;

      case OrderIdType.AddHids:
        lineProperty = `${this._linkedServer(order.serviceId)}
          ${this._protectionLevel(property.protectionLevel)}`;
        break;

      case OrderIdType.MsLicenseCountChange:
        lineProperty = `${this._linkedService(order.serviceId)}
          ${this._quantity(property.quantity)}`;
        break;

      case OrderIdType.VdcStorageExpand:
        lineProperty = `${this._linkedVdc(order.parentServiceId)}
          ${this._linkedStorageProfile(order.serviceId)}
          ${this._desiredStorage(property.sizeMB)}`;
        break;

      case OrderIdType.VdcScale:
        lineProperty = `${this._linkedVdc(order.serviceId)}
          ${this._desiredRam(property.memoryMB)}
          ${this._desiredVcpu(property.cpuCount)}`;
        break;

      case OrderIdType.ScaleManageServer:
        lineProperty = `${this._linkedVdc(order.serviceId)}
          ${this._desiredRam(property.memoryMB)}
          ${this._desiredVcpu(property.cpuCount)}`;
        break;

      case OrderIdType.CreateManagedServer:
        lineProperty = `${this._linkedVdc(order.parentServiceId)}
          ${this._serverName(property.name)}
          ${this._desiredRam(property.memoryMB)}
          ${this._desiredVcpu(property.cpuCount)}
          ${this._storageProfile(property.storage?.name)}
          ${this._diskSize(property.storage?.sizeMB)}
          ${this._network(property.network?.name)}
          ${this._ipAddress(property.network?.ipAddress)}`;
        break;

      default:
        lineProperty = this.translate.instant('lineProp.noDetails');
      break;
    }

    // replace multiple spaces with single space and replace br with new line space
    let orderLineProperties = lineProperty.replace(/\s+/g, ' ').replace(/<br>/g, '\n');
		return orderLineProperties;
  }

  private _linkedService(id: string): string {
    if (isNullOrEmpty(id)) { return ''; }
    return this.translate.instant('lineProp.linkedService', {serviceId: id});
  }

  private _phoneConfirmationRequired(phoneRequired: boolean): string {
    let shouldContact = phoneRequired ? 'Yes' : 'No';
    return this.translate.instant('lineProp.phoneConfirmation', {phone: shouldContact});
  }

  private _customerRefNum(refNum: string): string {
    if (isNullOrEmpty(refNum)) { return ''; }
    return this.translate.instant('lineProp.customRefNum', {ref_num: refNum});
  }

  private _changeRequired(change: string): string {
    if (isNullOrEmpty(change)) { return ''; }
    return this.translate.instant('lineProp.changeRequired', {change_req: change});
  }

  private _objective(objective: string): string {
    if (isNullOrEmpty(objective)) { return ''; }
    return this.translate.instant('lineProp.objective', {change_obj: objective});
  }

  private _notes(notes: string): string {
    if (isNullOrEmpty(notes)) { return ''; }
    return this.translate.instant('lineProp.notes', {note: notes});
  }

  private _testCases(testCasesArray: string[]): string {
    if (isNullOrEmpty(testCasesArray)) { return ''; }
    let testCases = testCasesArray.toString().replace(/,/g,', ');
    return this.translate.instant('lineProp.testCases', {test_cases: testCases.toString()});
  }

  private _cabinetLocation(cabinetLoc: string): string {
    if (isNullOrEmpty(cabinetLoc)) { return ''; }
    return this.translate.instant('lineProp.locationCabinet', {location: cabinetLoc});
  }

  private _remoteInstructions(remoteInstruction: string): string {
    if (isNullOrEmpty(remoteInstruction)) { return ''; }
    return this.translate.instant('lineProp.remoteHandsInstruction', {instruction: remoteInstruction});
  }

  private _type(requestType: string): string {
    if (isNullOrEmpty(requestType)) { return ''; }
    return this.translate.instant('lineProp.type', {type: requestType});
  }

  private _category(category: string): string {
    if (isNullOrEmpty(category)) { return ''; }
    return this.translate.instant('lineProp.category', {cat: category});
  }

  private _requestDescription(description: string): string {
    if (isNullOrEmpty(description)) { return ''; }
    return this.translate.instant('lineProp.requestDescription', {desc: description});
  }

  private _deviceMakeModel(makeModel: string): string {
    if (isNullOrEmpty(makeModel)) { return ''; }
    return this.translate.instant('lineProp.deviceMakeModel', {make_model: makeModel});
  }

  private _deviceNameLabel(nameLabel: string): string {
    if (isNullOrEmpty(nameLabel)) { return ''; }
    return this.translate.instant('lineProp.deviceNameLabel', {name_label: nameLabel});
  }

  private _restartInstructions(details: string): string {
    if (isNullOrEmpty(details)) { return ''; }
    return this.translate.instant('lineProp.restartInstruction', {instruction: details});
  }

  private _retentionPeriod(retentionPeriod: number): string {
    if (isNullOrEmpty(retentionPeriod)) { return ''; }
    return this.translate.instant('lineProp.retentionPeriod', {period: retentionPeriod});
  }

  private _inViewLevel(inViewLevel: string): string {
    if (isNullOrEmpty(inViewLevel)) { return ''; }
    return this.translate.instant('lineProp.inviewLevel', {level: inViewLevel});
  }

  private _dailyQuota(dailyQuota: number): string {
    if (isNullOrEmpty(dailyQuota)) { return ''; }
    return this.translate.instant('lineProp.dailyBackupQuota', {quota: dailyQuota});
  }

  private _linkedServer(linkedServer: string): string {
    if (isNullOrEmpty(linkedServer)) { return ''; }
    return this.translate.instant('lineProp.linkedServer', {server: linkedServer});
  }

  private _serverName(serverName: string): string {
    if (isNullOrEmpty(serverName)) { return ''; }
    return this.translate.instant('lineProp.serverName', {server_name: serverName});
  }

  private _aggregationTarget(bat: string): string {
    if (isNullOrEmpty(bat)) { return ''; }
    return this.translate.instant('lineProp.aggregationTarget', {target: bat});
  }

  private _dailySchedule(sched: string): string {
    if (isNullOrEmpty(sched)) { return ''; }
    let cronJson = parseCronStringToJson(sched);
    let timeSchedule = formatTime(`${cronJson.hour[0]} : ${cronJson.minute[0]}`, 'HH:mm', 'h:mm A');
    return this.translate.instant('lineProp.dailySchedule', {schedule: timeSchedule});
  }

  private _protectionLevel(protectionLevel: string): string {
    if (isNullOrEmpty(protectionLevel)) { return ''; }
    return this.translate.instant('lineProp.protectionLevel', {level: protectionLevel});
  }

  private _quantity(orderQuantity: number): string {
    if (isNullOrEmpty(orderQuantity)) { return ''; }
    return this.translate.instant('lineProp.quantity', {quantity: orderQuantity});
  }

  private _linkedVdc(linkedVdc: string): string {
    if (isNullOrEmpty(linkedVdc)) { return ''; }
    return this.translate.instant('lineProp.linkedVdc', {linked_vdc: linkedVdc});
  }

  private _linkedStorageProfile(storageProfile: string): string {
    if (isNullOrEmpty(storageProfile)) { return ''; }
    return this.translate.instant('lineProp.linkedStorageProfile', {storage_profile: storageProfile});
  }

  private _desiredStorage(storage: number): string {
    if (isNullOrEmpty(storage)) { return ''; }
    return this.translate.instant('lineProp.desiredStorage', {desired_storage: convertMbToGb(storage)});
  }

  private _desiredRam(desiredRam: number): string {
    if (isNullOrEmpty(desiredRam)) { return ''; }
    return this.translate.instant('lineProp.desiredRam', {ram: convertMbToGb(desiredRam)});
  }

  private _desiredVcpu(desiredVcpu: number): string {
    if (isNullOrEmpty(desiredVcpu)) { return ''; }
    return this.translate.instant('lineProp.desiredVcpu', {vCpu: desiredVcpu});
  }

  private _storageProfile(storageProfile: string): string {
    if (isNullOrEmpty(storageProfile)) { return ''; }
    return this.translate.instant('lineProp.storageProfile', {storage_profile: storageProfile});
  }

  private _diskSize(diskSize: number): string {
    if (isNullOrEmpty(diskSize)) { return ''; }
    return this.translate.instant('lineProp.diskSize', {disk_size: convertMbToGb(diskSize)});
  }

  private _network(networkName: string): string {
    if (isNullOrEmpty(networkName)) { return ''; }
    return this.translate.instant('lineProp.network', {network: networkName});
  }

  private _ipAddress(ipAddress: string): string {
    if (isNullOrEmpty(ipAddress)) { return ''; }
    return this.translate.instant('lineProp.ipAddress', {ip_address: ipAddress});
  }
}