function renderCrack(){
view.innerHTML=`<h2>From clues</h2>
<p class="lead">Bedrock: enter structure positions to hunt a seed. A screenshot cannot output a base location by itself.</p>
<div class="card row"><button class="${state.edition==="bedrock"?"":"secondary"}" id="edBE">Bedrock</button><button class="${state.edition==="java"?"":"secondary"}" id="edJE">Java</button></div>
<div class="card"><h3>Seed from structures</h3>
<p class="note">${state.edition==="java"?"Java structure salts are not in this engine. Use Bedrock to search seeds from structure spots.":"Add each structure you know and its block X/Z. Random Bedrock seeds are tested until those structures sit near those spots."}</p>
<div id="known"></div>
<button class="secondary" id="addk">+ structure clue</button>
<div class="row" style="margin-top:10px"><label class="field">Tolerance<input id="tol" type="number" value="${state.tol}"></label><label class="field">Seeds to try<input id="kc" type="number" value="${state.seedCount}"></label><label class="field">Workers<input id="kw" type="number" value="${state.workers}"></label><button id="kgo" ${state.edition==="java"?"disabled":""}>Find seed</button><button class="danger" id="kstop">Stop</button></div>
<div id="kstats"></div>
<table><thead><tr><th>Seed</th></tr></thead><tbody id="krows"></tbody></table>
</div>
<div class="card java"><h3>Picture / pattern</h3>
<p class="note">Upload is only a reference image. Clouds and deepslate in a screenshot do not identify unique coordinates. Java bedrock floor matching needs the world seed plus a marked 8x8 pattern.</p>
<label class="field">Java world seed<input id="pseed" value="${state.patSeed}"></label>
<label class="field">Reference picture<input id="pic" type="file" accept="image/*"></label>
<canvas id="pcv" width="320" height="180" style="width:100%;max-width:320px;background:#0003;border-radius:8px"></canvas>
<p class="note">Click cells that are bedrock at Y -64 in Java.</p>
<div class="grid8" id="pg"></div>
<label class="field">Pattern Y<input id="py" type="number" value="${state.patY}"></label>
<button id="pgo">Search Java coords from pattern</button>
<div id="pout" class="note"></div>
</div>`;
paintKnown();paintGrid();paintKResults();
document.getElementById("edBE").onclick=()=>{state.edition="bedrock";renderCrack()};
document.getElementById("edJE").onclick=()=>{state.edition="java";renderCrack()};
document.getElementById("addk").onclick=()=>{state.known.push({id:"village",x:0,z:0});paintKnown()};
document.getElementById("kgo").onclick=()=>{state.tol=Math.max(4,+document.getElementById("tol").value||24);state.seedCount=Math.max(1,Math.min(1e9,+document.getElementById("kc").value||1));state.workers=Math.max(1,Math.min(16,+document.getElementById("kw").value||1));runCrack()};
document.getElementById("kstop").onclick=stopSearch;
document.getElementById("pseed").oninput=e=>state.patSeed=e.target.value;
document.getElementById("py").oninput=e=>state.patY=+e.target.value||-64;
document.getElementById("pic").onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const img=new Image();img.onload=()=>{const c=document.getElementById("pcv"),x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height)};img.src=URL.createObjectURL(f)};
document.getElementById("pgo").onclick=searchPattern;
}
function paintKnown(){const box=document.getElementById("known");if(!box)return;box.innerHTML=state.known.map((k,i)=>`<div class="cond" style="grid-template-columns:1fr 90px 90px 36px"><select data-i="${i}" data-k="id">${opts(k.id)}</select><input data-i="${i}" data-k="x" type="number" value="${k.x}"><input data-i="${i}" data-k="z" type="number" value="${k.z}"><button class="ghost" data-del="${i}">x</button></div>`).join("");box.querySelectorAll("[data-k]").forEach(el=>el.oninput=()=>{state.known[+el.dataset.i][el.dataset.k]=el.dataset.k==="id"?el.value:+el.value});box.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{state.known.splice(+b.dataset.del,1);paintKnown()})}
function paintGrid(){const g=document.getElementById("pg");if(!g)return;if(!state.pat)state.pat=Array(64).fill(0);g.innerHTML=state.pat.map((v,i)=>`<i class="${v?"on":""}" data-i="${i}"></i>`).join("");g.querySelectorAll("i").forEach(el=>el.onclick=()=>{state.pat[+el.dataset.i]^=1;paintGrid()})}
function paintKResults(){const stats=document.getElementById("kstats"),rows=document.getElementById("krows");if(!rows)return;if(stats&&state.stats){const tested=Math.min(state.stats.tested||0,state.stats.total||0),total=state.stats.total||0,pct=total?tested*100/total:0;stats.innerHTML=`<strong>${pct.toFixed(2)}%</strong> ${tested.toLocaleString()} / ${total.toLocaleString()} · hits ${state.stats.matched}`}
rows.innerHTML=(state.results||[]).map(r=>`<tr><td>${r.seed}</td></tr>`).join("")}
function runCrack(){stopSearch();if(state.edition!=="bedrock"||!state.known.length)return;state.running=true;state.results=[];state.stats={tested:0,matched:0,total:state.seedCount};paintKResults();const n=state.workers,per=Math.ceil(state.seedCount/n);let done=0;const live=Array(n).fill(0),liveMatch=Array(n).fill(0);const src=ENGINE+"\nonmessage=function(ev){var d=ev.data,results=[],matched=0;for(var i=0;i<d.count;i++){var s=((Math.random()*0x100000000)>>>0);if(matchKnown(s,d.known,d.tol)){matched++;results.push({seed:String(s>>>0)});if(results.length>20)results.length=20}if((i&8191)===8191)postMessage({type:'prog',wid:d.wid,tested:i+1,matched:matched,results:null})}postMessage({type:'done',wid:d.wid,tested:d.count,matched:matched,results:results})}";
for(let w=0;w<n;w++){const count=Math.max(0,Math.min(per,state.seedCount-w*per));if(!count){done++;continue}const worker=new Worker(URL.createObjectURL(new Blob([src],{type:"text/javascript"})));state.workersRef.push(worker);worker.onmessage=ev=>{const m=ev.data;if(m.results&&m.results.length){const acc=new Map(state.results.map(r=>[r.seed,r]));for(const r of m.results)acc.set(r.seed,r);state.results=[...acc.values()].slice(0,40)}if(typeof m.wid==="number"){live[m.wid]=m.tested||0;liveMatch[m.wid]=m.matched||0}if(m.type==="done"){done++;worker.terminate();if(done>=n)state.running=false}state.stats.tested=live.reduce((a,b)=>a+b,0);state.stats.matched=liveMatch.reduce((a,b)=>a+b,0);if(page==="crack")paintKResults()};worker.postMessage({wid:w,count,known:state.known,tol:state.tol})}}
function searchPattern(){const out=document.getElementById("pout");const seed=parseSeed(state.patSeed||"0").seed;const y=state.patY||-64;if(!state.pat||!state.pat.some(v=>v)){out.textContent="Mark bedrock cells first.";return}const hits=[];const span=64;for(let ox=-span;ox<=span;ox++){for(let oz=-span;oz<=span;oz++){let ok=1;for(let i=0;i<64&&ok;i++){const px=ox+(i%8),pz=oz+(i/8|0);if(javaBedrockFloor(seed,px,y,pz)!==!!state.pat[i])ok=0}if(ok)hits.push({x:ox,z:oz});if(hits.length>=6)break}if(hits.length>=6)break}
out.textContent=hits.length?("Java matches: "+hits.map(h=>h.x+", "+y+", "+h.z).join(" · ")):"No Java match in ±64 of 0,0 for that seed and pattern."}
