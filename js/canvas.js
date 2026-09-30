const imageCanvas = document.getElementById('imageCanvas');
const annotationCanvas = document.getElementById('annotationCanvas');
const imageCtx = imageCanvas.getContext('2d');
const annotationCtx = annotationCanvas.getContext('2d');

export const canvasManager = {
  imageCanvas,
  annotationCanvas,
  imageCtx,
  annotationCtx,
  currentImage: null,

  setImage(image) {
    this.currentImage = image;
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    imageCanvas.width = width;
    imageCanvas.height = height;
    annotationCanvas.width = width;
    annotationCanvas.height = height;

    imageCtx.clearRect(0, 0, width, height);
    annotationCtx.clearRect(0, 0, width, height);
    imageCtx.drawImage(image, 0, 0, width, height);
    annotationCtx.lineCap = 'round';
    annotationCtx.lineJoin = 'round';
  },

  clearAnnotations() {
    annotationCtx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
  },

  getCoordinates(event) {
    const rect = annotationCanvas.getBoundingClientRect();
    const scaleX = annotationCanvas.width / rect.width;
    const scaleY = annotationCanvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  },

  prepareContext(tool, color, lineWidth, opacity) {
    annotationCtx.lineCap = 'round';
    annotationCtx.lineJoin = 'round';
    annotationCtx.lineWidth = lineWidth;
    annotationCtx.strokeStyle = color;
    annotationCtx.fillStyle = color;
    annotationCtx.globalAlpha = opacity;

    if (tool === 'eraser') {
      annotationCtx.globalCompositeOperation = 'destination-out';
    } else {
      annotationCtx.globalCompositeOperation = 'source-over';
    }
  },

  resetContext() {
    annotationCtx.globalCompositeOperation = 'source-over';
    annotationCtx.globalAlpha = 1;
  },
};
