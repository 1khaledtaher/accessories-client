import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAkDcvw4nvYOhBgCNfwO0k61k1_AjqQsJI",
  authDomain: "bueate-260eb.firebaseapp.com",
  databaseURL: "https://bueate-260eb-default-rtdb.firebaseio.com",
  projectId: "bueate-260eb",
  storageBucket: "bueate-260eb.firebasestorage.app",
  messagingSenderId: "639988468482",
  appId: "1:639988468482:web:9ea8920d3bb79ce23dd01b",
  measurementId: "G-NDRPP7YZK4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let data = { categories: [], products: {} };
let allProducts = [];
let currentSort = null;

function loadDataFromFirebase() {
  const categoriesRef = ref(db, 'categories');
  const productsRef = ref(db, 'products');

  onValue(categoriesRef, (snapshot) => {
    data.categories = snapshot.val() || [];
    renderCategories();
  });

  onValue(productsRef, (snapshot) => {
    data.products = snapshot.val() || {};
    allProducts = Object.keys(data.products).flatMap(category => 
      (data.products[category] || []).map(product => ({ ...product, category }))
    );
    renderProducts(allProducts);
  });
}

function renderCategories() {
  const sidebarCategories = document.querySelector(".sidebar-categories");
  sidebarCategories.innerHTML = '<li><button class="category-item active" data-filter="all">الكل</button></li>';
  data.categories.forEach(category => {
    const li = document.createElement("li");
    li.innerHTML = `<button class="category-item" data-filter="${category}">${category}</button>`;
    sidebarCategories.appendChild(li);
  });

  document.querySelectorAll(".category-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      if (filter === "all") {
        renderProducts(allProducts, "all", currentSort);
      } else {
        const filteredProducts = allProducts.filter(product => product.category === filter);
        renderProducts(filteredProducts, filter, currentSort);
      }
    });
  });
}

const fuse = new Fuse(allProducts, {
  keys: ['name', 'desc'],
  threshold: 0.4,
  includeScore: true,
});

function renderProducts(products, filter = "all", sort = currentSort) {
  const container = document.getElementById("categories");
  const section = document.querySelector(".categories-section");
  container.innerHTML = "";
  section.style.display = "block";

  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => link.classList.remove("active"));
  const homeLink = document.querySelector('.nav-link[href="#home"]');
  homeLink.classList.add("active");

  let sortedProducts = [...products];
  if (sort === "price-asc") {
    sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sort === "price-desc") {
    sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(b.price));
  }

  const productGrid = document.createElement("div");
  productGrid.className = "product-grid";

  sortedProducts.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <img class="product-img" src="${product.img || 'https://via.placeholder.com/200'}" alt="${product.name}" loading="lazy" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.desc || 'بدون وصف'}</p>
        <span class="product-price">${product.price} جنيه</span>
      </div>
    `;
    productCard.addEventListener("click", () => showModal(product));
    productGrid.appendChild(productCard);
  });

  container.appendChild(productGrid);
}

function showModal(product) {
  const modal = document.getElementById("product-modal");
  const modalImg = document.getElementById("modal-img");
  const modalName = document.getElementById("modal-name");
  const modalDesc = document.getElementById("modal-desc");
  const modalPrice = document.getElementById("modal-price");
  const downloadButton = document.querySelector(".download-product");

  modalImg.src = product.img || 'https://via.placeholder.com/200';
  modalName.textContent = product.name;
  modalDesc.textContent = product.desc || 'بدون وصف';
  modalPrice.textContent = `${product.price} جنيه`;
  downloadButton.setAttribute("data-name", product.name);
  downloadButton.setAttribute("data-price", product.price);
  downloadButton.setAttribute("data-img", product.img || 'https://via.placeholder.com/200');

  modal.style.display = "flex";
}

function downloadProductImage(name, price, imgSrc) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 400;
  canvas.height = 500;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imgSrc;
  img.onload = () => {
    ctx.drawImage(img, 100, 50, 200, 200);
    ctx.fillStyle = "#000000";
    ctx.font = "20px Cairo";
    ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, 300);
    ctx.font = "18px Cairo";
    ctx.fillText(`السعر: ${price} جنيه`, canvas.width / 2, 330);
    ctx.font = "16px Cairo";
    ctx.fillText("إكسسوارات بنات", canvas.width / 2, 360);

    const link = document.createElement("a");
    link.download = `${name.replace(/\s+/g, '_')}_product.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
}

document.querySelector(".close-modal").addEventListener("click", () => {
  document.getElementById("product-modal").style.display = "none";
});

document.querySelectorAll(".sort-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentSort = btn.dataset.sort;
    const currentFilter = document.querySelector(".category-item.active")?.dataset.filter || "all";
    if (currentFilter === "all") {
      renderProducts(allProducts, "all", currentSort);
    } else {
      const filteredProducts = allProducts.filter(product => product.category === currentFilter);
      renderProducts(filteredProducts, currentFilter, currentSort);
    }
  });
});

document.querySelector(".cta-button").addEventListener("click", () => {
  document.querySelectorAll(".category-item").forEach(b => b.classList.remove("active"));
  document.querySelector(".category-item[data-filter='all']").classList.add("active");
  document.getElementById("categories").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const targetId = link.getAttribute("href").substring(1);
    document.getElementById(targetId).scrollIntoView({ behavior: "smooth" });
    if (targetId === "home") {
      renderProducts(allProducts);
    }
  });
});

document.querySelector(".theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("active");
});

document.querySelector(".sidebar-toggle").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("active");
});

document.querySelector(".close-sidebar").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.remove("active");
});

document.getElementById("search-input").addEventListener("input", e => {
  const query = e.target.value.trim();
  const container = document.getElementById("categories");
  const section = document.querySelector(".categories-section");
  container.innerHTML = "";
  section.style.display = "block";

  if (query === "") {
    document.querySelectorAll(".category-item").forEach(b => b.classList.remove("active"));
    document.querySelector(".category-item[data-filter='all']").classList.add("active");
    renderProducts(allProducts, "all", currentSort);
    return;
  }

  const results = fuse.search(query).map(result => result.item);
  if (results.length > 0) {
    renderProducts(results, "all", currentSort);
  } else {
    const noResultsDiv = document.createElement("div");
    noResultsDiv.className = "no-results";
    noResultsDiv.textContent = `لا توجد نتائج للبحث: "${query}"`;
    container.appendChild(noResultsDiv);
  }
});

document.querySelector(".download-product").addEventListener("click", () => {
  const name = document.getElementById("modal-name").textContent;
  const price = document.getElementById("modal-price").textContent.replace(" جنيه", "");
  const imgSrc = document.getElementById("modal-img").src;
  downloadProductImage(name, price, imgSrc);
});

document.querySelector(".logo").addEventListener("click", () => {
  location.reload();
});

loadDataFromFirebase();