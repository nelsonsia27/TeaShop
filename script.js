const RAW = 'https://raw.githubusercontent.com/nelsonsia27/TeaShop/main/';
const assets = {
  logo: RAW + 'logo.png',
  shop: RAW + 'shop-inside.png',
  counter: RAW + 'counter.png',
  cups: {
    small: RAW + 'cup-small.png',
    medium: RAW + 'cup-medium.png',
    large: RAW + 'cup-large.png'
  },
  flavors: {
    classic: RAW + 'classic.png',
    brownSugar: RAW + 'brown-sugar.png',
    jasmine: RAW + 'jasmine.png',
    taro: RAW + 'taro.png',
    chocolate: RAW + 'chocolate.png'
  },
  toppings: {
    eggPudding: RAW + 'egg-pudding.png',
    taroBalls: RAW + 'taro-balls.png',
    iceCream: RAW + 'ice-cream.png',
    grassJelly: RAW + 'grass-jelly.png',
    cheeseFoam: RAW + 'cheese-foam.png',
    coconutJelly: RAW + 'coconut-jelly.png'
  }
};

document.documentElement.style.setProperty('--shop-url', `url('${assets.shop}')`);
document.getElementById('gameLogo').src = assets.logo;
document.getElementById('miniLogo').src = assets.logo;
document.getElementById('counterImg').src = assets.counter;

const catalog = {
  flavor: [
    { id:'classic', label:'Classic Milk Tea', img:assets.flavors.classic, color:'#c69158', price:0 },
    { id:'brownSugar', label:'Brown Sugar Milk Tea', img:assets.flavors.brownSugar, color:'#9a5d32', price:10 },
    { id:'jasmine', label:'Jasmine Green Tea', img:assets.flavors.jasmine, color:'#b5c878', price:0 },
    { id:'taro', label:'Taro Milk Tea', img:assets.flavors.taro, color:'#b996df', price:10 },
    { id:'chocolate', label:'Chocolate Milk Tea', img:assets.flavors.chocolate, color:'#7a4a2b', price:10 }
  ],
  size: [
    { id:'small', label:'Small', img:assets.cups.small, price:40 },
    { id:'medium', label:'Medium', img:assets.cups.medium, price:50 },
    { id:'large', label:'Large', img:assets.cups.large, price:60 }
  ],
  ice: [
    { id:'ice100', label:'100%', emoji:'🧊🧊🧊🧊' },
    { id:'ice50', label:'50%', emoji:'🧊🧊' },
    { id:'ice30', label:'30%', emoji:'🧊' },
    { id:'ice0', label:'0%', emoji:'🚫🧊' }
  ],
  sugar: [
    { id:'sugar100', label:'100%', emoji:'🍬🍬🍬🍬' },
    { id:'sugar70', label:'70%', emoji:'🍬🍬🍬' },
    { id:'sugar50', label:'50%', emoji:'🍬🍬' },
    { id:'sugar30', label:'30%', emoji:'🍬' },
    { id:'sugar0', label:'0%', emoji:'🚫🍬' }
  ],
  toppings: [
    { id:'eggPudding', label:'Egg Pudding', img:assets.toppings.eggPudding, emoji:'🍮', price:10 },
    { id:'taroBalls', label:'Taro Balls', img:assets.toppings.taroBalls, emoji:'🟣', price:10 },
    { id:'iceCream', label:'Ice Cream', img:assets.toppings.iceCream, emoji:'🍨', price:10 },
    { id:'grassJelly', label:'Grass Jelly', img:assets.toppings.grassJelly, emoji:'⬛', price:10 },
    { id:'cheeseFoam', label:'Cheese Foam', img:assets.toppings.cheeseFoam, emoji:'🧀', price:10 },
    { id:'coconutJelly', label:'Coconut Jelly', img:assets.toppings.coconutJelly, emoji:'🥥', price:10 }
  ]
};

const steps = [
  { key:'flavor', title:'Flavor', cashier:'Hello! Welcome to our tea shop. What would you like to drink?', template:v=>`Hi! I want a ${v}, please.`, blank:'Hi! I want a ____________, please.', selectMax:1 },
  { key:'size', title:'Size', cashier:'Okay! What size do you want? Small, medium, or large?', template:v=>`I want a ${v.toLowerCase()}, please.`, blank:'I want a ____________, please.', selectMax:1 },
  { key:'ice', title:'Ice', cashier:'What ice level would you like? We have 100%, 50%, 30%, or 0%.', template:v=>`${v} ice, please.`, blank:'________ ice, please.', selectMax:1 },
  { key:'sugar', title:'Sugar', cashier:'And what sugar level? We have 100%, 70%, 50%, 30%, or 0%.', template:v=>`${v} sugar, please.`, blank:'________ sugar, please.', selectMax:1 },
  { key:'toppings', title:'Toppings', cashier:'Do you want to add any toppings? They are 10 dollars each.', template:v=>`Yes, I want ${v[0]} and ${v[1]}.`, blank:'Yes, I want ____________ and ____________.', selectMax:2 }
];

