// ---- Supabase setup ----
// Replace the bracketed placeholders below with your actual Supabase project values.
const SUPABASE_URL = "https://hdkirktmehxqnyfmcyzv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DgC-NyKLAXCl8PRACkgJ6w_G1D_Icc3";
const AFFILIATES_TABLE = "Affliliated people";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const swatches = ['#5FA469','#7A3B63','#4E6B3A','#B0713C','#3C6E7A'];
let products = JSON.parse(localStorage.getItem('sd_products')||'null') || [
  {id:1,name:'Hand-Embroidered Shawl',artisan:'Amina',price:3500,desc:'Traditional needlework in gold thread, passed down through three generations of her family.',color:swatches[0],photo:null},
  {id:2,name:'Mirror-Work Tunic',artisan:'Rukhsana',price:4800,desc:'Hand-set mirror work over deep dusk purple cotton, stitched over two weeks by hand.',color:swatches[1],photo:null},
  {id:3,name:'Block-Print Kurta',artisan:'Saira',price:4200,desc:'Wood-block printed by hand, one panel at a time, in a pattern unique to her stall.',color:swatches[2],photo:null},
];
let cart = JSON.parse(sessionStorage.getItem('sd_cart')||'[]');
let activeProduct = null, activeSize = 'M';

function saveProducts(){ try{ localStorage.setItem('sd_products',JSON.stringify(products)); }catch(e){} }
function saveCart(){ try{ sessionStorage.setItem('sd_cart',JSON.stringify(cart)); }catch(e){} }

function renderGrid(){
  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.map(p=>`
    <div class="card">
      <div class="spin-box" data-id="${p.id}">
        <div class="spin-face" style="${p.photo?`background-image:url(${p.photo});background-size:cover;background-position:center;`:`background:${p.color};`}"></div>
        <div class="spin-tag">⟷ drag to spin</div>
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <div class="price">Rs ${p.price.toLocaleString()} · by ${p.artisan}</div>
        <p>${p.desc||''}</p>
        <button class="view-btn" onclick="openProduct(${p.id})">View &amp; Select Size</button>
      </div>
    </div>`).join('');
  attachSpin();
}

function attachSpin(){
  document.querySelectorAll('.spin-box').forEach(box=>{
    if(box.id==='modalSpin') return;
    let dragging=false,startX=0,rot=0;
    const face=box.querySelector('.spin-face');
    const start=e=>{dragging=true;startX=(e.touches?e.touches[0].clientX:e.clientX);box.style.cursor='grabbing';};
    const move=e=>{
      if(!dragging) return;
      const x=(e.touches?e.touches[0].clientX:e.clientX);
      rot += (x-startX)*0.6; startX=x;
      face.style.transform=`rotateY(${rot}deg)`;
      face.style.filter = Math.abs(rot%360)>90 && Math.abs(rot%360)<270 ? 'brightness(0.7)' : 'brightness(1)';
    };
    const end=()=>{dragging=false;box.style.cursor='grab';};
    box.addEventListener('mousedown',start); box.addEventListener('touchstart',start,{passive:true});
    window.addEventListener('mousemove',move); box.addEventListener('touchmove',move,{passive:true});
    window.addEventListener('mouseup',end); box.addEventListener('touchend',end);
  });
}

function openOverlay(id){ document.getElementById(id).classList.add('open'); }
function closeOverlay(id){ document.getElementById(id).classList.remove('open'); }
function scrollTo(sel){ document.querySelector(sel).scrollIntoView({behavior:'smooth'}); }

