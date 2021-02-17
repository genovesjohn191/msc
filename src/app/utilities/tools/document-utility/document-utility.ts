import { saveAs } from 'file-saver';
import { asBlob } from 'html-docx-js-typescript';

export class DocumentUtility {

  public static generateHtmlDocument(fileName: string, htmlString: string): void {
    if (!htmlString) { return; }

    asBlob(htmlString, { orientation: 'landscape' }).then(data => {
      saveAs(data, fileName); // save as docx file
    });
  }
}
