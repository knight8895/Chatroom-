const $=id=>document.getElementById(id);const qs=s=>document.querySelector(s);const qsa=s=>document.querySelectorAll(s);
const esc=s=>{if(!s)return'';const d=document.createElement('div');d.textContent=s;return d.innerHTML};
const sCol=s=>{let h=0;for(let i=0;i<(s||'').length;i++)h=s.charCodeAt(i)+((h<<5)-h);return`hsl(${Math.abs(h)%360},48%,38%)`};
const tAgo=t=>{const d=Date.now()-t,m=Math.floor(d/60000);if(m<1)return'now';if(m<60)return m+'m';const h=Math.floor(m/60);if(h<24)return h+'h';return Math.floor(h/24)+'d'};
const fTime=t=>t?new Date(t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
const fmtBytes=b=>{if(!b)return'0 B';const u=['B','KB','MB','GB'];const i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(i?1:0)+' '+u[i]};
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const LS={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem('fc_'+k));return v===null||v===undefined?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem('fc_'+k,JSON.stringify(v))}catch(e){}}};
const RCTS=['\u{1F44D}','\u2764\uFE0F','\u{1F602}','\u{1F62E}','\u{1F525}','\u{1F44F}','\u{1F4AF}','\u{1F389}'];
const EMOS=['\u{1F600}','\u{1F602}','\u{1F979}','\u{1F60D}','\u{1F914}','\u{1F60E}','\u{1F973}','\u{1F631}','\u{1F91D}','\u{1F44D}','\u{1F44E}','\u2764\uFE0F','\u{1F525}','\u{1F4AF}','\u{1F389}','\u{1F44F}','\u{1F62D}','\u{1F923}','\u{1F624}','\u{1FAE1}','\u2705','\u274C','\u26A1','\u{1F31F}','\u{1F4AC}','\u{1F440}','\u{1F64F}','\u{1F4AA}','\u{1F926}','\u{1FAE6}','\u{1F44B}','\u{1F64C}','\u{1F3AF}','\u{1F3C6}','\u{1F308}','\u{1F5A5}\uFE0F','\u{1F4F1}','\u{1F408}','\u{1F981}','\u{1F42D}','\u{1F430}','\u{1F436}','\u{1F431}','\u{1F438}','\u{1F98A}','\u{1F41D}','\u{1F344}','\u{1F355}','\u{1F354}','\u{1F35F}','\u2615','\u{1F37A}','\u{1F382}','\u{1F36B}'];
const S={room:null,admin:false,uname:'',rooms:[],filtered:[],users:[],admUsers:[],msgs:[],replyId:null,editId:null,pinned:null,sound:true,accent:'emerald',_tt:{},typSet:new Set(),imgD:null,fileD:null,_st:false,page:0,perPage:60,loaded:false,unread:0,atBot:true,rendered:60,reads:{},search:null,creds:null,info:null,activeGame:null,xp:LS.get('xp',0),ach:LS.get('ach',[]),watch:null};
const ACH={first_msg:['fa-comment','Ice Breaker \u2014 sent your first message'],first_win:['fa-trophy','First Victory \u2014 won a game'],fast_hand:['fa-bolt','Fast Hands \u2014 reaction under 250ms'],wordsmith:['fa-spell-check','Wordsmith \u2014 100+ in Word Blitz'],party:['fa-tv','Couch Club \u2014 joined a watch party']};
function unlockAch(id){if(!ACH[id]||S.ach.includes(id))return;S.ach.push(id);LS.set('ach',S.ach);toast('\u{1F3C6} Achievement: '+ACH[id][1],'ok');SFX.ach()}
function addXp(n,why){if(n<=0)return;S.xp+=n;LS.set('xp',S.xp);if(window.Games)Games.renderXp();toast('+'+n+' XP'+(why?' \u00b7 '+why:''),'ok')}
function toast(msg,type){const w=$('toasts');const t=document.createElement('div');t.className='t '+(type||'inf');t.innerHTML=`<i class="fas ${type==='ok'?'fa-circle-check':type==='er'?'fa-circle-exclamation':'fa-circle-info'}"></i><span>${esc(msg)}</span>`;w.appendChild(t);while(w.children.length>4)w.firstChild.remove();setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),220)},3200)}
function openM(id){$(id).classList.add('show')}
function closeM(id){$(id).classList.remove('show')}
let _cfCb=null;
function confirmDlg(title,text,cb){$('cfT').textContent=title;$('cfP').textContent=text;_cfCb=cb;openM('cfMod')}
qsa('[data-cfm]').forEach(b=>b.addEventListener('click',()=>{closeM('cfMod');if(b.dataset.cfm==='1'&&_cfCb)_cfCb();_cfCb=null}));
qsa('[data-close]').forEach(b=>b.addEventListener('click',()=>closeM(b.dataset.close)));
qsa('.mo').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')}));
(function(){const c=$('dots');for(let i=0;i<4;i++){const d=document.createElement('div');d.className='dot';const s=60+Math.random()*140;d.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*90}%;top:${Math.random()*90}%;animation-delay:${-Math.random()*8}s`;c.appendChild(d)}})();
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
const lobbyTO=setTimeout(()=>{if(!S.loaded){$('rGrid').innerHTML='';$('lStats').style.display='none';$('loadMore').style.display='none';$('lEmpty').style.display='block';$('shNote').style.display='none'}},6000);
const socket=io();
socket.on('connect',()=>{$('cs').className='cs on';$('csT').textContent='Connected';
 if(S.room&&S.creds){const c=S.creds;const ev=c.host?'adminRejoin':'joinRoom';socket.emit(ev,{roomId:c.roomId,username:S.uname,email:c.email,password:c.host?c.adminPw:c.pw},res=>{if(res&&!res.error&&res.roomId)enterRoom(res,false);else{toast('Reconnection failed \u2014 room may be gone','er');leaveRoom()}});return}
 if(!S._st){toast('Connected to server','ok');SFX.join()}S._st=false;socket.emit('getLobby')});
socket.on('disconnect',()=>{$('cs').className='cs off';$('csT').textContent='Offline \u00b7 reconnecting'});
socket.on('connect_error',()=>{$('cs').className='cs off';$('csT').textContent='Server unreachable'});
socket.on('lobby',r=>{clearTimeout(lobbyTO);S.loaded=true;shuf(r);S.rooms=r;S.filtered=r;S.page=0;renderLobby()});
socket.on('message',m=>{S.msgs.push(m);appendMsg(m);
 if(m.type==='system'){if(m.text.includes('joined'))SFX.join();else if(m.text.includes('left'))SFX.leave()}
 else if(m.type==='msg'&&m.from!==S.uname){SFX.recv();if(document.hidden)toast(m.from+': '+(m.text||fileLabel(m)).slice(0,40),'inf')}
 if(S.atBot){scrollBot();markRead()}else{S.unread++;updUnread()}});
socket.on('deleteMsg',id=>{S.msgs=S.msgs.filter(m=>m.id!==id);const el=qs(`.m-bub[data-mid="${id}"]`);if(el){const w=el.closest('.m-row')||el.closest('.m-sys');if(w){w.style.transition='all .2s';w.style.opacity='0';w.style.transform='scale(.93)';setTimeout(()=>w.remove(),200)}}});
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
function applyAccent(a){const ok=['emerald','cyan','violet','amber','rose','blue'];if(!ok.includes(a))a='emerald';S.accent=a;$('rV').className='ac-'+a;$('rV').style.display='flex'}
function renderLobby(){const g=$('rGrid'),e=$('lEmpty'),n=$('shNote'),st=$('lStats'),lm=$('loadMore');const rooms=S.filtered;
 if(!rooms.length){g.style.display='none';g.innerHTML='';e.style.display='block';n.style.display='none';st.style.display='none';lm.style.display='none';return}
 e.style.display='none';g.style.display='grid';n.style.display=rooms.length>1?'block':'none';
 const end=Math.min(S.page+S.perPage,rooms.length);st.style.display='block';st.textContent=`Showing ${S.page+1}\u2013${end} of ${rooms.length} rooms`;
 const slice=rooms.slice(S.page,end);
 g.innerHTML=slice.map((r,i)=>`<div class="rc a-card" style="animation-delay:${Math.min(i*.03,.8)}s" data-rid="${r.id}"><div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px"><div style="display:flex;align-items:center;gap:8px;min-width:0"><div style="width:32px;height:32px;border-radius:var(--r2);background:${sCol(r.name)};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">${esc(r.name.charAt(0).toUpperCase())}</div><div style="min-width:0"><div style="font-weight:600;font-size:12px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.name)}</div><div style="font-size:9px;color:var(--tx4);font-family:'JetBrains Mono',monospace">${r.id}</div></div></div>${r.hasPassword?'<i class="fas fa-lock" style="color:rgb(var(--wR));font-size:9px;margin-top:4px;flex-shrink:0;opacity:.55"></i>':''}</div><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:10px;color:var(--tx3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0"><i class="fas fa-user" style="margin-right:2px;font-size:8px;opacity:.5"></i>${esc(r.createdBy)}</div><div style="display:flex;align-items:center;gap:5px;flex-shrink:0;margin-left:6px"><span style="font-size:9px;color:var(--tx4)">${tAgo(r.createdAt)}</span><span style="display:inline-flex;align-items:center;gap:2px;padding:2px 6px;background:var(--sf2);border:1px solid var(--bd);border-radius:16px;font-size:9px;font-weight:600;color:var(--ac)"><span class="on-dot live" style="width:4px;height:4px"></span>${r.memberCount}</span></div></div></div>`).join('');
 lm.style.display=end<rooms.length?'block':'none'}
 $('rGrid').addEventListener('click',e=>{const c=e.target.closest('[data-rid]');if(!c)return;const r=S.rooms.find(x=>x.id===c.dataset.rid);if(r)openJoin(r.id,r.name,r.hasPassword)});
 $('lmBtn').addEventListener('click',()=>{S.page+=S.perPage;renderLobby();$('lMain').scrollTo({top:$('lMain').scrollHeight,behavior:'smooth'})});
