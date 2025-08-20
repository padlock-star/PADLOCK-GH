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
  Netflix: [
    { label: 'Monthly Subscription — GHS 45' }
  ],
  Audiomack: [
    { label: 'One-time Subscription — GHS 30' }
  ]
};

const PAYSTACK_PUBLIC_KEY = "pk_live_17bb96f84ba0c11e129fde953e6ec67758097c25";

document.addEventListener('DOMContentLoaded', ()=>{
  fillOptions('mtnPlans', PRICES.MTN);
  fillOptions('netflixPlan', PRICES.Netflix);
  fillOptions('audiomackPlan', PRICES.Audiomack);
});

function fillOptions(id, arr){
  const sel=document.getElementById(id);
  sel.innerHTML='<option>— Select Plan —</option>';
  arr.forEach(it=>{
    let o=document.createElement('option');
    o.textContent=it.label; sel.appendChild(o);
  });
}

function parsePriceToPesewas(label){
  let m=label.match(/([0-9]+(?:\.[0-9]+)?)/);
  if(!m) return null;
  return Math.round(parseFloat(m[1])*100);
}

function paystackCheckout({email, amountPesewas, reference, metadata}){
  const handler=PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email, amount: amountPesewas, currency:'GHS', ref: reference,
    metadata,
    callback:function(r){alert('Payment complete Ref:'+r.reference)},
    onClose:function(){alert('Payment closed')}
  });
  handler.openIframe();
}

function buyData(net){
  const plan=document.getElementById('mtnPlans').value;
  const num=document.getElementById('mtnNumber').value;
  const email=document.getElementById('mtnEmail').value;
  if(!plan||!num||!email) return alert('Fill all fields');
  const amount=parsePriceToPesewas(plan);
  paystackCheckout({
    email, amountPesewas:amount,
    reference:'DATA-'+net+'-'+Date.now(),
    metadata:{custom_fields:[{display_name:'Plan',value:plan},{display_name:'Number',value:num}]}
  });
}

function buySub(service){
  const id=service.toLowerCase();
  const plan=document.getElementById(id+'Plan').value;
  const email=document.getElementById(id+'Email').value;
  if(!plan||!email) return alert('Fill fields');
  const amount=parsePriceToPesewas(plan);
  paystackCheckout({
    email, amountPesewas:amount,
    reference:'SUB-'+service+'-'+Date.now(),
    metadata:{custom_fields:[{display_name:'Plan',value:plan}]}
  });
}
