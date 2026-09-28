const TEST=document.body.dataset.test;
const cfg=TEST==="TOLI"
?{title:"TOLI 학습유형검사",subtitle:"자신의 학습유형과 학습 과정에서 나타나는 다양한 특성을 살펴보는 검사입니다.",items:"../toli-items.json",scale:[["1","전혀 아니다"],["2","아니다"],["3","그렇다"],["4","매우 그렇다"]],primary:"#EC6B8C",primary2:"#F6A26B",soft:"#FFF0F4"}
:{title:"BFI 성격5요인검사",subtitle:"자신의 성격 특성과 정서·적응 관련 특징을 살펴보는 검사입니다.",items:"../bfi-items.json",scale:[["1","전혀 아니다"],["2","다소 아니다"],["3","중간이다"],["4","조금 그렇다"],["5","매우 그렇다"]],primary:"#3F8F5B",primary2:"#78B77A",soft:"#ECF7EF"};
const SUPABASE_URL="https://eoieiribkthxlibgttco.supabase.co";
const SUPABASE_KEY="sb_publishable_TE6OnQm_G35ah-yThH_RbA_U0PXph5P";
const app=document.getElementById("app");
let ITEMS=[],answers=[],page=0,submitting=false;
const pageSize=20;
function q(id){return document.getElementById(id)}
function shell(){
 app.className="assessment";
 app.style.setProperty("--primary",cfg.primary);app.style.setProperty("--primary2",cfg.primary2);app.style.setProperty("--soft",cfg.soft);
 app.innerHTML=`
 <section class="hero" id="hero"><div class="badges"><span>입암초등학교</span><span>6학년</span><span>${cfg.title}</span></div><h1>입암초등학교 6학년 ${cfg.title}</h1><p>${cfg.subtitle}<br>문항을 천천히 읽고 평소의 나와 가장 가까운 답을 선택해 주세요.</p></section>
 <section class="card" id="intro"><h2>검사 시작 전 학생 정보를 입력해 주세요.</h2><p class="muted">학교와 학년은 고정되어 있으며, 반·번호·이름·성별을 모두 입력해야 검사를 시작할 수 있습니다.</p>
 <div class="meta"><label>학교<input value="입암초등학교" readonly></label><label>학년<input value="6학년" readonly></label><label>반<input id="cls" inputmode="numeric"></label><label>번호<input id="num" inputmode="numeric"></label><label>이름<input id="name"></label><label>성별<select id="gender"><option value="">선택</option><option>남</option><option>여</option></select></label></div>
 <div class="count" id="count"></div><div class="right"><button class="primary" id="startBtn">검사 시작</button></div></section>
 <section class="card" id="exam" hidden><div class="sticky"><h2 id="title"></h2><div class="scale" id="scale"></div><div class="progress"><div id="bar"></div></div><div class="count" id="progressText"></div></div><div id="questions"></div><div class="nav"><button class="secondary" id="prevBtn">이전</button><button class="primary" id="nextBtn">다음</button></div><div class="status" id="status"></div></section>
 <section class="card done" id="done" hidden><div class="doneIcon">✓</div><h2>검사가 제출되었습니다.</h2><p class="muted">응답이 정상적으로 저장되었습니다. 창을 닫아도 됩니다.</p></section>`;
 q("startBtn").onclick=startExam;q("prevBtn").onclick=prevPage;q("nextBtn").onclick=nextPage;
}
async function load(){
 shell();
 try{const r=await fetch(cfg.items,{cache:"no-store"});if(!r.ok)throw new Error();ITEMS=await r.json();answers=Array(ITEMS.length).fill(null);q("count").textContent="총 "+ITEMS.length+"문항 · 모든 문항 필수 응답";}
 catch(e){q("intro").innerHTML="<h2>검사 문항을 불러오지 못했습니다.</h2><p class='error'>잠시 후 다시 접속해 주세요.</p>";}
}
function startExam(){
 for(const id of["cls","num","name","gender"]){if(!q(id).value.trim()){alert("반, 번호, 이름, 성별을 모두 입력해 주세요.");q(id).focus();return}}
 q("hero").hidden=true;q("intro").hidden=true;q("exam").hidden=false;render();
}
function render(){
 const s=page*pageSize,e=Math.min(s+pageSize,ITEMS.length),tp=Math.ceil(ITEMS.length/pageSize);
 q("title").textContent=cfg.title+" · "+(s+1)+"~"+e+"번";q("scale").textContent=cfg.scale.map(x=>x[0]+" "+x[1]).join("　");q("bar").style.width=(e/ITEMS.length*100)+"%";q("progressText").textContent=e+" / "+ITEMS.length+" 문항";
 q("questions").innerHTML=ITEMS.slice(s,e).map((item,j)=>{const i=s+j;return `<div class="q"><div class="qtext"><span class="qnum">${i+1}</span>${item}</div><div class="opts">${cfg.scale.map(([v,t])=>`<label class="opt"><input type="radio" name="q_${i}" value="${v}" ${answers[i]===v?"checked":""}><span>${v} ${t}</span></label>`).join("")}</div></div>`}).join("");
 q("questions").querySelectorAll("input[type=radio]").forEach(el=>el.onchange=()=>{const i=Number(el.name.split("_")[1]);answers[i]=el.value});
 q("prevBtn").disabled=page===0;q("nextBtn").textContent=page===tp-1?"제출":"다음";window.scrollTo({top:0,behavior:"smooth"});
}
function validPage(){const s=page*pageSize,e=Math.min(s+pageSize,ITEMS.length);for(let i=s;i<e;i++)if(answers[i]==null){alert((i+1)+"번 문항에 응답해 주세요.");return false}return true}
function prevPage(){if(page>0){page--;render()}}
async function nextPage(){if(!validPage())return;const tp=Math.ceil(ITEMS.length/pageSize);if(page<tp-1){page++;render();return}await submit()}
async function submit(){
 if(submitting)return;submitting=true;q("nextBtn").disabled=true;q("nextBtn").textContent="제출 중...";q("status").textContent="응답을 안전하게 제출하고 있습니다.";
 const payload={school:"입암초등학교",grade:"6",class_no:q("cls").value.trim(),student_no:q("num").value.trim(),student_name:q("name").value.trim(),gender:q("gender").value,test_type:TEST,answers,user_agent:navigator.userAgent};
 try{const r=await fetch(SUPABASE_URL+"/rest/v1/assessment_responses",{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(payload)});if(!r.ok)throw new Error("HTTP "+r.status);q("exam").hidden=true;q("done").hidden=false;window.scrollTo({top:0,behavior:"smooth"});}
 catch(e){submitting=false;q("nextBtn").disabled=false;q("nextBtn").textContent="제출";q("status").innerHTML="<span class='error'>제출에 실패했습니다. 인터넷 연결을 확인한 뒤 다시 제출해 주세요.</span>";}
}
load();