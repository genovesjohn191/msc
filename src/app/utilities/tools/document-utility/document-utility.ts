import { saveAs } from 'file-saver';
import { asBlob } from 'html-docx-js-typescript';

export class DocumentUtility {

  public static generateHtmlDocument(fileName: string, htmlString: string): void {
    if (!htmlString) { return; }

    let formattedHtml = `
      <!DOCTYPE html> <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>
      ${htmlString}
    `;

    asBlob(formattedHtml, { orientation: 'landscape' }).then(data => {
      saveAs(data, fileName); // save as docx file
    });
  }
}
