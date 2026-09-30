import { canvasManager } from './canvas.js';

class HistoryManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }

  createBlankSnapshot() {
    const blankCanvas = document.createElement('canvas');
    blankCanvas.width = canvasManager.annotationCanvas.width || 1;
    blankCanvas.height = canvasManager.annotationCanvas.height || 1;
    return blankCanvas.toDataURL('image/png');
  }

  reset() {
    this.undoStack = [this.createBlankSnapshot()];
    this.redoStack = [];
  }

  push() {
    const snapshot = canvasManager.annotationCanvas.toDataURL('image/png');

    if (this.undoStack[this.undoStack.length - 1] === snapshot) {
      return;
    }

    this.undoStack.push(snapshot);
    this.redoStack = [];
  }

  restore(snapshot) {
    const image = new Image();
    image.onload = () => {
      canvasManager.annotationCtx.clearRect(
        0,
        0,
        canvasManager.annotationCanvas.width,
        canvasManager.annotationCanvas.height,
      );
      canvasManager.annotationCtx.drawImage(
        image,
        0,
        0,
        canvasManager.annotationCanvas.width,
        canvasManager.annotationCanvas.height,
      );
    };
    image.src = snapshot;
  }

  undo() {
    if (this.undoStack.length <= 1) {
      return;
    }

    const current = this.undoStack.pop();
    this.redoStack.push(current);

    const previous = this.undoStack[this.undoStack.length - 1];
    this.restore(previous);
  }

  redo() {
    if (this.redoStack.length === 0) {
      return;
    }

    const next = this.redoStack.pop();
    this.undoStack.push(next);
    this.restore(next);
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }
}

export const historyManager = new HistoryManager();
