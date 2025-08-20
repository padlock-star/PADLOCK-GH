// ======= CONFIG: GHS PRICES =======
const PRICES = {
  MTN: [
    { label: '1GB — GHS 5' },{ label: '2GB — GHS 10' },{ label: '3GB — GHS 15' },
    { label: '4GB — GHS 20' },{ label: '5GB — GHS 25' },{ label: '6GB — GHS 30' },
    { label: '7GB — GHS 35' },{ label: '8GB — GHS 40' },{ label: '10GB — GHS 45' },
    { label: '15GB — GHS 70' },{ label: '20GB — GHS 90' },{ label: '25GB — GHS 115' },
    { label: '30GB — GHS 140' },{ label: '40GB — GHS 180' },{ label: '50GB — GHS 230' },
    { label: '100GB — GHS 460' }
  ],
  AirtelTigo: [
    { label: '1GB — GHS 5' },{ label: '2GB — GHS 9' },{ label: '3GB — GHS 14' },
    { label: '4GB — GHS 18' },{ label: '5GB — GHS 23' },{ label: '6GB — GHS 27' },
    { label: '7GB — GHS 32' },{ label: '8GB — GHS 37' },{ label: '9GB — GHS 39' },
    { label: '10GB — GHS 44' },{ label: '15GB — GHS 64' },{ label: '20GB — GHS 84' },
    { label: '30GB — GHS 128' },{ label: '40GB — GHS 170' },{ label: '50GB — GHS 208' },
    { label: '100GB — GHS 310' }
  ],
  Telecel: [
    { label: '5GB — GHS 23' },{ label: '10GB — GHS 43' },{ label: '15GB — GHS 63' },
    { label: '20GB — GHS 87' },{ label: '30GB — GHS 128' },{ label: '40GB — GHS 165' },
    { label: '50GB — GHS 208' },{ label: '100GB — GHS 318' }
  ],
  Netflix: [ { label: 'Monthly Subscription — GHS 45' } ],
  Audiomack: [ { label: 'One-time Subscription — GHS 30' } ]
};

// ======= SETTINGS =======
const BUSINESS_NAME = 'PADLOCK GH';
const PHONE = '0534706233';
const SMS_NUMBER = '0534706233';
const PAYSTACK_PUBLIC_KEY = 'pk_live_17bb96f84ba0c11e129fde953e6ec67758097c25';
const CURRENCY = 'GHS'; // Paystack Ghana
// If you later host the tracker API elsewhere (Vercel/Netlify), you can set API_BASE like:
// const API_BASE = 'https://your-api.vercel.app';

// ======= INIT =======
const waBase = 'https://wa.me/233' + PHONE.replace(/^0/, '');
const defaultMsg = encodeURIComponent('Hello ' + BUSINESS_NAME + ', I need assistance.');

document.addEventListener('DOMContentLoaded', () => {
  // Contact links
  const wa1 = document.getElementById('whatsappLink');
  const wa2 = document.getElementById('waLink2');
  wa1 && (wa1.href = waBase + '?text=' + defaultMsg);
  wa2 && (wa2.href = waBase + '?text=' + defaultMsg);
  const sms = document.getElementById('smsLink');
  sms && (sms.href = 'sms:' + SMS_NUMBER + '?body=' + decodeURIComponent(defaultMsg));
  const call = document.getElementById('callLink');
  call && (call.href = 'tel:' + PHONE);
  const year = document.getElementById('year');
  year && (year.textContent = new Date().getFullYear());

  // Populate selectors
  fillOptions('mtnPlans', PRICES.MTN);
  fillOptions('tigoPlans', PRICES.AirtelTigo);
  fillOptions('telecelPlans', PRICES.Telecel);
  fillOptions('netflixPlan', PRICES.Netflix);
  fillOptions('audiomackPlan', PRICES.Audiomack);

  // Mobile menu
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.querySelector('.nav');
  if(menuBtn && nav){
    menuBtn.addEventListener('click', () => nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex');
  }
});

function fillOptions(selectId, items){
  const sel = document.getElementById(selectId);
  if(!sel) return;
  sel.innerHTML = '<option value="" selected disabled>— Select Plan —</option>';
  items.forEach(it => {
    const opt = document.createElement('option');
    opt.textContent = it.label;
    sel.appendChild(opt);
  });
}

// ======= Helpers =======
function toast(msg){
  const el = document.getElementById('toast');
  if(!el){ alert(msg); return; }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

// Extract numeric price from label and convert to pesewas for Paystack
function parsePriceToPesewas(label){
  // Extract the LAST number in the label so formats like "2GB — GHS 12" work.
  const matches = (label || '').match(/([0-9]+(?:\.[0-9]+)?)/g);
  if(!matches || !matches.length) return null;
  const amount = parseFloat(matches[matches.length - 1]); // use last number (price)
  if(!Number.isFinite(amount)) return null;
  return Math.round(amount * 100); // convert GHS -> pesewas
}

function buildRef(prefix){
  const rand = Math.floor(Math.random()*1e6).toString().padStart(6,'0');
  return `${prefix}-${Date.now()}-${rand}`.toUpperCase();
}

// Single place to open Paystack safely
function paystackCheckout({email, amountPesewas, reference, metadata}){
  if(!window.PaystackPop) return toast('Paystack could not load. Check your internet.');
  if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('Enter a valid email');
  if(!Number.isFinite(amountPesewas) || amountPesewas < 100) return toast('Amount invalid (must be in pesewas, >= 100)');

  try {
    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amountPesewas), // integer pesewas
      currency: CURRENCY,
      ref: reference || buildRef('PAD'),
      // keep metadata SIMPLE (avoid malformed custom_fields)
      metadata: metadata && typeof metadata === 'object' ? metadata : {},
      channels: ['mobile_money', 'card'], // you can add 'bank_transfer' if enabled
      callback: function(response){
        toast('Payment complete — Ref: ' + response.reference);
      },
      onClose: function(){
        toast('Payment closed');
      }
    });
    handler.openIframe();
  } catch (e){
    console.error(e);
    toast('Could not open Paystack: ' + (e.message || 'error'));
  }
}

