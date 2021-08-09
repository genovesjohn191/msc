import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
import { McsAuthenticationIdentity } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';

export class HtmlToPdfUtility {

  public static generateHtmlToPdf(
    fileName: string,
    htmlString: string,
    headerTitle: string,
    identity: McsAuthenticationIdentity,
    eventDispatcher: EventBusDispatcherService): void {
    if (!htmlString) { return; }

    let html = htmlToPdfmake(htmlString, {
      imagesByReference: true,
      defaultStyles:{ // override the default styles
        h1:{ fontSize: 18, marginBottom: 0 },
        h2:{ fontSize: 16, marginBottom: 0 },
        h3:{ fontSize: 14, marginBottom: 0 },
        h4:{ fontSize: 12, marginBottom: 0 },
        h5:{ fontSize: 10, marginBottom: 0 },
        th: { bold: true, fillColor:'black', color: 'white', alignment: 'left' },
      },
      tableAutoSize: true
    });

    let headerLogo = require('!raw-loader!../../../../assets/img/light-mcs-logo.svg');
    let currentDateTime = `${new Date().toLocaleDateString('en-AU', {hour: '2-digit', minute:'2-digit'})}`;
    let currentUserId = identity.user.userId;
    let currentCompany =  identity.activeAccount.name.replace(/_/g, ' ');
    let documentDefinition = {
      content: html.content,
      images: html.images,
      pageOrientation: 'landscape',
      pageMargins: [20, 60, 20, 60],  // margin: [left, top, right, bottom]
      footer: (currentPage) => {
        return [
          {
            text:  `Page ${currentPage.toString()}`,
            alignment: 'right',
            margin: [0, 20, 21, 0]
          },
          {
            text: `Exported by ${currentUserId} on ${currentDateTime}`,
            alignment: 'right',
            margin: [0, 0, 21, 0],
            fontSize: 8
          },
          {
            text: window.location.href.split('?')[0], // remove url query string,
            alignment: 'right',
            margin: [0, 0, 21, 0],
            fontSize: 8
          }
      ]},
      header: () => {
        return [{
          style: 'pdfHeader',
          table: {
            widths:['*', '*'],
            heights: 40,
            body: [[
              [{
                text: `${headerTitle}`,
                alignment: 'left',
                margin: [17, 6, 0, 0],
                fontSize: 14
              },
              {
                text: `${currentCompany}`,
                alignment: 'left',
                margin: [17, 0, 0, 0],
                fontSize: 9
              }],
              {
                svg: `${headerLogo}`,
                margin: [0, 6, 8, 5],
                fit: [115, 50],
                alignment: 'right'
              }
          ]]}
      }]},
      pageBreakBefore: (currentNode) => {
        return currentNode.style && currentNode.style.indexOf('pdf-pagebreak-before') > -1;
      },
      defaultStyle: {
        fontSize: 10,
        bold: false
      },
      styles: {
        pdfHeader: {
          color: 'white',
          fillColor: 'black'
        }
      }
    };
    pdfMake.createPdf(documentDefinition).download(`${fileName}`,
      () => { eventDispatcher.dispatch(McsEvent.pdfDownloadEvent); } // notify once pdf download is done
    );
  }
}