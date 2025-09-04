# Inventory Manager

Lightweight browser app to add items with name, category, price, quantity, and image. Includes search, click-to-open details, reset, and PDF export (list or single item). Data is saved locally in your browser (LocalStorage).

## Run

Just open `index.html` in a modern browser.

If serving locally with a simple server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/
```

## Features

- Add items with name, category, price, quantity, optional image
- Search by name or category
- Click an item to open details dialog
- Delete item from details dialog
- Reset form button
- Export list to PDF and individual item to PDF
- Responsive design

## Notes

- Images are stored as data URLs in LocalStorage, which increases storage size; suitable for small inventories. For large images or many items, consider a backend.
- PDF export uses `html2pdf.js` (bundled `html2canvas` + `jsPDF`).

## License

MIT
