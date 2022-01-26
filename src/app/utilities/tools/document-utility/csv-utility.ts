import { saveAs } from 'file-saver';

export class CsvUtility {

  public static generateCsvDocument(fileName: string, csvData: Blob): void {
    if (!csvData) { return; }

    saveAs.saveAs(csvData, fileName); // save as csv file
  }
}

