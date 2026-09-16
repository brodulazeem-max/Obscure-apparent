const products = [
  {id:1, name:"OBSCVRE Stripe Long Sleeve", category:"longsleeve", price:35000, image:"assets/striped-long-sleeve.jpg", desc:"Relaxed striped long-sleeve with a clean everyday silhouette.", colour:"Cream / Navy"},
  {id:2, name:"Firefighters Tee — White", category:"tees", price:28500, image:"assets/firefighters-white.jpg", desc:"White graphic tee with the Firefighters Dept / 5135 Chicago print.", colour:"White / Blue"},
  {id:3, name:"Firefighters Tee — Navy", category:"tees", price:28500, image:"assets/firefighters-navy.jpg", desc:"Deep navy graphic tee finished with a contrasting white collar and cuffs.", colour:"Navy / White"},
  {id:4, name:"Firefighters Tee — Black", category:"tees", price:28500, image:"assets/firefighters-black.jpg", desc:"Black graphic tee with warm contrast ribbing for a darker OBSCVRE fit.", colour:"Black / Brown"},
  {id:5, name:"Firefighters Tee — Blue", category:"tees", price:28500, image:"assets/firefighters-blue.jpg", desc:"Blue graphic tee with crisp contrast edging and a relaxed streetwear cut.", colour:"Blue / White"},
  {id:6, name:"Firefighters Tee — Grey", category:"tees", price:28500, image:"assets/firefighters-grey.jpg", desc:"Soft grey graphic tee with black contrast trim and an easy everyday fit.", colour:"Grey / Black"}
];

const STORE = {
  whatsapp: "2348137024297",
  opayAccount: "8137024297"
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const money = n => "₦" + n.toLocaleString("en-NG");

let cart = JSON.parse(localStorage.getItem("obscvreCart") || "[]");
let filter = "all";
let activeProduct = null;
let selectedSize = "L";

function total(){
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderProducts(){
  const q = $("#search").value.trim().toLowerCase();
  const list = products.filter(p =>
    (filter === "all" || p.category === filter) &&
    `${p.name} ${p.colour}`.toLowerCase().includes(q)
  );

  $("#products").innerHTML = list.map(p => `
    <article class="card" data-id="${p.id}">
      <div class="photo">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="tag">${p.category === "tees" ? "T-SHIRT" : "LONG SLEEVE"}</span>
        <button class="quick" aria-label="View ${p.name}">View ↗</button>
      </div>
      <div class="product-meta">
        <div><h3>${p.name}</h3><span>${p.colour}</span></div>
        <strong>${money(p.price)}</strong>
      </div>
    </article>
  `).join("") || `<div class="no-results">No clothing found. Try another search.</div>`;

  $$(".card").forEach(card => card.addEventListener("click", () => openProduct(+card.dataset.id)));
}

function renderCart(){
  $("#cartCount").textContent = cart.reduce((n, x) => n + x.qty, 0);
  $("#cartEmpty").style.display = cart.length ? "none" : "block";

  $("#cartItems").innerHTML = cart.map(x => `
    <div class="cart-row">
      <img src="${x.image}" alt="">
      <div class="cart-info">
        <h4>${x.name}</h4>
        <small>Size ${x.size}</small>
        <div class="qty">
          <button onclick="changeQty(${x.id},'${x.size}',-1)">−</button>
          <span>${x.qty}</span>
          <button onclick="changeQty(${x.id},'${x.size}',1)">+</button>
        </div>
      </div>
      <strong>${money(x.price * x.qty)}</strong>
    </div>
  `).join("");

  $("#cartTotal").textContent = money(total());
  localStorage.setItem("obscvreCart", JSON.stringify(cart));
}

function changeQty(id, size, amount){
  const item = cart.find(x => x.id === id && x.size === size);
  if(!item) return;
  item.qty += amount;
  if(item.qty <= 0) cart = cart.filter(x => !(x.id === id && x.size === size));
  renderCart();
}

function openProduct(id){
  activeProduct = products.find(p => p.id === id);
  $("#modalImage").src = activeProduct.image;
  $("#modalImage").alt = activeProduct.name;
  $("#modalCategory").textContent = activeProduct.category === "tees" ? "T-SHIRT · OBSCVRE" : "LONG SLEEVE · OBSCVRE";
  $("#modalName").textContent = activeProduct.name;
  $("#modalPrice").textContent = money(activeProduct.price);
  $("#modalDesc").textContent = activeProduct.desc;
  selectedSize = "L";
  $$("#sizes button").forEach(b => b.classList.toggle("selected", b.textContent === selectedSize));
  $("#productModal").classList.add("show");
  $("#productModal").setAttribute("aria-hidden","false");
  $("#overlay").classList.add("show");
}

function closeProduct(){
  $("#productModal").classList.remove("show");
  $("#productModal").setAttribute("aria-hidden","true");
  if(!$("#cart").classList.contains("open")) $("#overlay").classList.remove("show");
}

function addToCart(){
  if(!activeProduct) return;
  const existing = cart.find(x => x.id === activeProduct.id && x.size === selectedSize);
  if(existing) existing.qty++;
  else cart.push({...activeProduct, qty:1, size:selectedSize});
  renderCart();
  closeProduct();
  openCart();
  toast(`${activeProduct.name} · size ${selectedSize} added`);
}

function openCart(){
  $("#cart").classList.add("open");
  $("#overlay").classList.add("show");
}
function closeCart(){
  $("#cart").classList.remove("open");
  if(!$("#productModal").classList.contains("show")) $("#overlay").classList.remove("show");
}

function renderCheckout(){
  $("#checkoutSummary").innerHTML = cart.map(x => `
    <div class="checkout-line">
      <span>${x.name} · ${x.size} × ${x.qty}</span>
      <strong>${money(x.price * x.qty)}</strong>
    </div>
  `).join("");
  $("#checkoutTotal").textContent = money(total());
}

function openCheckout(){
  if(!cart.length){ toast("Your bag is empty"); return; }
  closeCart();
  renderCheckout();
  $("#checkoutModal").classList.add("show");
  $("#checkoutModal").setAttribute("aria-hidden","false");
  document.body.classList.add("locked");
}

function closeCheckout(){
  $("#checkoutModal").classList.remove("show");
  $("#checkoutModal").setAttribute("aria-hidden","true");
  document.body.classList.remove("locked");
}

function openWhatsApp(){
  if(!cart.length){ toast("Your bag is empty"); return; }
  const name = $("#customerName").value.trim();
  const phone = $("#customerPhone").value.trim();
  if(!name || !phone){ toast("Enter your name and phone number"); return; }

  const items = cart.map(x => `${x.name} — size ${x.size} × ${x.qty} — ${money(x.price*x.qty)}`).join("\n");
  const message =
`OBSCVRE APPAREL ORDER

Customer: ${name}
Phone: ${phone}

${items}

TOTAL: ${money(total())}

Payment: OPay
OPay account: ${STORE.opayAccount}

I have paid and will send my transfer receipt.`;

  window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  toast("Order details opened in WhatsApp");
}

$("#filters").addEventListener("click", e => {
  if(e.target.tagName !== "BUTTON") return;
  filter = e.target.dataset.filter;
  $$("#filters button").forEach(b => b.classList.remove("active"));
  e.target.classList.add("active");
  renderProducts();
});
$("#search").addEventListener("input", renderProducts);

$("#sizes").addEventListener("click", e => {
  if(e.target.tagName !== "BUTTON") return;
  selectedSize = e.target.textContent;
  $$("#sizes button").forEach(b => b.classList.remove("selected"));
  e.target.classList.add("selected");
});
$("#modalAdd").addEventListener("click", addToCart);
$("#modalClose").addEventListener("click", closeProduct);
$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", () => { closeCart(); closeProduct(); });
$("#checkoutBtn").addEventListener("click", openCheckout);
$("#checkoutClose").addEventListener("click", closeCheckout);

$("#copyAccount").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(STORE.opayAccount);
    toast("OPay account number copied");
  } catch {
    toast("OPay account: " + STORE.opayAccount);
  }
});

