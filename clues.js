function hsv(r,g,b){r/=255;g/=255;b/=255;const m=Math.max(r,g,b),n=Math.min(r,g,b),d=m-n;let h=0;if(d){if(m===r)h=((g-b)/d)%6;else if(m===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return{h,s:m?d/m:0,v:m}}
function median(a){if(!a.length)return 255;const b=a.slice().sort((x,y)=>x-y);return b[b.length>>1]}
function otsu(vals){const h=new Array(256).fill(0);for(const v of vals)h[Math.max(0,Math.min(255,v|0))]++;const n=vals.length;let sum=0;for(let i=0;i<256;i++)sum+=i*h[i];let wB=0,sumB=0,best=0,thr=80;for(let t=0;t<256;t++){wB+=h[t];if(!wB)continue;const wF=n-wB;if(!wF)break;sumB+=t*h[t];const mB=sumB/wB,mF=(sum-sumB)/wF,sc=wB*wF*(mB-mF)*(mB-mF);if(sc>best){best=sc;thr=t}}return thr}
function renderCrack(){
if(!state.cedition)state.cedition="bedrock";if(!state.tol||state.tol<32)state.tol=128;if(!state.known.length)state.known=[{id:"village",x:0,z:0}];
if(!state.slimes)state.slimes=[{cx:0,cz:0}];
const je=state.cedition==="java";
view.innerHTML=`<h2>From clues</h2>
<p class="lead">${je?"Java seed hunt uses slime chunks and an optional floor pattern. It searches 32-bit Java seeds. Full 64-bit space is too large.":"Type block coords from anywhere inside a village. The search allows a wide miss so you do not need the exact meeting point."}</p>
<div class="card row"><button class="${je?"secondary":""}" id="ceBE">Bedrock world</button><button class="${je?"":"secondary"}" id="ceJE">Java world</button></div>
${je?`<div class="card"><h3>Java slime chunks you know</h3>
<p class="note">Enter chunk X/Z that spawn slimes. More chunks = fewer fake seeds.</p>
<div id="slimes"></div>
<button class="secondary" id="adds">+ slime chunk</button>
<label class="field">Also require Java floor pattern from Photo tab at X Z
<span class="row"><input id="usePat" type="checkbox" ${state.usePat?"checked":""}> use marked pattern</span></label>
<div class="row"><label class="field">Pattern world X<input id="px0" type="number" value="${state.px0||0}"></label><label class="field">Pattern world Z<input id="pz0" type="number" value="${state.pz0||0}"></label><label class="field">Pattern Y<input id="py0" type="number" value="${state.patY||-64}"></label></div>
<div class="row"><label class="field">Seeds to try<input id="kc" type="number" value="${state.seedCount}"></label><label class="field">Workers<input id="kw" type="number" value="${state.workers}"></label><button id="kgo">Find Java seed</button><button class="danger" id="kstop">Stop</button></div>
<div id="kstats"></div>
<table><thead><tr><th>Seed</th></tr></thead><tbody id="krows"></tbody></table>
</div>`:`<div class="card"><h3>Bedrock village seed</h3>
<p class="note">Stand anywhere in the village and type those block X and Z. Keep Village selected. Add extra villages if you have more than one.</p>
<div id="known"></div>
<button class="secondary" id="addk">+ village</button>
<div class="row" style="margin-top:10px"><label class="field">How far you can be off<input id="tol" type="number" value="${state.tol}"></label><label class="field">Seeds to try<input id="kc" type="number" value="${state.seedCount}"></label><label class="field">Workers<input id="kw" type="number" value="${state.workers}"></label><button id="kgo">Find seed</button><button class="danger" id="kstop">Stop</button></div>
<div id="kstats"></div>
<table><thead><tr><th>Seed</th></tr></thead><tbody id="krows"></tbody></table>
</div>`}`;
document.getElementById("ceBE").onclick=()=>{state.cedition="bedrock";renderCrack()};
document.getElementById("ceJE").onclick=()=>{state.cedition="java";renderCrack()};
if(je){paintSlimes();paintKResults();
document.getElementById("adds").onclick=()=>{state.slimes.push({cx:0,cz:0});paintSlimes()};
document.getElementById("kgo").onclick=()=>{state.usePat=document.getElementById("usePat").checked;state.px0=+document.getElementById("px0").value||0;state.pz0=+document.getElementById("pz0").value||0;state.patY=+document.getElementById("py0").value||-64;state.seedCount=Math.max(1,Math.min(1e9,+document.getElementById("kc").value||1));state.workers=Math.max(1,Math.min(16,+document.getElementById("kw").value||1));runJavaCrack()};
}else{paintKnown();paintKResults();
document.getElementById("addk").onclick=()=>{state.known.push({id:"village",x:0,z:0});paintKnown()};
document.getElementById("kgo").onclick=()=>{state.tol=Math.max(32,+document.getElementById("tol").value||128);state.seedCount=Math.max(1,Math.min(1e9,+document.getElementById("kc").value||1));state.workers=Math.max(1,Math.min(16,+document.getElementById("kw").value||1));runCrack()};
}
document.getElementById("kstop").onclick=stopSearch;
}
function paintSlimes(){const box=document.getElementById("slimes");if(!box)return;box.innerHTML=state.slimes.map((s,i)=>`<div class="cond" style="grid-template-columns:1fr 1fr 36px"><label class="field">Chunk X<input data-i="${i}" data-k="cx" type="number" value="${s.cx}"></label><label class="field">Chunk Z<input data-i="${i}" data-k="cz" type="number" value="${s.cz}"></label><button class="ghost" data-del="${i}">x</button></div>`).join("");box.querySelectorAll("[data-k]").forEach(el=>el.oninput=()=>{state.slimes[+el.dataset.i][el.dataset.k]=+el.value});box.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{state.slimes.splice(+b.dataset.del,1);paintSlimes()})}
