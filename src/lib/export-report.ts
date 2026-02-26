import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportAsImage(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png")
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  const contentWidth = pdfWidth - 20; // 10mm margins
  const scaleFactor = contentWidth / imgWidth;
  const scaledHeight = imgHeight * scaleFactor;

  const pdf = new jsPDF({
    orientation: scaledHeight > pdfHeight ? "portrait" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // If content fits on one page
  if (scaledHeight <= pdfHeight - 20) {
    pdf.addImage(imgData, "PNG", 10, 10, contentWidth, scaledHeight);
  } else {
    // Multi-page: slice the canvas into pages
    const pageContentHeight = (pdfHeight - 20) / scaleFactor;
    let yOffset = 0;
    let pageNum = 0;

    while (yOffset < imgHeight) {
      if (pageNum > 0) pdf.addPage();

      const sliceHeight = Math.min(pageContentHeight, imgHeight - yOffset);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = imgWidth;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext("2d")!;
      ctx.drawImage(
        canvas,
        0,
        yOffset,
        imgWidth,
        sliceHeight,
        0,
        0,
        imgWidth,
        sliceHeight
      );

      const pageImg = pageCanvas.toDataURL("image/png");
      const pageImgHeight = sliceHeight * scaleFactor;
      pdf.addImage(pageImg, "PNG", 10, 10, contentWidth, pageImgHeight);

      yOffset += sliceHeight;
      pageNum++;
    }
  }

  pdf.save(`${filename}.pdf`);
}