let currentStep = 0;
let selected = [];
let order = {};
let customerLocked = false;
let typingToken = 0;

const screens = {
  intro: document.getElementById('introScreen'),
  game: document.getElementById('gameScreen'),
  final: document.getElementById('finalScreen')
};
const startBtn = document.getElementById('startBtn');
const customerSentence = document.getElementById('customerSentence');
const cashierSentence = document.getElementById('cashierSentence');
const customerChoices = document.getElementById('customerChoices');
const cashierChoices = document.getElementById('cashierChoices');
const customerActions = document.getElementById('customerActions');
const confirmCustomer = document.getElementById('confirmCustomer');
const changeCustomer = document.getElementById('changeCustomer');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');

setTimeout(()=> startBtn.classList.remove('hidden'), 1300);
startBtn.addEventListener('click', startGame);
document.getElementById('playAgain').addEventListener('click', () => location.reload());
confirmCustomer.addEventListener('click', lockCustomerChoice);
changeCustomer.addEventListener('click', () => { customerLocked=false; selected=[]; renderStep(); });

function showScreen(name){ Object.values(screens).forEach(s=>s.classList.remove('active')); screens[name].classList.add('active'); }
function startGame(){ showScreen('game'); currentStep=0; order={}; renderProgress(); renderStep(); }

function renderProgress(){
  progressBar.innerHTML = '';
  [...steps.map(s=>s.title),'Payment'].forEach((title,i)=>{
    const pill = document.createElement('div');
    pill.className = 'step-pill';
    if(i < currentStep) pill.classList.add('done');
    if(i === currentStep) pill.classList.add('active');
    pill.textContent = i < currentStep ? `✓ ${title}` : title;
    progressBar.appendChild(pill);
  });
}

function renderStep(){
  const step = steps[currentStep];
  selected=[]; customerLocked=false;
  cashierSentence.textContent = step.cashier;
  customerSentence.textContent = step.blank;
  customerActions.classList.add('hidden');
  cashierChoices.classList.add('locked');
  statusText.textContent = 'Customer chooses first.';
  renderCustomerChoices(step);
  renderCashierChoices(step);
  renderProgress();
}

function getOptions(step){ return catalog[step.key]; }
function renderCustomerChoices(step){
  customerChoices.innerHTML='';
  getOptions(step).forEach(opt=>{
    const btn = document.createElement('button');
    btn.className='word-choice';
    btn.textContent = opt.label;
    btn.onclick=()=>chooseCustomer(opt, btn);
    customerChoices.appendChild(btn);
  });
}
function renderCashierChoices(step){
  cashierChoices.innerHTML='';
  getOptions(step).forEach(opt=>{
    const btn = document.createElement('button');
    btn.className='image-choice';
    btn.dataset.id = opt.id;
    if(opt.img){ btn.innerHTML = `<img src="${opt.img}" alt="${opt.label}"><span>${opt.label}</span>`; }
    else { btn.innerHTML = `<div style="font-size:3.2rem">${opt.emoji}</div><span>${opt.label}</span>`; }
    btn.onclick=()=>checkCashier(btn, opt);
    cashierChoices.appendChild(btn);
  });
}

function chooseCustomer(opt, btn){
  if(customerLocked) return;
  const step = steps[currentStep];
  const exists = selected.find(o=>o.id===opt.id);
  if(exists){ selected = selected.filter(o=>o.id!==opt.id); btn.classList.remove('selected'); }
  else {
    if(selected.length >= step.selectMax){
      if(step.selectMax === 1){ selected=[]; [...customerChoices.children].forEach(b=>b.classList.remove('selected')); }
      else return pulseStatus(`Choose only ${step.selectMax} toppings.`);
    }
    selected.push(opt); btn.classList.add('selected');
  }
  if(selected.length){ animateCustomerSentence(); customerActions.classList.remove('hidden'); }
  else { customerSentence.textContent = step.blank; customerActions.classList.add('hidden'); }
}

