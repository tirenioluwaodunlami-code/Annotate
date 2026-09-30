export function exportAnnotatedImage(filename = 'annotated-image.png') {
  const imageCanvas = document.getElementById('imageCanvas');
  const annotationCanvas = document.getElementById('annotationCanvas');

  if (!imageCanvas || !annotationCanvas) {
    throw new Error('Canvas elements were not found.');
  }

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = imageCanvas.width;
  exportCanvas.height = imageCanvas.height;

  const exportCtx = exportCanvas.getContext('2d');
  if (!exportCtx) {
    throw new Error('The browser cannot create an export canvas context.');
  }

  exportCtx.drawImage(imageCanvas, 0, 0);
  exportCtx.drawImage(annotationCanvas, 0, 0);

  const link = document.createElement('a');
  link.href = exportCanvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}
