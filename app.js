const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const today = () => new Date().toISOString().slice(0,10);
const starterSuggestions = [
 {id:"study",title:"Focused university study",detail:"Study one topic for 45 minutes",xp:50,stat:"Intelligence"},
 {id:"move",title:"Move your body",detail:"A safe workout or 20-minute walk",xp:40,stat:"Strength"},
 {id:"routine",title:"Protect your sleep routine",detail:"Set a realistic wind-down time",xp:30,stat:"Vitality"},
 {id:"discipline",title:"Complete one avoided task",detail:"Pick a small task and finish it",xp:35,stat:"Discipline"},
 {id:"social",title:"Confidence side quest",detail:"Have one friendly conversation or practise a skill",xp:30,stat:"Social Confidence"}
];
const defaultState = () => ({
 name:"PLAYER",difficulty:"Hunter",focus:["University & studying","Fitness","Discipline & habits","Sleep & daily routine","Confidence & social skills"],
 xp:0,level:1,streak:0,lastCompleteDate:"",lastDay:today(),quests:[],suggestions:starterSuggestions.map(q=>({...q,selected:true})),
 cleared:0,missed:0,recoveries:0,screenTarget:120,screenMinutes:0,screenLogDate:today(),bossClaimed:false,bossChecks:[false,false,false,false,false],history:[]
});
let state;
try { state = {...defaultState(), ...JSON.parse(localStorage.getItem("soloSystemState")||"{}")}; } catch { state=defaultState(); }
function save(){localStorage.setItem("soloSystemState",JSON.stringify(state));render();}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400);}
function xpNeeded(level=state.level){return level*500;}
function addXP(n){state.xp+=n;while(state.xp>=xpNeeded()){state.xp-=xpNeeded();state.level++;toast("LEVEL UP! You reached level "+state.level);} }
function dayRollover(){
 const t=today(); if(state.lastDay===t)return;
 const old=state.lastDay;
 state.quests.forEach(q=>{if(q.date===old&&q.status==="active"){q.status="missed";state.missed++;}});
 state.lastDay=t; state.screenMinutes=0;state.screenLogDate=t;state.bossClaimed=state.bossClaimed||false;
 state.suggestions=makeSuggestions(); save();
}
function makeSuggestions(){
 const pool=starterSuggestions.filter(q=>state.focus.some(f=>({Intelligence:"University & studying",Strength:"Fitness",Vitality:"Sleep & daily routine",Discipline:"Discipline & habits","Social Confidence":"Confidence & social skills"})[q.stat]===f));
 return (pool.length?pool:starterSuggestions).map(q=>({...q,id:q.id+"-"+Math.random().toString(36).slice(2,7),selected:true}));
}
function render(){
 $("#playerName").textContent=(state.name||"PLAYER").toUpperCase();
 $("#levelLabel").textContent="LV. "+state.level;$("#statsLevel").textContent=state.level;
 $("#xpLabel").textContent=state.xp+" / "+xpNeeded()+" XP";$("#xpPercent").textContent=Math.round(state.xp/xpNeeded()*100)+"%";
 $("#xpBar").style.width=Math.min(100,state.xp/xpNeeded()*100)+"%";
 $("#totalXpLabel").textContent=state.history.reduce((a,h)=>a+h.xp,0)+state.xp+(state.level-1)*500;
 $("#streakLabel").textContent=state.streak;$("#statsStreak").textContent=state.streak+" days";
 const sug=$("#suggestions");sug.innerHTML="";
 state.suggestions.forEach(q=>{const row=document.createElement("div");row.className="quest-item";row.innerHTML=`<input type="checkbox" ${q.selected?"checked":""} aria-label="Select ${q.title}"><div class="quest-main"><div class="quest-title">${esc(q.title)}</div><div class="quest-meta">${esc(q.detail)}</div></div><span class="xp">+${q.xp} XP</span>`;row.querySelector("input").onchange=e=>{q.selected=e.target.checked;save()};sug.append(row);});
 const active=state.quests.filter(q=>q.date===today()&&q.status==="active");const done=state.quests.filter(q=>q.date===today()&&q.status==="done");
 $("#questCount").textContent=done.length+" / "+(active.length+done.length);
 $("#activeQuests").innerHTML="";$("#emptyActive").classList.toggle("hidden",active.length>0);
 active.forEach(q=>{const row=document.createElement("div");row.className="quest-item";row.innerHTML=`<div class="quest-main"><div class="quest-title">${esc(q.title)}</div><div class="quest-meta">${esc(q.detail)}</div><div class="quest-actions"><button class="tiny-button complete">✓ Complete</button><button class="tiny-button skip">Missed / skip</button></div></div><span class="xp">+${q.xp} XP</span>`;row.querySelector(".complete").onclick=()=>complete(q.id);row.querySelector(".skip").onclick=()=>miss(q.id);$("#activeQuests").append(row);});
 const missed=state.quests.filter(q=>q.status==="missed");$("#missedPanel").classList.toggle("hidden",!missed.length);$("#missedQuests").innerHTML="";
 missed.forEach(q=>{const row=document.createElement("div");row.className="quest-item";row.innerHTML=`<div class="quest-main"><div class="quest-title">${esc(q.title)}</div><div class="quest-meta">No XP awarded · choose a recovery or valid exception</div><div class="quest-actions"><button class="tiny-button recover">Recovery mission</button><button class="tiny-button excuse">Valid exception</button></div></div>`;row.querySelector(".recover").onclick=()=>{q.status="recovered";state.recoveries++;state.quests.push({id:"recovery-"+Date.now(),title:"Recovery: "+q.title,detail:"Do a smaller 10–20 minute version",xp:20,stat:q.stat,date:today(),status:"active"});save();toast("Recovery mission added.");};row.querySelector(".excuse").onclick=()=>{q.status="excused";toast("Exception recorded. No penalty.");save()};$("#missedQuests").append(row);});
 const stats={"Strength":0,"Intelligence":0,"Discipline":0,"Vitality":0,"Social Confidence":0};state.history.forEach(h=>{if(stats[h.stat]!==undefined)stats[h.stat]+=h.xp});state.quests.filter(q=>q.status==="done").forEach(q=>{if(stats[q.stat]!==undefined)stats[q.stat]+=q.xp});
 const max=Math.max(100,...Object.values(stats));$("#statRows").innerHTML="";Object.entries(stats).forEach(([name,val])=>{const row=document.createElement("div");row.innerHTML=`<div class="stat-head"><span>${name}</span><span>${Math.min(100,Math.round(val/max*100))}/100</span></div><div class="stat-track"><div class="stat-fill" style="width:${Math.min(100,val/max*100)}%"></div></div>`;$("#statRows").append(row);});
 $("#clearedCount").textContent=state.cleared;$("#completionRate").textContent=(state.cleared+state.missed?Math.round(state.cleared/(state.cleared+state.missed)*100):0)+"%";$("#recoveryCount").textContent=state.recoveries;
 $("#bossGoals").innerHTML="";["Complete 5 quests this week","Move your body 3 times","Study for 3 focused hours","Keep a consistent sleep routine","Complete one confidence side quest"].forEach((g,i)=>{const row=document.createElement("label");row.className="boss-goal";row.innerHTML=`<input type="checkbox" ${state.bossChecks[i]?"checked":""}><span>${g}</span>`;row.querySelector("input").onchange=e=>{state.bossChecks[i]=e.target.checked;save()};$("#bossGoals").append(row);});
 const bossDone=state.bossChecks.every(Boolean);$("#claimBoss").disabled=!bossDone||state.bossClaimed;$("#claimBoss").textContent=state.bossClaimed?"BOSS REWARD CLAIMED":bossDone?"CLAIM BOSS REWARD":"COMPLETE ALL OBJECTIVES";
 $("#nameInput").value=state.name==="PLAYER"?"":state.name;$("#difficultyInput").value=state.difficulty;$("#screenTarget").value=state.screenTarget;
 [...$("#focusInput").options].forEach(o=>o.selected=state.focus.includes(o.value));
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function complete(id){const q=state.quests.find(x=>x.id===id);if(!q||q.status!=="active")return;q.status="done";q.completedAt=new Date().toISOString();state.cleared++;addXP(q.xp);state.history.push({xp:q.xp,stat:q.stat,date:today()});if(state.lastCompleteDate!==today()){state.streak=state.lastCompleteDate===new Date(Date.now()-86400000).toISOString().slice(0,10)?state.streak+1:1;state.lastCompleteDate=today();}if(state.cleared%5===0)state.bossChecks[0]=true;save();toast("Quest cleared! +"+q.xp+" XP");}
function miss(id){const q=state.quests.find(x=>x.id===id);if(!q)return;q.status="missed";state.missed++;save();toast("Quest missed. Choose a recovery or exception.");}
$("#approveAll").onclick=()=>{const selected=state.suggestions.filter(q=>q.selected);if(!selected.length){toast("Select at least one quest first.");return;}selected.forEach(q=>state.quests.push({...q,id:"q-"+Date.now()+"-"+Math.random(),date:today(),status:"active"}));state.suggestions=state.suggestions.filter(q=>!q.selected);save();toast(selected.length+" quests approved.");};
$("#reroll").onclick=()=>{state.suggestions=makeSuggestions();save();toast("New suggestions generated.");};
$$(".tab").forEach(b=>b.onclick=()=>{ $$(".tab").forEach(t=>t.classList.toggle("active",t===b));$$(".view").forEach(v=>v.classList.toggle("active",v.id===b.dataset.tab));});
$("#settingsToggle").onclick=()=>{$$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab==="settings"));$$(".view").forEach(v=>v.classList.toggle("active",v.id==="settings"));};
$("#saveSettings").onclick=()=>{state.name=$("#nameInput").value.trim()||"PLAYER";state.difficulty=$("#difficultyInput").value;state.focus=[...$("#focusInput").selectedOptions].map(o=>o.value);state.screenTarget=Math.max(15,Math.min(600,Number($("#screenTarget").value)||120));state.suggestions=makeSuggestions();save();toast("Player settings saved.");};
$("#claimBoss").onclick=()=>{if(state.bossChecks.every(Boolean)&&!state.bossClaimed){state.bossClaimed=true;addXP(200);state.history.push({xp:200,stat:"Discipline",date:today()});save();toast("Boss defeated! +200 XP");}};
$("#screenLogButton").onclick=()=>{const val=prompt("Enter your phone's screen-time total for today (minutes):",String(state.screenMinutes));if(val===null)return;const n=Number(val);if(!Number.isFinite(n)||n<0){toast("Enter a valid number.");return;}state.screenMinutes=Math.round(n);state.screenLogDate=today();save();$("#screenLogResult").textContent="Manually logged: "+state.screenMinutes+" minutes. Target: "+state.screenTarget+" minutes.";toast(state.screenMinutes>state.screenTarget?"Target exceeded — consider a short reset break.":"Screen-time log saved.");};
$("#resetButton").onclick=()=>{if(confirm("Reset all Solo System progress stored in this browser? This cannot be undone.")){state=defaultState();save();toast("Local progress reset.");}};
dayRollover();render();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
