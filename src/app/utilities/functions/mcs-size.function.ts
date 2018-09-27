import { UnitType } from '@app/models';

let gbToMbMultiplier = 1024;
let kbToMbMultiplier = 1024;

/**
 * This will return the size value together with its unit as a string
 * @deprecated Use the pipe for dataSize instead
 * @param unit Unit type of the value
 * @param value Size value
 */
export function appendUnitSuffix(value: number, unit: UnitType): string {
  let unitValue: string;

  switch (unit) {
    case UnitType.Kilobyte:
      unitValue = 'KB';
      break;

    case UnitType.Megabyte:
      unitValue = 'MB';
      break;

    case UnitType.Gigabyte:
      unitValue = 'GB';
      break;

    case UnitType.CPU:
      unitValue = 'vCPU';
      break;

    default:
      unitValue = '';
      break;
  }

  // Return the value with unit
  return `${value} ${unitValue}`;
}

/**
 * This will return the value converted from MB to GB
 * @param value Value in MB
 */
export function convertMbToGb(value: number): number {
  if (!value) { return 0; }

  return (value / gbToMbMultiplier);
}

/**
 * This will return the value converted from GB to MB
 * @param value Value in GB
 */
export function convertGbToMb(value: number): number {
  if (!value) { return 0; }

  return (value * gbToMbMultiplier);
}

/**
 * This will return the value converted from KB to MB
 * @param value Value in KB
 */
export function convertKbToMb(value: number): number {
  if (!value) { return 0; }

  return (value / kbToMbMultiplier);
}
