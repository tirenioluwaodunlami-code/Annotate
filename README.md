# Annotate

Live Demo: https://annotate.freehosting.dev/

A lightweight, browser-based image annotation tool built from scratch using vanilla JavaScript, HTML5, and the HTML Canvas API.

Whether you need to quickly markup a screenshot, point out a detail in a diagram, or scribble notes on an image, **Annotate** lets you do it right in your browser with zero bloat, no server uploads, and no account required.

---

## Features

* **Flexible Uploads:** Upload images via standard file picker or drag-and-drop.
* **Smooth Drawing:** Freehand pen tool with customisable colour, brush size, and opacity.
* **Smart Eraser:** Safely remove annotations without accidentally erasing the underlying image.
* **Undo / Redo:** Full history state stack so you can easily step back and forth through your edits.
* **Clean Up:** Clear all annotations in one click while keeping your base image intact.
* **Instant Export:** Download your final marked-up creation straight to your device as a PNG.
* **Responsive Design:** Works smoothly across different screen sizes.

---

## How It Works Under the Hood

The core challenge of this project was keeping the drawings separate from the image itself so users can erase mistakes or clear annotations without ruining the base photo.

To solve this, Annotate uses a **two-layer canvas architecture**:

1. **Layer 1 (Base Image):** Holds the uploaded image, keeping it safely locked in place.
2. **Layer 2 (Annotation Layer):** Sits directly on top and captures all user freehand strokes and edits.

When you hit download, the app merges both layers dynamically behind the scenes into a single canvas context before exporting it as a crisp PNG.

---

## Project Structure

```text
annotate/
│
├── index.html          # Main application markup
├── css/
│   └── style.css       # Styling and responsive layout
├── js/
│   ├── app.js          # Core app logic and event listeners
│   ├── canvas.js       # Canvas setup, mouse/touch drawing behaviour
│   ├── history.js      # Undo/redo stack management
│   └── export.js       # Canvas merging and PNG download handler
│
└── README.md

```

---

## Running It Locally

Since this is a purely client-side application, you don't need a complex backend or database setup.

You can run it locally using Python's built-in server:

```bash
py -m http.server 8000

```

Then, open your browser and navigate to:
`http://localhost:8000`

*(Alternatively, you can just open the project folder in VS Code and launch it using the Live Server extension!)*

---

## Tech Stack

* **HTML5 & CSS3** (Custom layout, flexbox, and styling)
* **Vanilla JavaScript (ES6+)** (No frameworks or external UI libraries)
* **HTML Canvas API** (For pixel manipulation and rendering)
* **Browser File APIs** (For handling local image uploads and downloads)

---

## What I Learned

Building Annotate was a fantastic deep-dive into working closely with browser APIs without relying on heavy libraries. Some of the key takeaways for me include:

* **Canvas Coordinates & Scaling:** Handling mouse and touch events accurately relative to canvas scaling and device pixel ratios.
* **State Management:** Building a reliable undo/redo history stack from scratch using image data snapshots.
* **Modular JavaScript:** Structuring a vanilla JS project cleanly across multiple files so responsibilities (drawing, history, exporting) stay separated.
* **Client-Side File Processing:** Reading files natively in the browser and triggering client-side downloads programmatically.

---

## Future Plans

While the current version focuses purely on nailing the core annotation workflow, I'd love to expand it over time. Potential future additions include:

* Shape tools (rectangles, circles, straight lines, and arrows)
* A text annotation tool for adding typed notes
* Zoom and pan controls for detailed work
* Image cropping, resizing, and basic filters
* Mobile-friendly touch improvements

---

## Privacy

Your data stays yours. Because Annotate runs entirely client-side in your browser, your uploaded images are never sent to a remote server or stored in a database.