function animateCustomerSentence(){
  const step = steps[currentStep];
  const labels = selected.map(o=>o.label);
  const full = step.selectMax === 1 ? step.template(labels[0]) : (labels.length === 2 ? step.template(labels) : step.blank);
  typeText(customerSentence, full);
}
function typeText(el, text){
  typingToken++; const token = typingToken; el.textContent=''; let i=0;
  const timer = setInterval(()=>{
    if(token !== typingToken) return clearInterval(timer);
    el.textContent = text.slice(0, i++);
    if(i > text.length) clearInterval(timer);
  }, 22);
}
function lockCustomerChoice(){
  const step = steps[currentStep];
  if(selected.length !== step.selectMax) return pulseStatus(step.key==='toppings'?'Choose two toppings first.':'Choose one answer first.');
  customerLocked = true;
  cashierChoices.classList.remove('locked');
  statusText.textContent = 'Cashier chooses the matching picture.';
  customerActions.classList.add('hidden');
}
function checkCashier(btn,opt){
  const correctIds = selected.map(o=>o.id);
  const step = steps[currentStep];
  if(step.selectMax === 1){
    if(opt.id === correctIds[0]) correctCashier(btn); else wrongCashier(btn);
  } else {
    if(correctIds.includes(opt.id) && !btn.classList.contains('correct')){
      btn.classList.add('correct');
      const correctCount = cashierChoices.querySelectorAll('.correct').length;
      if(correctCount === step.selectMax) setTimeout(nextStep, 800);
    } else wrongCashier(btn);
  }
}
function correctCashier(btn){ btn.classList.add('correct'); setTimeout(nextStep, 700); }
function wrongCashier(btn){ btn.classList.remove('wrong'); void btn.offsetWidth; btn.classList.add('wrong'); statusText.textContent='Try again. Listen to the customer sentence.'; }
function nextStep(){
  const step = steps[currentStep];
  order[step.key] = step.selectMax === 1 ? selected[0] : [...selected];
  currentStep++;
  if(currentStep >= steps.length) return showSummaryDialogue();
  renderStep();
}
function showSummaryDialogue(){
  renderProgress();
  const toppings = order.toppings.map(t=>t.label).join(' and ');
  cashierSentence.textContent = `Great! Let's check: One ${order.size.label.toLowerCase()} ${order.flavor.label.toLowerCase()} with ${toppings}, ${order.ice.label} ice, and ${order.sugar.label} sugar. That is ${calculateTotal()} NTD, please.`;
  customerSentence.textContent = 'Here you go. Thank you!';
  customerChoices.innerHTML = '<button class="word-choice selected">Pay and Finish</button>';
  cashierChoices.innerHTML = '';
  customerActions.classList.remove('hidden');
  confirmCustomer.textContent = '✓ Pay';
  changeCustomer.textContent = '✕ Review';
  statusText.textContent = 'Customer pays for the order.';
  confirmCustomer.onclick = showFinal;
  changeCustomer.onclick = () => { currentStep=0; order={}; confirmCustomer.textContent='✓ Confirm'; confirmCustomer.onclick=lockCustomerChoice; renderStep(); };
}
function calculateTotal(){
  return order.size.price + (order.flavor.price || 0) + order.toppings.reduce((sum,t)=>sum+t.price,0);
}
function showFinal(){
  showScreen('final');
  document.getElementById('finalCup').src = assets.cups[order.size.id];
  document.getElementById('drinkFill').style.background = `linear-gradient(180deg, ${order.flavor.color}, #fff3d7)`;
  buildIce(); buildToppings(); buildReceipt(); makeConfetti();
}
function buildIce(){
  const layer = document.getElementById('iceLayer'); layer.innerHTML='';
  const counts = { ice100:8, ice50:5, ice30:3, ice0:0 };
  for(let i=0;i<(counts[order.ice.id]||0);i++){
    const cube=document.createElement('span'); cube.className='ice-cube';
    cube.style.left = `${30 + Math.random()*120}px`; cube.style.top = `${35 + Math.random()*115}px`; cube.style.animationDelay = `${1.4 + i*.09}s`;
    layer.appendChild(cube);
  }
}
function buildToppings(){
  const layer = document.getElementById('toppingLayer'); layer.innerHTML='';
  order.toppings.forEach((t,i)=>{
    const piece=document.createElement('span'); piece.className='top-piece'; piece.textContent=t.emoji;
    piece.style.left = `${55 + i*70}px`; piece.style.top = `${80 + i*28}px`; piece.style.animationDelay = `${2 + i*.2}s`;
    layer.appendChild(piece);
  });
}
function buildReceipt(){
  const lines = document.getElementById('receiptLines');
  const rows = [
    ['Flavor', order.flavor.label], ['Size', order.size.label], ['Ice', order.ice.label], ['Sugar', order.sugar.label],
    ['Topping 1', order.toppings[0].label], ['Topping 2', order.toppings[1].label], ['Total', `${calculateTotal()} NTD`]
  ];
  lines.innerHTML = rows.map(([a,b],i)=>`<div class="receipt-row ${i===rows.length-1?'total-row':''}"><span>${a}</span><span>${b}</span></div>`).join('');
}
function makeConfetti(){
  const confetti = document.getElementById('confetti'); confetti.innerHTML='';
  const bits = ['🧋','✨','🎉','🍮','🧊','💛'];
  for(let i=0;i<42;i++){
    const s=document.createElement('span'); s.textContent=bits[i%bits.length];
    s.style.left = `${Math.random()*100}%`; s.style.animationDelay = `${Math.random()*2.5}s`; s.style.animationDuration = `${2.5+Math.random()*2}s`;
    confetti.appendChild(s);
  }
}
function pulseStatus(text){ statusText.textContent=text; statusText.animate([{transform:'translateX(-50%) scale(1)'},{transform:'translateX(-50%) scale(1.08)'},{transform:'translateX(-50%) scale(1)'}],{duration:350}); }