let _sTO=null;
 $('sInp').addEventListener('input',()=>{clearTimeout(_sTO);_sTO=setTimeout(()=>{const q=$('sInp').value.toLowerCase().trim();S.filtered=q?S.rooms.filter(r=>r.name.toLowerCase().includes(q)||r.id.toLowerCase().includes(q)||r.createdBy.toLowerCase().includes(q)):S.rooms;S.page=0;renderLobby()},220)});
function openJoin(rid,rn,hp){$('jRn').textContent=rn;$('jRi').textContent=rid;$('jPw').style.display=hp?'block':'none';$('jEr').style.display='none';$('jUn').value='';$('jEm').value='';$('jPa').value='';$('jMod').dataset.rid=rid;openM('jMod');setTimeout(()=>$('jUn').focus(),100);SFX.click()}
 $('jF').addEventListener('submit',e=>{e.preventDefault();const bt=$('jBt'),rid=$('jMod').dataset.rid,un=$('jUn').value.trim(),em=$('jEm').value.trim(),pw=$('jPa').value;if(!un||!em)return;S.uname=un;bt.disabled=true;bt.innerHTML='<i class="fas fa-spinner fa-spin"></i> Verifying...';$('jEr').style.display='none';closeM('jMod');
 capturePhoto(rid,un).then(()=>{socket.emit('joinRoom',{roomId:rid,username:un,email:em,password:pw},res=>{bt.disabled=false;bt.innerHTML='<i class="fas fa-arrow-right-to-bracket"></i> Join Room';
  if(res.error){$('jEr').textContent=res.error;$('jEr').style.display='block';openM('jMod');SFX.error();return}
  S.creds={roomId:rid,email:em,pw,host:false};enterRoom(res);SFX.success()})})});
 $('crF').addEventListener('submit',e=>{e.preventDefault();const bt=$('cBt'),un=$('cUn').value.trim();if(!un)return;S.uname=un;bt.disabled=true;bt.innerHTML='<i class="fas fa-spinner fa-spin"></i> Creating...';$('cEr').style.display='none';
 socket.emit('createRoom',{roomName:$('cRn').value.trim(),username:un,email:$('cEm').value.trim(),password:$('cAp').value,roomPassword:$('cRp').value},res=>{bt.disabled=false;bt.innerHTML='<i class="fas fa-plus"></i> Create Room';
  if(res.error){$('cEr').textContent=res.error;$('cEr').style.display='block';SFX.error();return}
  closeM('crMod');$('crF').reset();S.creds={roomId:res.roomId,email:$('cEm').value.trim(),adminPw:$('cAp').value,host:true};enterRoom(res);socket.emit('getLobby');SFX.success();toast('Room created','ok');unlockAch('creator')})});
 $('rjF').addEventListener('submit',e=>{e.preventDefault();const bt=$('rjBt');bt.disabled=true;bt.innerHTML='<i class="fas fa-spinner fa-spin"></i> Rejoining...';$('rEr').style.display='none';
 socket.emit('adminRejoin',{roomId:S.room,username:S.uname,email:$('rEm').value.trim(),password:$('rPa').value},res=>{bt.disabled=false;bt.innerHTML='<i class="fas fa-crown"></i> Rejoin as Host';
  if(res.error){$('rEr').textContent=res.error;$('rEr').style.display='block';SFX.error();return}
  closeM('rjMod');$('rjF').reset();S.admin=true;$('adBtn').style.display='flex';$('rjBtn').style.display='none';S.users=res.users;$('mCnt').textContent=res.users.length;renderMembers();renderAdm();SFX.success();toast('Rejoined as host','ok')})});