$("#openOpay").addEventListener("click", () => {
  navigator.clipboard?.writeText(STORE.opayAccount).catch(()=>{});
  // OPay does not expose a public browser checkout API in this static site.
  // Try the app URI on devices where it is registered; otherwise show the
  // transfer details so the customer can complete the payment manually.
  const fallback = () => toast("Account 8137024297 copied — open OPay and transfer the exact total");
  let left = false;
  const onBlur = () => { left = true; window.removeEventListener("blur", onBlur); };
  window.addEventListener("blur", onBlur);
  window.location.href = "opay://";
  setTimeout(() => { window.removeEventListener("blur", onBlur); if(!left) fallback(); }, 900);
});

$("#paidWhatsapp").addEventListener("click", openWhatsApp);

$("#contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = e.target.name.value.trim();
  const phone = e.target.phone.value.trim();
  const message = e.target.message.value.trim();
  const text = `OBSCVRE WEBSITE MESSAGE\n\nName: ${name}\nPhone: ${phone}\n\n${message}`;
  window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  e.target.reset();
});

$("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("obscvreTheme", document.body.classList.contains("dark") ? "dark" : "light");
});
if(localStorage.getItem("obscvreTheme") === "dark") document.body.classList.add("dark");

$("#menuBtn").addEventListener("click", () => $("#mobileNav").classList.toggle("show"));
$$(".mobile-nav a").forEach(a => a.addEventListener("click", () => $("#mobileNav").classList.remove("show")));
$("#topBtn").addEventListener("click", () => scrollTo({top:0, behavior:"smooth"}));
addEventListener("scroll", () => $("#topBtn").classList.toggle("show", scrollY > 650));
document.addEventListener("keydown", e => {
  if(e.key === "Escape"){ closeCheckout(); closeCart(); closeProduct(); }
});

renderProducts();
renderCart();
setTimeout(() => $(".loading").classList.add("hide"), 650);
