// Simple local storage wrapper
const STORAGE_KEY = 'inventory_items_v1';
function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** @type {Array<{id:string,name:string,category:string,price:number,quantity:number,imageDataUrl?:string}>} */
let items = loadItems();
let currentDetailId = null;

// DOM elements
const form = document.getElementById('item-form');
const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
const priceInput = document.getElementById('price');
const quantityInput = document.getElementById('quantity');
const imageInput = document.getElementById('image');
const resetBtn = document.getElementById('reset-form');

const listEl = document.getElementById('item-list');
const emptyStateEl = document.getElementById('empty-state');
const searchInput = document.getElementById('search');

const dialog = document.getElementById('detail-dialog');
const detailName = document.getElementById('detail-name');
const detailCategory = document.getElementById('detail-category');
const detailPrice = document.getElementById('detail-price');
const detailQuantity = document.getElementById('detail-quantity');
const detailTotal = document.getElementById('detail-total');
const detailImage = document.getElementById('detail-image');
const deleteBtn = document.getElementById('delete-item');
const exportItemBtn = document.getElementById('export-item');
const exportListBtn = document.getElementById('export-list');

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatCurrency(value) {
  return Number(value).toFixed(2);
}

function clearForm() {
  form.reset();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(undefined);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const category = categoryInput.value.trim();
  const price = parseFloat(priceInput.value);
  const quantity = parseInt(quantityInput.value, 10);
  const imageFile = imageInput.files && imageInput.files[0];

  if (!name || !category || isNaN(price) || isNaN(quantity)) {
    alert('Please fill all fields correctly.');
    return;
  }

  const imageDataUrl = await fileToDataUrl(imageFile);
  const newItem = {
    id: generateId(),
    name,
    category,
    price,
    quantity,
    imageDataUrl,
  };

  items.unshift(newItem);
  saveItems(items);
  renderList();
  clearForm();
}

function renderList() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = term
    ? items.filter(i => i.name.toLowerCase().includes(term) || i.category.toLowerCase().includes(term))
    : items;

  listEl.innerHTML = '';
  if (filtered.length === 0) {
    emptyStateEl.style.display = 'block';
    return;
  }
  emptyStateEl.style.display = 'none';

  for (const item of filtered) {
    const li = document.createElement('li');
    li.setAttribute('data-id', item.id);
    li.tabIndex = 0;

    const img = document.createElement('img');
    img.className = 'thumb';
    img.alt = 'thumbnail';
    img.src = item.imageDataUrl || 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="%230f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="10">No Img</text></svg>`);

    const textWrap = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = item.name;
    const sub = document.createElement('div');
    sub.className = 'item-sub';
    sub.textContent = `${item.category} • $${formatCurrency(item.price)} • Qty ${item.quantity}`;
    textWrap.appendChild(title);
    textWrap.appendChild(sub);

    const chevron = document.createElement('div');
    chevron.textContent = '›';
    chevron.style.opacity = '0.6';

    li.appendChild(img);
    li.appendChild(textWrap);
    li.appendChild(chevron);

    li.addEventListener('click', () => openDetail(item.id));
    li.addEventListener('keypress', (e) => { if (e.key === 'Enter') openDetail(item.id); });

    listEl.appendChild(li);
  }
}

function openDetail(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  currentDetailId = id;

  detailName.textContent = item.name;
  detailCategory.textContent = item.category;
  detailPrice.textContent = formatCurrency(item.price);
  detailQuantity.textContent = String(item.quantity);
  detailTotal.textContent = formatCurrency(item.price * item.quantity);
  if (item.imageDataUrl) {
    detailImage.src = item.imageDataUrl;
    detailImage.style.display = 'block';
  } else {
    detailImage.src = '';
    detailImage.style.display = 'none';
  }

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

function deleteCurrentItem() {
  if (!currentDetailId) return;
  const idx = items.findIndex(i => i.id === currentDetailId);
  if (idx !== -1) {
    items.splice(idx, 1);
    saveItems(items);
    renderList();
  }
  currentDetailId = null;
}

function exportElementToPdf(element, filename) {
  const opt = {
    margin:       10,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  return html2pdf().set(opt).from(element).save();
}

function exportListPdf() {
  // Create a printable container
  const container = document.createElement('div');
  container.style.padding = '16px';
  container.style.maxWidth = '800px';
  const title = document.createElement('h2');
  title.textContent = 'Inventory List';
  container.appendChild(title);
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  const header = document.createElement('tr');
  const headers = ['Name', 'Category', 'Price', 'Quantity', 'Total'];
  for (const h of headers) {
    const th = document.createElement('th');
    th.textContent = h;
    th.style.textAlign = 'left';
    th.style.borderBottom = '1px solid #ddd';
    th.style.padding = '8px';
    table.appendChild(header);
    header.appendChild(th);
  }
  for (const item of items) {
    const tr = document.createElement('tr');
    const cells = [item.name, item.category, `$${formatCurrency(item.price)}`, String(item.quantity), `$${formatCurrency(item.price * item.quantity)}`];
    for (const c of cells) {
      const td = document.createElement('td');
      td.textContent = c;
      td.style.padding = '8px';
      td.style.borderBottom = '1px solid #eee';
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  container.appendChild(table);
  exportElementToPdf(container, 'inventory-list.pdf');
}

function exportCurrentItemPdf() {
  if (!currentDetailId) return;
  const item = items.find(i => i.id === currentDetailId);
  if (!item) return;
  const container = document.createElement('div');
  container.style.padding = '16px';
  container.style.maxWidth = '600px';
  const title = document.createElement('h2');
  title.textContent = item.name;
  container.appendChild(title);
  if (item.imageDataUrl) {
    const img = document.createElement('img');
    img.src = item.imageDataUrl;
    img.style.width = '100%';
    img.style.height = '300px';
    img.style.objectFit = 'cover';
    img.style.border = '1px solid #ddd';
    img.style.borderRadius = '8px';
    container.appendChild(img);
  }
  const p1 = document.createElement('p');
  p1.textContent = `Category: ${item.category}`;
  const p2 = document.createElement('p');
  p2.textContent = `Price: $${formatCurrency(item.price)}`;
  const p3 = document.createElement('p');
  p3.textContent = `Quantity: ${item.quantity}`;
  const p4 = document.createElement('p');
  p4.textContent = `Total: $${formatCurrency(item.price * item.quantity)}`;
  container.appendChild(p1);
  container.appendChild(p2);
  container.appendChild(p3);
  container.appendChild(p4);
  exportElementToPdf(container, `${item.name.replace(/\s+/g,'-').toLowerCase()}.pdf`);
}

// Event wiring
form.addEventListener('submit', handleSubmit);
resetBtn.addEventListener('click', clearForm);
searchInput.addEventListener('input', renderList);
deleteBtn.addEventListener('click', () => { deleteCurrentItem(); });
exportItemBtn.addEventListener('click', (e) => { e.preventDefault(); exportCurrentItemPdf(); });
exportListBtn.addEventListener('click', exportListPdf);

// Initial render
renderList();