function openProduct(id){
  activeProduct = products.find(p=>p.id===id); activeSize='M';
  document.getElementById('modalName').textContent = activeProduct.name;
  document.getElementById('modalPrice').textContent = `Rs ${activeProduct.price.toLocaleString()} · by ${activeProduct.artisan}`;
  document.getElementById('modalDesc').textContent = activeProduct.desc||'';
  const face = document.getElementById('modalFace');
  face.style.background = activeProduct.photo? `url(${activeProduct.photo}) center/cover` : activeProduct.color;
  face.style.transform='rotateY(0deg)'; face.style.filter='none';
  document.querySelectorAll('#sizeRow .size-btn').forEach(b=>b.classList.toggle('active', b.dataset.s==='M'));
  openOverlay('productOverlay');
}
document.getElementById('sizeRow').addEventListener('click',e=>{
  const b=e.target.closest('.size-btn'); if(!b) return;
  activeSize=b.dataset.s;
  document.querySelectorAll('#sizeRow .size-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
});
attachSpin();
(function(){ // modal spin
  const box=document.getElementById('modalSpin'); let dragging=false,startX=0,rot=0;
  const face=document.getElementById('modalFace');
  const start=e=>{dragging=true;startX=(e.touches?e.touches[0].clientX:e.clientX);};
  const move=e=>{ if(!dragging) return; const x=(e.touches?e.touches[0].clientX:e.clientX); rot+=(x-startX)*0.6; startX=x; face.style.transform=`rotateY(${rot}deg)`; };
  const end=()=>dragging=false;
  box.addEventListener('mousedown',start); box.addEventListener('touchstart',start,{passive:true});
  window.addEventListener('mousemove',move); box.addEventListener('touchmove',move,{passive:true});
  window.addEventListener('mouseup',end); box.addEventListener('touchend',end);
})();

function addToCart(){
  if(!activeProduct) return;
  const existing = cart.find(i=>i.id===activeProduct.id && i.size===activeSize);
  if(existing) existing.qty++;
  else cart.push({id:activeProduct.id,name:activeProduct.name,price:activeProduct.price,size:activeSize,qty:1});
  saveCart(); renderCart(); closeOverlay('productOverlay'); showToast('Added to cart');
  document.getElementById('cartBadge').textContent = cart.reduce((s,i)=>s+i.qty,0);
}

function renderCart(){
  const box=document.getElementById('cartItems');
  if(!cart.length){ box.innerHTML='<p style="opacity:.6">Your cart is empty.</p>'; }
  else box.innerHTML = cart.map((i,idx)=>`
    <div class="cart-item">
      <div><div style="font-weight:600">${i.name} <span style="font-weight:400;opacity:.6">(${i.size})</span></div>
      <div style="opacity:.7;font-size:.9rem">Rs ${i.price.toLocaleString()} × ${i.qty}</div></div>
      <div class="qty"><button onclick="changeQty(${idx},-1)">−</button>${i.qty}<button onclick="changeQty(${idx},1)">+</button></div>
    </div>`).join('');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('cartTotal').textContent = `Rs ${total.toLocaleString()}`;
  document.getElementById('cartBadge').textContent = cart.reduce((s,i)=>s+i.qty,0);
}
function changeQty(idx,d){
  cart[idx].qty += d;
  if(cart[idx].qty<=0) cart.splice(idx,1);
  saveCart(); renderCart();
}
document.getElementById('cartOpenBtn').addEventListener('click',()=>{ renderCart(); openOverlay('cartOverlay'); });

document.getElementById('addForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=document.getElementById('f_name').value.trim();
  const artisan=document.getElementById('f_artisan').value.trim();
  const price=parseInt(document.getElementById('f_price').value,10)||0;
  const desc=document.getElementById('f_desc').value.trim();
  const fileInput=document.getElementById('f_photo');
  const finish=(photo)=>{
    products.push({id:Date.now(),name,artisan,price,desc,color:swatches[products.length%swatches.length],photo});
    saveProducts(); renderGrid(); e.target.reset(); showToast('Added to the shop'); scrollTo('#collection');
  };
  if(fileInput.files && fileInput.files[0]){
    const reader=new FileReader(); reader.onload=ev=>finish(ev.target.result); reader.readAsDataURL(fileInput.files[0]);
  } else finish(null);
});

function showToast(msg){
  const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}

document.getElementById('checkoutForm').addEventListener('submit',e=>{
  e.preventDefault();
  if(!cart.length) return;
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const orderId = 'SD-'+Math.floor(10000+Math.random()*89999);
  const orders = JSON.parse(localStorage.getItem('sd_orders')||'{}');
  orders[orderId] = {total, step: 1 + Math.floor(Math.random()*2)};
  localStorage.setItem('sd_orders', JSON.stringify(orders));
  cart = []; saveCart(); renderCart();
  closeOverlay('checkoutOverlay'); closeOverlay('cartOverlay');
  document.getElementById('trackInput').value = orderId;
  showToast(`Order placed! ID ${orderId}`);
  scrollTo('#trackInput');
  setTimeout(trackOrder, 400);
});

function trackOrder(){
  const id = document.getElementById('trackInput').value.trim().toUpperCase();
  const orders = JSON.parse(localStorage.getItem('sd_orders')||'{}');
  const labels = ['Order Placed','Packed by Artisan','Shipped','Out for Delivery','Delivered'];
  const msg = document.getElementById('trackMsg');
  const stepsEl = document.getElementById('trackSteps');
  if(orders[id]){
    msg.innerHTML = `Order placed! Your order ID is <b>${id}</b> — save it to track your delivery.<br>Order total: Rs ${orders[id].total.toLocaleString()}`;
    stepsEl.innerHTML = labels.map((l,i)=>`<li class="${i<=orders[id].step?'done':''}">${l}</li>`).join('');
  } else {
    msg.textContent = id ? "We couldn't find that order ID." : 'Enter an order ID above to see its status.';
    stepsEl.innerHTML='';
  }
}

// ---- Affiliate program (Supabase-linked) ----
document.getElementById('affiliateOpenBtn').addEventListener('click',()=>openOverlay('affiliateOverlay'));

document.getElementById('affiliateForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const email = document.getElementById('aff_email').value.trim();
  const postalCode = document.getElementById('aff_postal_code').value.trim();
  const submitBtn = e.target.querySelector('button[type=submit]');
  submitBtn.disabled = true; submitBtn.textContent = 'Joining...';
  try{
    const { error } = await supabaseClient
      .from(AFFILIATES_TABLE)
      .insert([{ email: email, postal_code: postalCode }]);
    if(error) throw error;
    showToast("You're in! We'll be in touch.");
    e.target.reset();
    closeOverlay('affiliateOverlay');
  }catch(err){
    console.error(err);
    showToast('Something went wrong — please try again.');
  }finally{
    submitBtn.disabled = false; submitBtn.textContent = 'Join the Affiliate Program';
  }
});

renderGrid(); renderCart();