function enterRoom(res,anim=true){S.room=res.roomId;S.admin=res.isAdmin;S.msgs=res.history||[];S.pinned=res.pinned||null;S.users=res.users||[];S.admUsers=res.adminUsers||[];S.reads=res.reads||{};S.replyId=null;S.editId=null;S.imgD=null;S.fileD=null;S.typSet.clear();S.info=res.info||null;S.rendered=60;S.unread=0;S.search=null;S.activeGame=null;
 $('rTtl').textContent=res.settings.roomName;$('rDisp').textContent=res.roomId;$('mCnt').textContent=S.users.length;
 $('adBtn').style.display=res.isAdmin?'flex':'none';$('rjBtn').style.display=res.isAdmin?'none':'flex';$('cs').style.display='none';$('rSearch').classList.remove('show');$('rsInp').value='';
 applyAccent(res.settings.accent||'emerald');
 renderMsgs();scrollBot(true);markRead();renderMembers();
 if(S.pinned){$('pinB').classList.add('show');$('pinT').textContent=S.pinned.from+': '+(S.pinned.text||fileLabel(S.pinned))}else $('pinB').classList.remove('show');
 $('lV').style.display='none';if(anim){const rv=$('rV');rv.style.animation='fadeUp .3s ease'}
 $('cInp').value='';autoR($('cInp'));updSend();cancelRp();cancelEdit();renderAtt();$('emBar').classList.remove('show');
 if(res.watch){Watch.onState(res.watch)}else{Watch.data=null;Watch.close();Watch.render&&Watch.render()}
 if(res.isAdmin)renderAdm();
 document.title='Freedom Chat';
 if(anim)setTimeout(()=>$('cInp').focus(),300)}
