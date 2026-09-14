function renderCrack(){
view.innerHTML=`<h2>From clues</h2>
<p class="lead">Bedrock seed hunt uses structure spots. Photo tools read the picture into a block grid. They still cannot name a base from clouds or deepslate alone.</p>
<div class="card row"><button class="${state.edition==="bedrock"?"":"secondary"}" id="edBE">Bedrock</button><button class="${state.edition==="java"?"":"secondary"}" id="edJE">Java</button></div>
<div class="card"><h3>Seed from structures</h3>
<p class="note">${state.edition==="java"?"Java structure salts are not in this engine.":"Add known structure X/Z, then hunt random Bedrock seeds."}</p>
<div id="known"></div>
<button class="secondary" id="addk">+ structure clue</button>
<div class="row" style="margin-top:10px"><label class="field">Tolerance<input id="tol" type="number" value="${state.tol}"></label><label class="field">Seeds to try<input id="kc" type="number" value="${state.seedCount}"></label><label class="field">Workers<input id="kw" type="number" value="${state.workers}"></label><button id="kgo" ${state.edition==="java"?"disabled":""}>Find seed</button><button class="danger" id="kstop">Stop</button></div>
<div id="kstats"></div>
<table><thead><tr><th>Seed</th></tr></thead><tbody id="krows"></tbody></table>
</div>
<div class="card java"><h3>Photo analysis</h3>
<p class="note">The reader looks at how dark each cell is. Bedrock is usually the darkest blocks. Java coord search still needs the world seed.</p>
<label class="field">Java world seed<input id="pseed" value="${state.patSeed||"0"}"></label>
<label class="field">Photo<input id="pic" type="file" accept="image/*"></label>
<canvas id="pcv" width="480" height="320" style="width:100%;max-width:480px;background:#0003;border-radius:8px"></canvas>
<div class="row">
<label class="field">Grid<input id="gsz" type="number" min="4" max="16" value="${state.gridN||8}"></label>
<label class="field">Darkness 0-255<input id="thr" type="number" min="8" max="180" value="${state.thr||70}"></label>
<label class="field">Pattern Y<input id="py" type="number" value="${state.patY||-64}"></label>
</div>
<div class="row">
<button id="pan">Read photo</button>
<button class="secondary" id="pinv">Invert</button>
<button class="secondary" id="pclr">Clear</button>
<button id="pgo">Search Java coords</button>
</div>
<p class="note" id="pread">No photo read yet.</p>
<div class="grid8" id="pg" style="margin-top:8px"></div>
<div id="pout" class="note"></div>
</div>`;
if(!state.gridN)state.gridN=8;
if(state.thr==null)state.thr=70;
paintKnown();paintGrid();paintKResults();
document.getElementById("edBE").onclick=()=>{state.edition="bedrock";renderCrack()};
document.getElementById("edJE").onclick=()=>{state.edition="java";renderCrack()};
document.getElementById("addk").onclick=()=>{state.known.push({id:"village",x:0,z:0});paintKnown()};
document.getElementById("kgo").onclick=()=>{state.tol=Math.max(4,+document.getElementById("tol").value||24);state.seedCount=Math.max(1,Math.min(1e9,+document.getElementById("kc").value||1));state.workers=Math.max(1,Math.min(16,+document.getElementById("kw").value||1));runCrack()};
document.getElementById("kstop").onclick=stopSearch;
document.getElementById("pseed").oninput=e=>state.patSeed=e.target.value;
document.getElementById("py").oninput=e=>state.patY=+e.target.value||-64;
document.getElementById("gsz").oninput=e=>{state.gridN=Math.max(4,Math.min(16,+e.target.value||8));state.pat=Array(state.gridN*state.gridN).fill(0);paintGrid()};
document.getElementById("thr").oninput=e=>state.thr=+e.target.value||70;
document.getElementById("pic").onchange=onPhoto;
document.getElementById("pan").onclick=analyzePhoto;
document.getElementById("pinv").onclick=()=>{if(state.pat)state.pat=state.pat.map(v=>v?0:1);paintGrid()};
document.getElementById("pclr").onclick=()=>{state.pat=Array((state.gridN||8)**2).fill(0);paintGrid();document.getElementById("pread").textContent="Grid cleared."};
document.getElementById("pgo").onclick=searchPattern;
}
function onPhoto(e){
const f=e.target.files&&e.target.files[0];if(!f)return;
const img=new Image();
img.onload=()=>{state.photo=img;drawPhoto();analyzePhoto()};
img.src=URL.createObjectURL(f);
}
function drawPhoto(){
const c=document.getElementById("pcv");if(!c||!state.photo)return;
const x=c.getContext("2d"),n=state.gridN||8;
x.clearRect(0,0,c.width,c.height);
const img=state.photo,iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
const sc=Math.min(c.width/iw,c.height/ih),w=iw*sc,h=ih*sc,ox=(c.width-w)/2,oy=(c.height-h)/2;
state.photoBox={ox,oy,w,h};
x.drawImage(img,ox,oy,w,h);
x.strokeStyle="rgba(62,224,195,.55)";
for(let i=0;i<=n;i++){
x.beginPath();x.moveTo(ox,oy+h*i/n);x.lineTo(ox+w,oy+h*i/n);x.stroke();
x.beginPath();x.moveTo(ox+w*i/n,oy);x.lineTo(ox+w*i/n,oy+h);x.stroke();
}
}
function analyzePhoto(){
const c=document.getElementById("pcv");if(!c||!state.photo){const e=document.getElementById("pread");if(e)e.textContent="Upload a photo first.";return}
drawPhoto();
const x=c.getContext("2d"),n=state.gridN||8,thr=state.thr||70,box=state.photoBox;
const data=x.getImageData(0,0,c.width,c.height).data;
state.pat=Array(n*n).fill(0);
let dark=0,bright=0,sum=0;
for(let gz=0;gz<n;gz++)for(let gx=0;gx<n;gx++){
const x0=box.ox+box.w*(gx+.25)/n,y0=box.oy+box.h*(gz+.25)/n,x1=box.ox+box.w*(gx+.75)/n,y1=box.oy+box.h*(gz+.75)/n;
let s=0,cnt=0;
for(let py=y0|0;py<y1;py++)for(let px=x0|0;px<x1;px++){
if(px<0||py<0||px>=c.width||py>=c.height)continue;
const i=(py*c.width+px)*4,r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
if(a<20)continue;
s+=(r+g+b)/3;cnt++;
}
const avg=cnt?s/cnt:255;sum+=avg;
const isDark=avg<=thr;
state.pat[gz*n+gx]=isDark?1:0;
if(isDark)dark++;else bright++;
}
paintGrid();
const e=document.getElementById("pread");
if(e)e.textContent=`Read ${n}x${n}. Dark cells ${dark}, bright ${bright}, average light ${Math.round(sum/(n*n))}. Dark = marked bedrock. Move Darkness if the grid looks wrong.`;
}
function paintKnown(){const box=document.getElementById("known");if(!box)return;box.innerHTML=state.known.map((k,i)=>`<div class="cond" style="grid-template-columns:1fr 90px 90px 36px"><select data-i="${i}" data-k="id">${opts(k.id)}</select><input data-i="${i}" data-k="x" type="number" value="${k.x}"><input data-i="${i}" data-k="z" type="number" value="${k.z}"><button class="ghost" data-del="${i}">x</button></div>`).join("");box.querySelectorAll("[data-k]").forEach(el=>el.oninput=()=>{state.known[+el.dataset.i][el.dataset.k]=el.dataset.k==="id"?el.value:+el.value});box.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{state.known.splice(+b.dataset.del,1);paintKnown()})}
function paintGrid(){const g=document.getElementById("pg");if(!g)return;const n=state.gridN||8;if(!state.pat||state.pat.length!==n*n)state.pat=Array(n*n).fill(0);g.style.gridTemplateColumns=`repeat(${n},18px)`;g.innerHTML=state.pat.map((v,i)=>`<i class="${v?"on":""}" data-i="${i}"></i>`).join("");g.querySelectorAll("i").forEach(el=>el.onclick=()=>{state.pat[+el.dataset.i]^=1;paintGrid()})}
function paintKResults(){const stats=document.getElementById("kstats"),rows=document.getElementById("krows");if(!rows)return;if(stats&&state.stats){const tested=Math.min(state.stats.tested||0,state.stats.total||0),total=state.stats.total||0,pct=total?tested*100/total:0;stats.innerHTML=`<strong>${pct.toFixed(2)}%</strong> ${tested.toLocaleString()} / ${total.toLocaleString()} · hits ${state.stats.matched}`}
rows.innerHTML=(state.results||[]).map(r=>`<tr><td>${r.seed}</td></tr>`).join("")}
function runCrack(){stopSearch();if(state.edition!=="bedrock"||!state.known.length)return;state.running=true;state.results=[];state.stats={tested:0,matched:0,total:state.seedCount};paintKResults();const n=state.workers,per=Math.ceil(state.seedCount/n);let done=0;const live=Array(n).fill(0),liveMatch=Array(n).fill(0);const src=ENGINE+"\nonmessage=function(ev){var d=ev.data,results=[],matched=0;for(var i=0;i<d.count;i++){var s=((Math.random()*0x100000000)>>>0);if(matchKnown(s,d.known,d.tol)){matched++;results.push({seed:String(s>>>0)});if(results.length>20)results.length=20}if((i&8191)===8191)postMessage({type:'prog',wid:d.wid,tested:i+1,matched:matched,results:null})}postMessage({type:'done',wid:d.wid,tested:d.count,matched:matched,results:results})}";
for(let w=0;w<n;w++){const count=Math.max(0,Math.min(per,state.seedCount-w*per));if(!count){done++;continue}const worker=new Worker(URL.createObjectURL(new Blob([src],{type:"text/javascript"})));state.workersRef.push(worker);worker.onmessage=ev=>{const m=ev.data;if(m.results&&m.results.length){const acc=new Map(state.results.map(r=>[r.seed,r]));for(const r of m.results)acc.set(r.seed,r);state.results=[...acc.values()].slice(0,40)}if(typeof m.wid==="number"){live[m.wid]=m.tested||0;liveMatch[m.wid]=m.matched||0}if(m.type==="done"){done++;worker.terminate();if(done>=n)state.running=false}state.stats.tested=live.reduce((a,b)=>a+b,0);state.stats.matched=liveMatch.reduce((a,b)=>a+b,0);if(page==="crack")paintKResults()};worker.postMessage({wid:w,count,known:state.known,tol:state.tol})}}
function searchPattern(){const out=document.getElementById("pout");const seed=parseSeed(state.patSeed||"0").seed;const y=state.patY||-64;const n=state.gridN||8;if(!state.pat||!state.pat.some(v=>v)){out.textContent="Read a photo or mark cells first.";return}const hits=[];const span=48;for(let ox=-span;ox<=span;ox++){for(let oz=-span;oz<=span;oz++){let ok=1;for(let i=0;i<n*n&&ok;i++){const px=ox+(i%n),pz=oz+(i/n|0);if(javaBedrockFloor(seed,px,y,pz)!==!!state.pat[i])ok=0}if(ok)hits.push({x:ox,z:oz});if(hits.length>=8)break}if(hits.length>=8)break}
out.textContent=hits.length?("Java matches: "+hits.map(h=>h.x+", "+y+", "+h.z).join(" · ")):"No Java match in ±48 of 0,0 for that seed and pattern. Change seed, Y, or Darkness."}
