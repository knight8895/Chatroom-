const SAMPLES=[['Big Buck Bunny','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'],['Elephants Dream','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'],['Sintel','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'],['Tears of Steel','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4']];
const Watch={sock:null,api:null,data:null,video:null,opened:false,seekDrag:false,_iv:null,_hb:null,
init(sock,api){this.sock=sock;this.api=api;this.video=$('wtV');const v=this.video;
 socket.on('watch:state',st=>this.onState(st));
 socket.on('watch:end',()=>{if(this.data){this.data=null;this.render();api.toast('Watch party ended','inf')}});
 socket.on('watch:watchers',w=>{if(this.data){this.data.watchers=w;this.render()}});
 socket.on('watch:reaction',d=>this.float(d.emoji));
 v.addEventListener('seeked',()=>{if(this.isHost())this.emitC('seek',v.currentTime)});
 v.addEventListener('ratechange',()=>{if(this.isHost())this.emitC('rate',v.playbackRate)});
 v.addEventListener('timeupdate',()=>this.ui());
 v.addEventListener('loadedmetadata',()=>{this.sync(true);this.ui()});
 v.addEventListener('play',()=>{$('wtPlay').innerHTML='<i class="fas fa-pause"></i>';if(this.isHost())this.emitC('play',v.currentTime)});
 v.addEventListener('pause',()=>{$('wtPlay').innerHTML='<i class="fas fa-play"></i>';if(this.isHost())this.emitC('pause',v.currentTime)});
 this._iv=setInterval(()=>this.sync(),750);
 this._hb=setInterval(()=>{const d=this.data;if(d&&this.isHost()&&d.playing&&!v.paused)this.sock.emit('watch:control',{roomId:this.api.S.room,action:'sync',value:{time:v.currentTime,playing:true,rate:v.playbackRate}})},3000);
 $('wtChips').innerHTML=SAMPLES.map((s,i)=>`<button data-si="${i}">${s[0]}</button>`).join('');
 $('wtChips').addEventListener('click',e=>{const b=e.target.closest('[data-si]');if(!b)return;const s=SAMPLES[+b.dataset.si];$('wsUrl').value=s[1];$('wsTitle').value=s[0];SFX.click()});
 $('wsGo').addEventListener('click',()=>{const u=$('wsUrl').value.trim();if(!/^https?:\/\//.test(u)){this.api.toast('Enter a valid video URL','er');return}this.sock.emit('watch:start',{roomId:this.api.S.room,url:u,title:$('wsTitle').value.trim()||u.split('/').pop()});SFX.click()});
 $('wtPlay').addEventListener('click',()=>{if(!this.isHost())return;const v=this.video;v.paused?v.play().catch(()=>{}):v.pause()});
 $('wtSeek').addEventListener('input',()=>{this.seekDrag=true});
 $('wtSeek').addEventListener('change',()=>{if(this.isHost())this.emitC('seek',(+$('wtSeek').value/1000)*(this.video.duration||0));this.seekDrag=false});
 $('wtVol').addEventListener('input',()=>{v.volume=+$('wtVol').value/100;v.muted=false;$('wtVolI').className=v.volume===0?'fas fa-volume-xmark':(v.volume<.5?'fas fa-volume-low':'fas fa-volume-high')});
 $('wtVolB').addEventListener('click',()=>{v.muted=!v.muted;$('wtVolI').className=v.muted?'fas fa-volume-xmark':'fas fa-volume-high'});
 $('wtRate').addEventListener('change',()=>{if(this.isHost())v.playbackRate=+$('wtRate').value});
 $('wtFs').addEventListener('click',()=>{const el=$('wtPn').classList.contains('mini')?this.video:document.querySelector('.wt-video');if(document.fullscreenElement)document.exitFullscreen();else el.requestFullscreen?.().catch(()=>{})});
 $('wtPip').addEventListener('click',()=>{if(document.pictureInPictureElement)document.exitPictureInPicture().catch(()=>{});else this.video.requestPictureInPicture?.().catch(()=>this.api.toast('Picture-in-picture unavailable','er'))});
 $('wtTh').addEventListener('click',()=>{$('wtPn').classList.remove('mini');$('wtPn').classList.toggle('theater');SFX.click()});
 $('wtMini').addEventListener('click',()=>{$('wtPn').classList.remove('theater');$('wtPn').classList.toggle('mini');SFX.click()});
 $('wtClose').addEventListener('click',()=>{if(this.isHost()){this.api.confirmDlg('End watch party?','This will stop the video for everyone in the room.',()=>{this.sock.emit('watch:end',{roomId:this.api.S.room});this.data=null;this.close()})}else this.close()});
 $('wtPrev').addEventListener('click',()=>this.sock.emit('watch:queue',{roomId:this.api.S.room,op:'prev'}));
 $('wtNext').addEventListener('click',()=>this.sock.emit('watch:queue',{roomId:this.api.S.room,op:'next'}));
 $('wqAdd').addEventListener('click',()=>{const u=$('wqUrl').value.trim();if(!/^https?:\/\//.test(u)){this.api.toast('Enter a valid video URL','er');return}this.sock.emit('watch:queue',{roomId:this.api.S.room,op:'add',url:u,title:u.split('/').pop()});$('wqUrl').value='';this.api.toast('Added to queue','ok')});
 $('wtRx').innerHTML=['\u{1F44D}','\u2764\uFE0F','\u{1F602}','\u{1F631}','\u{1F525}','\u{1F389}'].map(e=>`<button data-e="${e}">${e}</button>`).join('');
 $('wtRx').addEventListener('click',e=>{const b=e.target.closest('[data-e]');if(b){this.sock.emit('watch:reaction',{roomId:this.api.S.room,emoji:b.dataset.e});this.float(b.dataset.e)}});
 $('wtTap').addEventListener('click',()=>{$('wtTap').classList.remove('show');this.video.play().catch(()=>{})});
 $('wtQueue').addEventListener('click',e=>{const q=e.target.closest('.wt-qi');if(!q)return;const i=+q.dataset.qi;if(e.target.closest('.qi-x')){if(this.isHost())this.sock.emit('watch:queue',{roomId:this.api.S.room,op:'remove',index:i})}else if(this.isHost())this.sock.emit('watch:queue',{roomId:this.api.S.room,op:'jump',index:i})});
},
isHost(){return this.data&&this.data.host===this.api.S.uname},
emitC(a,v){this.sock.emit('watch:control',{roomId:this.api.S.room,action:a,value:v})},
toggle(){if(this.data)this.open();else{this.open();this.render()}},
open(){if(this.opened)return;this.opened=true;const p=$('wtPn');p.classList.remove('mini','theater');p.classList.add('open');document.body.classList.add('wt-on');this.sock.emit('watch:here',{roomId:this.api.S.room,on:true});this.api.unlockAch('party','Couch Club — joined a watch party')},
close(){$('wtPn').classList.remove('open','mini','theater');document.body.classList.remove('wt-on');this.opened=false;this.sock.emit('watch:here',{roomId:this.api.S.room,on:false})},
onState(st){if(!st)return;const first=!this.data||st.url!==this.data.url;const wasNull=!this.data;this.data=st;this.open();if(first||this.video.dataset.url!==st.url){this.video.dataset.url=st.url;this.video.src=st.url;this.video.playbackRate=st.rate||1;this.video.load()}this.sync(true);this.render();if(wasNull){this.api.toast('\u{1F37F} Watch party started','ok');SFX.wStart()}},
sync(hard){const d=this.data,v=this.video;if(!d||!v.src)return;const host=this.isHost();
 if(!host){const exp=d.time+(Date.now()-d.ts)/1000*(d.rate||1);if(d.playing&&v.paused)v.play().catch(()=>$('wtTap').classList.add('show'));if(!d.playing&&!v.paused)v.pause();const diff=v.currentTime-exp;if(Math.abs(diff)>(hard?.15:.6))v.currentTime=Math.max(0,Math.min(exp,(v.duration||1e9)-.1));if(Math.abs(v.playbackRate-(d.rate||1))>.01)v.playbackRate=d.rate||1}
 else{if(d.playing&&v.paused)v.play().catch(()=>{});if(!d.playing&&!v.paused)v.pause()}
},
ui(){const v=this.video,d=this.data;if(!d)return;if(!this.seekDrag&&v.duration)$('wtSeek').value=Math.round(v.currentTime/v.duration*1000);$('wtTime').textContent=this.fmt(v.currentTime)+' / '+this.fmt(v.duration||0)},
fmt(s){if(!isFinite(s))return'0:00';s=Math.max(0,Math.floor(s));const m=Math.floor(s/60);return m+':'+String(s%60).padStart(2,'0')},
float(e){const w=$('wtReacts');const s=document.createElement('span');s.textContent=e;s.style.left=(8+Math.random()*78)+'%';w.appendChild(s);setTimeout(()=>s.remove(),2300)},
render(){const live=!!this.data;$('wtSetup').style.display=live?'none':'block';$('wtLive').style.display=live?'flex':'none';if(!live)return;const d=this.data,h=this.isHost();$('wtTitle').textContent=d.title;$('wtHost').textContent=d.host;$('wtWatchers').textContent=(d.watchers||[]).length;$('wtPlay').disabled=!h;$('wtSeek').disabled=!h;$('wtRate').disabled=!h;$('wtRate').value=String(d.rate||1);$('wtPrev').disabled=!h||d.index<=0;$('wtNext').disabled=!h||d.index>=d.queue.length-1;$('wtPlay').style.opacity=h?1:.35;$('wtSeek').style.opacity=h?1:.35;$('wtQc').textContent=d.queue.length+' videos';$('wtQueue').innerHTML=d.queue.map((q,i)=>`<div class="wt-qi${i===d.index?' now':''}" data-qi="${i}"><span class="qi-i">${String(i+1).padStart(2,'0')}</span><span class="qi-n">${this.api.esc(q.title)}</span>${h&&d.queue.length>1?`<button class="qi-x" title="Remove"><i class="fas fa-xmark"></i></button>`:''}${i===d.index?'<i class="fas fa-play" style="color:var(--ac);font-size:9px"></i>':''}</div>`).join('');this.api.renderMembers()}
};