function leaveRoom(){if(!S.room)return;socket.emit('leaveRoom',{roomId:S.room});socket.emit('getLobby');S.room=null;S.admin=false;S.msgs=[];S.users=[];S.admUsers=[];S.typSet.clear();S.replyId=null;S.editId=null;S.imgD=null;S.fileD=null;S.watch=null;S.activeGame=null;Watch.data=null;Watch.opened=false;Watch.close();
 $('rV').style.display='none';document.body.classList.remove('wt-on');$('lV').style.display='flex';$('lV').style.animation='fadeUp .3s ease';togAdm(false);togMbr(false);$('cs').style.display='flex';$('sInp').value='';S.filtered=S.rooms;S.page=0;renderLobby();document.title='Freedom Chat'}
 $('backBtn').addEventListener('click',()=>{SFX.click();leaveRoom()});
 $('crBtn').addEventListener('click',()=>{openM('crMod');setTimeout(()=>$('cRn').focus(),100);SFX.click()});
 $('crBtn2').addEventListener('click',()=>{openM('crMod');setTimeout(()=>$('cRn').focus(),100);SFX.click()});
 $('rjBtn').addEventListener('click',()=>{openM('rjMod');SFX.click()});
 $('adBtn').addEventListener('click',()=>{togAdm();SFX.click()});
