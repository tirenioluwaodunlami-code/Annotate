import { canvasManager } from './canvas.js';
import { historyManager } from './history.js';
import { exportAnnotatedImage } from './export.js';

const state = {
  tool: 'pen',
  color: '#1f2937',
  brushSize: 6,
  opacity: 1,
  hasImage: false,
  isDrawing: false,
  lastPoint: null,
  imageName: '',
};

const elements = {
  uploadDropzone: document.getElementById('uploadDropzone'),
  canvasStage: document.getElementById('canvasStage'),
  imageInput: document.getElementById('imageInput'),
  colorPicker: document.getElementById('colorPicker'),
  brushSize: document.getElementById('brushSize'),
  brushSizeValue: document.getElementById('brushSizeValue'),
  opacityRange: document.getElementById('opacityRange'),
  opacityValue: document.getElementById('opacityValue'),
  toolButtons: document.querySelectorAll('.tool-btn'),
  undoBtn: document.getElementById('undoBtn'),
  redoBtn: document.getElementById('redoBtn'),
  clearBtn: document.getElementById('clearBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  statusToast: document.getElementById('statusToast'),
  annotationCanvas: canvasManager.annotationCanvas,
};

function showStatus(message, type = 'success') {
  elements.statusToast.textContent = message;
  elements.statusToast.className = `toast show ${type}`;

  window.clearTimeout(showStatus.timeoutId);
  showStatus.timeoutId = window.setTimeout(() => {
    elements.statusToast.className = 'toast';
  }, 2200);
}

function updateBrushReadouts() {
  elements.brushSizeValue.textContent = `${state.brushSize} px`;
  elements.opacityValue.textContent = `${Math.round(state.opacity * 100)}%`;
}

function updateHistoryButtons() {
  elements.undoBtn.disabled = !historyManager.canUndo();
  elements.redoBtn.disabled = !historyManager.canRedo();
}

function setTool(toolName, silent = false) {
  if (!state.hasImage && !silent) {
    showStatus('Upload an image before drawing.', 'error');
    return;
  }

  state.tool = toolName;
  elements.toolButtons.forEach((button) => {
    const isActive = button.dataset.tool === toolName;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function updatePropertyState() {
  const brushDisabled = !state.hasImage;
  elements.colorPicker.disabled = brushDisabled;
  elements.brushSize.disabled = brushDisabled;
  elements.opacityRange.disabled = brushDisabled;
}

function hideUploadScreen() {
  elements.uploadDropzone.classList.add('hidden');
  elements.canvasStage.classList.remove('hidden');
}

function showUploadScreen() {
  elements.uploadDropzone.classList.remove('hidden');
  elements.canvasStage.classList.add('hidden');
}

function validateFile(file) {
  if (!file) {
    return false;
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  const fileName = file.name.toLowerCase();
  const isImageExtension = /\.(png|jpg|jpeg|webp)$/i.test(fileName);

  if (allowedTypes.includes(file.type) || isImageExtension) {
    return true;
  }

  showStatus('Unsupported file type. Please choose a PNG, JPG, JPEG, or WebP image.', 'error');
  return false;
}

function processImageFile(file) {
  if (!validateFile(file)) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = () => {
      if (!image.width || !image.height) {
        showStatus('This image could not be processed. Please try another file.', 'error');
        return;
      }

      canvasManager.setImage(image);
      state.hasImage = true;
      state.imageName = file.name || 'annotated-image.png';
      historyManager.reset();
      canvasManager.resetContext();
      updatePropertyState();
      updateHistoryButtons();
      hideUploadScreen();
      showStatus('Image loaded successfully.', 'success');
    };

    image.onerror = () => {
      showStatus('The image could not be loaded. Please try another file.', 'error');
    };

    image.src = reader.result;
  };

  reader.onerror = () => {
    showStatus('The image file could not be read. Please try again.', 'error');
  };

  reader.readAsDataURL(file);
}

function handlePointerDown(event) {
  if (!state.hasImage) {
    showStatus('Upload an image before drawing.', 'error');
    return;
  }

  if (event.pointerType !== 'touch' && event.button !== 0) {
    return;
  }

  event.preventDefault();
  const point = canvasManager.getCoordinates(event);
  state.isDrawing = true;
  state.lastPoint = point;

  canvasManager.prepareContext(state.tool, state.color, state.brushSize, state.opacity);

  const ctx = canvasManager.annotationCtx;
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();

  elements.annotationCanvas.setPointerCapture?.(event.pointerId);
}

function handlePointerMove(event) {
  if (!state.isDrawing || !state.hasImage) {
    return;
  }

  const point = canvasManager.getCoordinates(event);
  const { lastPoint } = state;

  const ctx = canvasManager.annotationCtx;
  ctx.beginPath();
  ctx.moveTo(lastPoint.x, lastPoint.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();

  state.lastPoint = point;
}

function handlePointerUp() {
  if (!state.isDrawing) {
    return;
  }

  state.isDrawing = false;
  state.lastPoint = null;
  canvasManager.resetContext();
  historyManager.push();
  updateHistoryButtons();
}

function clearAnnotations() {
  if (!state.hasImage) {
    showStatus('Upload an image before clearing annotations.', 'error');
    return;
  }

  const confirmed = window.confirm('Clear all annotations? This will not remove the uploaded image.');
  if (!confirmed) {
    return;
  }

  canvasManager.clearAnnotations();
  historyManager.push();
  updateHistoryButtons();
  showStatus('Annotations cleared.', 'success');
}

function bindEvents() {
  elements.colorPicker.addEventListener('input', (event) => {
    state.color = event.target.value;
  });

  elements.brushSize.addEventListener('input', (event) => {
    state.brushSize = Number(event.target.value);
    updateBrushReadouts();
  });

  elements.opacityRange.addEventListener('input', (event) => {
    state.opacity = Number(event.target.value);
    updateBrushReadouts();
  });

  elements.toolButtons.forEach((button) => {
    button.addEventListener('click', () => setTool(button.dataset.tool));
  });

  elements.imageInput.addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    processImageFile(file);
    event.target.value = '';
  });

  elements.annotationCanvas.addEventListener('pointerdown', handlePointerDown);
  elements.annotationCanvas.addEventListener('pointermove', handlePointerMove);
  elements.annotationCanvas.addEventListener('pointerup', handlePointerUp);
  elements.annotationCanvas.addEventListener('pointerleave', handlePointerUp);
  elements.annotationCanvas.addEventListener('pointercancel', handlePointerUp);

  ['dragenter', 'dragover'].forEach((eventName) => {
    elements.uploadDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.uploadDropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    elements.uploadDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.uploadDropzone.classList.remove('dragover');
    });
  });

  elements.uploadDropzone.addEventListener('drop', (event) => {
    const [file] = event.dataTransfer?.files || [];
    processImageFile(file);
  });

  elements.undoBtn.addEventListener('click', () => {
    if (!state.hasImage) {
      showStatus('Upload an image before undoing changes.', 'error');
      return;
    }

    historyManager.undo();
    updateHistoryButtons();
    showStatus('Last annotation undone.', 'success');
  });

  elements.redoBtn.addEventListener('click', () => {
    if (!state.hasImage) {
      showStatus('Upload an image before redoing changes.', 'error');
      return;
    }

    historyManager.redo();
    updateHistoryButtons();
    showStatus('Redo applied.', 'success');
  });

  elements.clearBtn.addEventListener('click', clearAnnotations);

  elements.downloadBtn.addEventListener('click', () => {
    if (!state.hasImage) {
      showStatus('Upload an image before downloading.', 'error');
      return;
    }

    try {
      exportAnnotatedImage('annotated-image.png');
      showStatus('Image downloaded.', 'success');
    } catch (error) {
      console.error(error);
      showStatus('Download failed. Please try again.', 'error');
    }
  });
}

function init() {
  updateBrushReadouts();
  updateHistoryButtons();
  updatePropertyState();
  setTool('pen', true);
  bindEvents();
}

init();