// ======= Checkout flows =======
function buyData(network){
  const id = network === 'MTN' ? 'mtn' : (network === 'AirtelTigo' ? 'tigo' : 'telecel');
  const plan = (document.getElementById(id + 'Plans') || {}).value;
  const number = (document.getElementById(id + 'Number') || {}).value;
  const email = (document.getElementById(id + 'Email') || {}).value;

  if(!plan) return toast('Select a ' + network + ' plan');
  if(!number) return toast('Enter phone number');
  if(!email) return toast('Enter email for receipt');

  const pesewas = parsePriceToPesewas(plan);
  if(pesewas === null) return toast('Could not read price from: ' + plan);

  const metadata = {
    service: network + ' Data',
    plan: plan,
    phone: number
  };

  paystackCheckout({
    email,
    amountPesewas: pesewas,
    reference: buildRef('DATA-' + network),
    metadata
  });
}

function buySub(service){
  const id = service.toLowerCase();
  const plan = (document.getElementById(id + 'Plan') || {}).value;
  const email = (document.getElementById(id + 'Email') || {}).value;

  if(!plan) return toast('Select a ' + service + ' plan');
  if(!email) return toast('Enter account email');

  const pesewas = parsePriceToPesewas(plan);
  if(pesewas === null) return toast('Set a numeric price first');

  const metadata = { service, plan };

  paystackCheckout({
    email,
    amountPesewas: pesewas,
    reference: buildRef('SUB-' + service),
    metadata
  });
}

// Manual services (enter amount directly in GHS)
function servicePay(serviceName){
  const email = prompt('Enter customer email (for receipt):');
  if(!email) return;
  const amountGHS = prompt('Enter amount in GHS for "' + serviceName + '"');
  if(!amountGHS) return;
  const pesewas = Math.round(parseFloat(amountGHS) * 100);
  if(!Number.isFinite(pesewas) || pesewas < 100) return toast('Invalid amount');
  const metadata = { service: serviceName };
  paystackCheckout({
    email,
    amountPesewas: pesewas,
    reference: buildRef('SERV'),
    metadata
  });
}

// ======= Order Tracker (client-side demo remains unless API_BASE is provided) =======
async function trackOrder(){
  const out = document.getElementById('trackResult');
  out && (out.textContent = '');
  const phone = (document.getElementById('trackPhone')?.value || '').replace(/\D/g, '');
  const last4 = (document.getElementById('trackRef')?.value || '').trim();
  if(phone.length < 9) return toast('Enter a valid phone');
  if(last4.length < 4) return toast('Enter the last 4 of reference');

  if(typeof API_BASE === 'string' && API_BASE){
    try{
      const r = await fetch(`${API_BASE}/api/track?phone=${encodeURIComponent(phone)}&ref_last4=${encodeURIComponent(last4)}`);
      const data = await r.json();
      if(!r.ok) throw new Error(data?.error || 'Request failed');
      const lines = [];
      lines.push(`<b>Status:</b> ${data.status || 'Unknown'}`);
      if(data.amount) lines.push(`<b>Amount:</b> GHS ${(data.amount/100).toFixed(2)}`);
      if(data.service) lines.push(`<b>Service:</b> ${data.service}`);
      if(data.plan) lines.push(`<b>Plan:</b> ${data.plan}`);
      if(data.phone) lines.push(`<b>Phone:</b> ${data.phone}`);
      if(data.paid_at) lines.push(`<b>Paid At:</b> ${data.paid_at}`);
      if(data.reference) lines.push(`<b>Reference:</b> ${data.reference}`);
      out.innerHTML = lines.join(' • ');
    }catch(e){
      out.innerHTML = '<b>Error:</b> ' + (e.message || 'Could not reach tracker');
    }
  } else {
    // fallback demo behaviour
    const code = last4.toUpperCase().charCodeAt(3);
    const statuses = ['Processing', 'Queued', 'Fulfilled', 'Pending Review'];
    const status = statuses[code % statuses.length];
    out.innerHTML = '<b>Status:</b> ' + status + ' • <span class="tiny">(demo)</span>';
  }
}
