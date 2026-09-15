const SFX={ctx:null,on:true,nv:.7,gv:.7,
load(){try{const s=JSON.parse(localStorage.getItem('fc_snd'));if(s){this.on=s.on!==false;this.nv=s.nv??.7;this.gv=s.gv??.7}}catch(e){}},
save(){try{localStorage.setItem('fc_snd',JSON.stringify({on:this.on,nv:this.nv,gv:this.gv}))}catch(e){}},
unlock(){if(!this.ctx){try{this.ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{})},
c(f,d,t,v,sl){if(!this.on||!this.ctx||v<=0)return;try{const tm=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=t||'sine';o.connect(g);g.connect(this.ctx.destination);o.frequency.setValueAtTime(f,tm);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,sl),tm+d);g.gain.setValueAtTime(0,tm);g.gain.linearRampToValueAtTime(Math.min(.12,Math.max(0,v)),tm+.006);g.gain.exponentialRampToValueAtTime(.001,tm+d);o.start(tm);o.stop(tm+d)}catch(e){}},
click(){this.c(1400,.015,'triangle',.012)},
send(){this.c(1100,.05,'sine',.03*this.nv,650)},
recv(){this.c(660,.12,'sine',.03*this.nv);setTimeout(()=>this.c(990,.15,'sine',.02*this.nv),70)},
join(){this.c(523,.08,'sine',.022*this.nv);setTimeout(()=>this.c(659,.08,'sine',.022*this.nv),60);setTimeout(()=>this.c(784,.12,'sine',.026*this.nv),120)},
leave(){this.c(784,.08,'sine',.015*this.nv);setTimeout(()=>this.c(523,.11,'sine',.015*this.nv),80)},
error(){this.c(180,.15,'sawtooth',.02*this.nv,90)},
success(){this.c(523,.08,'sine',.022*this.nv);setTimeout(()=>this.c(659,.08,'sine',.022*this.nv),50);setTimeout(()=>this.c(784,.08,'sine',.026*this.nv),100);setTimeout(()=>this.c(1047,.15,'sine',.026*this.nv),150)},
notify(){this.c(880,.06,'sine',.016*this.nv);setTimeout(()=>this.c(1320,.08,'sine',.013*this.nv),60)},
mention(){this.c(1200,.07,'triangle',.03*this.nv);setTimeout(()=>this.c(1600,.09,'triangle',.025*this.nv),80)},
countdown(){this.c(700,.09,'square',.03*this.gv)},
tick(){this.c(1000,.03,'square',.02*this.gv)},
gStart(){[440,554,659,880].forEach((f,i)=>setTimeout(()=>this.c(f,.09,'square',.028*this.gv),i*90))},
gWin(){[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>this.c(f,.13,'sine',.032*this.gv),i*100))},
gLose(){[400,340,280,200].forEach((f,i)=>setTimeout(()=>this.c(f,.14,'sine',.028*this.gv),i*120))},
ach(){[880,1109,1319,1760].forEach((f,i)=>setTimeout(()=>this.c(f,.11,'triangle',.026*this.nv),i*80))},
wStart(){[392,523,659,784].forEach((f,i)=>setTimeout(()=>this.c(f,.12,'sine',.028*this.nv),i*110))}
};
SFX.load();
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,()=>SFX.unlock(),{passive:true}));