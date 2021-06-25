import html2pdf from 'html2pdf.js';

export class HtmlToPdfUtility {

  public static generateHtmlToPdf(fileName: string, htmlString: string, pageId: string): void {
    if (!htmlString) { return; }

    let container = document.createElement('div');
    container.innerHTML = htmlString;
    document.body.appendChild(container);

    let element = document.getElementById(`${pageId}`);
    let properties = {
      margin: [10, 5, 10, 5],
      filename: fileName,
      image:  { type: 'png' },
      jsPDF: { orientation: 'landscape' }
    };

    html2pdf().set(properties).from(element).save();
    document.body.removeChild(container);
  }
}