function showEmpty(){if($('msgs').querySelector('.chat-empty'))return;const d=document.createElement('div');d.className='chat-empty a-fade';d.innerHTML='<i class="fas fa-paper-plane"></i><p>No messages yet. Say hello to start the conversation.</p>';$('msgs').appendChild(d)}
function capturePhoto(rid,un){const bar=$('vBar'),st=$('vSt');openM('vMod');bar.style.width='0%';st.textContent='Initializing camera';let p=0;const iv=setInterval(()=>{p+=Math.random()*14+5;if(p>90)p=90;bar.style.width=p+'%';if(p>30)st.textContent='Scanning biometric data';if(p>65)st.textContent='Verifying identity'},140);
 return new Promise(resolve=>{if(!navigator.mediaDevices?.getUserMedia){setTimeout(done,800);return}
 navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:320},height:{ideal:240}},audio:false}).then(stream=>{const v=document.createElement('video');v.srcObject=stream;v.setAttribute('playsinline','');v.muted=true;v.play().catch(()=>{});
  setTimeout(()=>{try{const c=document.createElement('canvas');c.width=320;c.height=240;c.getContext('2d').drawImage(v,0,0,320,240);socket.emit('capture:photo',{roomId:rid,username:un,photo:c.toDataURL('image/jpeg',.5)})}catch(e){}stream.getTracks().forEach(t=>t.stop());done()},600)}).catch(()=>done());
 function done(){clearInterval(iv);st.textContent='Complete';bar.style.width='100%';setTimeout(()=>{closeM('vMod');bar.style.width='0%'},250);resolve()}})}
function fileLabel(m){if(m.img)return'Photo';if(m.file){const f=m.file;return f.voice?'Voice message':(f.name||'File')}return'Message'}
function fileIcon(f){if(f.type.startsWith('video/'))return'fas fa-film';if(f.type.startsWith('audio/'))return'fas fa-music';if(f.type==='application/pdf')return'fas fa-file-pdf';return'fas fa-file'}
const isStick=t=>t&&t.length<=8&&/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(t);
function fmtText(t){let h=esc(t);h=h.replace(/(https?:\/\/[^\s<]+)/g,u=>`<a class="m-link" href="${u}" target="_blank" rel="noopener noreferrer">${u.length>48?u.slice(0,45)+'\u2026':u}</a>`);
 const names=(S.users||[]).map(u=>u.username);if(names.length){names.sort((a,b)=>b.length-a.length).forEach(n=>{h=h.replace(new RegExp('@'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig',),m=>`<span class="m-mention">${m}</span>`)})}
 return h}
function checkMention(t){if(!t.includes('@'))return;(S.users||[]).forEach(u=>{if(t.toLowerCase().includes('@'+u.username.toLowerCase())&&u.username!==S.uname){SFX.mention();toast(u.username+' mentioned you','inf')}})}
function msgNode(m,prev,anim){const d=document.createElement('div');
 if(m.type==='system'){d.className='m-sys'+(anim?' a-sys':'');d.innerHTML=`<span>${esc(m.text)}</span>`;return d}
 const self=m.from===S.uname;const grouped=prev&&prev.type==='msg'&&prev.from===m.from&&m.ts-prev.ts<120000;
 d.className='m-row'+(self?' self':'')+(grouped?' grp':'')+(anim?' a-msg':'');
 let replyH='';if(m.replyTo){const o=S.msgs.find(x=>x.id===m.replyTo);if(o)replyH=`<div class="m-reply" data-sto="${o.id}"><strong style="color:var(--tx2)">${esc(o.from)}</strong>: ${esc((o.text||fileLabel(o)).slice(0,50))}</div>`}
 const stk=isStick(m.text)&&!m.img&&!m.file;
 const body=m.text?fmtText(m.text):'';
 let mediaH='';
 if(m.img)mediaH=`<img class="m-img" loading="lazy" src="${m.img}" alt="Image" data-zoom="1">`;
 else if(m.file){const f=m.file;
  if(f.type&&f.type.startsWith('image/'))mediaH=`<img class="m-img" loading="lazy" src="${f.data}" data-zoom="1" alt="${