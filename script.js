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

// ======= INIT =======
const waBase = 'https://wa.me/233' + PHONE.replace(/^0/, '');
const defaultMsg = encodeURIComponent('Hello ' + BUSINESS_NAME + ', I need assistance.');

document.addEventListener('DOMContentLoaded', () => {
  // Contact links
  document.getElementById('whatsappLink').href = waBase + '?text=' + defaultMsg;
  document.getElementById('waLink2').href = waBase + '?text=' + defaultMsg;
  document.getElementById('smsLink').href = 'sms:' + SMS_NUMBER + '?body=' + decodeURIComponent(defaultMsg);
  document.getElementById('callLink').href = 'tel:' + PHONE;
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

  // Populate selectors
  fillOptions('mtnPlans', PRICES.MTN);
  fillOptions('tigoPlans', PRICES.AirtelTigo);
  fillOptions('telecelPlans', PRICES.Telecel);
  fillOptions('netflixPlan', PRICES.Netflix);
  fillOptions('audiomackPlan', PRICES.Audiomack);

  // Mobile menu (optional expansion)
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

// Extract numeric price from label and convert to pesewas for Paystack
function parsePriceToPesewas(label){
  const match = label.match(/([0-9]+(?:\.[0-9]+)?)/);
  if(!match) return null;
  return Math.round(parseFloat(match[1]) * 100);
}

function paystackCheckout({email, amountPesewas, reference, metadata}){
  if(!window.PaystackPop) return alert('Paystack could not load. Check your internet.');
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amountPesewas,
    currency: CURRENCY,
    ref: reference || ('PAD-' + Date.now()),
    metadata,
    callback: function(response){
      alert('Payment complete. Ref: ' + response.reference + '\nWe will process your order shortly.');
    },
    onClose: function(){
      // Optional: toast UI here
    }
  });
  handler.openIframe();
}

function buyData(network){
  const id = network === 'MTN' ? 'mtn' : (network === 'AirtelTigo' ? 'tigo' : 'telecel');
  const plan = document.getElementById(id + 'Plans').value;
  const number = document.getElementById(id + 'Number').value;
  const email = document.getElementById(id + 'Email').value;
  if(!plan) return alert('Please select a ' + network + ' plan.');
  if(!number) return alert('Enter a valid phone number.');
  if(!email) return alert('Enter a valid email for receipt.');

  const amount = parsePriceToPesewas(plan);
  if(amount === null) return alert('Could not read price amount from: ' + plan);

  const metadata = {
    custom_fields: [
      { display_name: 'Service', variable_name: 'service', value: network + ' Data' },
      { display_name: 'Plan', variable_name: 'plan', value: plan },
      { display_name: 'Phone', variable_name: 'phone', value: number }
    ]
  };

  paystackCheckout({
    email,
    amountPesewas: amount,
    reference: 'DATA-' + network + '-' + Date.now(),
    metadata
  });
}

function buySub(service){
  const id = service.toLowerCase();
  const plan = document.getElementById(id + 'Plan').value;
  const email = document.getElementById(id + 'Email').value;
  if(!plan) return alert('Select a ' + service + ' plan.');
  if(!email) return alert('Enter your account email.');

  const amount = parsePriceToPesewas(plan);
  if(amount === null) return alert('Set a numeric price in the plan label first.');

  const metadata = {
    custom_fields: [
      { display_name: 'Service', variable_name: 'service', value: service },
      { display_name: 'Plan', variable_name: 'plan', value: plan }
    ]
  };

  paystackCheckout({
    email,
    amountPesewas: amount,
    reference: 'SUB-' + service + '-' + Date.now(),
    metadata
  });
}

function servicePay(serviceName){
  const email = prompt('Enter customer email (for receipt):');
  if(!email) return;
  const amountGHS = prompt('Enter amount in GHS for "' + serviceName + '"');
  if(!amountGHS) return;
  const amount = Math.round(parseFloat(amountGHS) * 100);
  if(!amount || isNaN(amount)) return alert('Invalid amount.');

  const metadata = {
    custom_fields: [ { display_name: 'Service', variable_name: 'service', value: serviceName } ]
  };

  paystackCheckout({
    email,
    amountPesewas: amount,
    reference: 'SERV-' + Date.now(),
    metadata
  });
}
