import * as THREE from "three";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const characters = [
 ["KAIRO","Shadow Warrior","A disciplined guardian who channels the living dark.",0x333c58,"SHADOW",100,13,9],
 ["RYU","Dragon Fighter","A wandering champion bearing an ancient dragon oath.",0x9b4433,"DRAGON",110,15,8],
 ["ZEN","Lightning Master","A swift tactician whose strikes crackle with stormlight.",0x4a86b9,"LIGHTNING",92,14,7],
 ["BLAZE","Fire Warrior","A fierce arena veteran wrapped in ember-forged armor.",0xc65b2f,"FIRE",108,16,7],
 ["FROST","Ice Assassin","A silent hunter whose movements leave a winter chill.",0x80b9cb,"ICE",88,14,8],
 ["RAVEN","Dark Knight","An exiled sentinel protected by layered dusksteel.",0x51435f,"SHADOW",120,13,12],
 ["AKIRA","Blade Master","A precise duelist trained in the seven flowing cuts.",0xb58c58,"LIGHTNING",96,17,7],
 ["THORIN","Thunder Warrior","A mountain-born defender with the strength of a storm.",0x77869b,"LIGHTNING",130,14,13],
 ["NOX","Shadow Assassin","A phantom fighter who appears where light fades.",0x292b40,"SHADOW",86,17,6],
 ["AETHER","Mystic Warrior","A keeper of old rites and luminous battle sigils.",0x9a83b8,"ICE",100,13,9],
 ["VEX","Void Fighter","A dangerous wanderer touched by the force below.",0x704c83,"SHADOW",105,16,8],
 ["KENZO","Samurai Warrior","A steadfast swordsman whose honor is unbroken.",0x9d6548,"DRAGON",112,15,10],
 ["DRAKON","Dragon Knight","A royal guardian clad in scaled ceremonial plate.",0x6c9b68,"DRAGON",125,16,11],
 ["LUNA","Moon Warrior","A graceful sentinel who draws strength from moonlight.",0x8b9bc7,"ICE",94,14,8],
 ["TITAN","Ancient Guardian","A relic warrior awakened to defend the five kingdoms.",0x927b61,"FIRE",150,18,14]
].map((c,i)=>({id:i,name:c[0],title:c[1],desc:c[2],color:c[3],element:c[4],hp:c[5],atk:c[6],def:c[7]}));
const weapons=[["Katana",1.08,0],["Twin Blades",1.02,120],["Long Sword",1.18,220],["Battle Axe",1.32,350],["Spear",1.12,450],["War Staff",.96,550],["Daggers",.92,650],["Great Sword",1.42,800]];
const chapters=["Ashes at Dawn","The Ember Gate","Frostbound Oath","Whispers in the Wood","Storm Over Sable","The Dragon's Debt","Below the Temple","The Broken Crown","Citadel of Night","The Last Horizon"];
const arenas=["Ancient Temple","Fire Fortress","Frozen Mountain","Dark Forest","Dragon Palace","Underground Arena","Shadow Castle","Thunder Battlefield"];
const defaults={level:1,xp:0,coins:0,wins:0,losses:0,unlocked:[0],selected:0,chapter:0,weapon:0,weaponLevel:0,skills:{attack:0,defense:0,health:0,energy:0},settings:{sound:true,quality:"AUTO",fps:30},achievements:[]};
let save={...defaults};
try{save={...defaults,...JSON.parse(localStorage.getItem("swl-save")||"{}")};}catch(e){}
function persist(){try{localStorage.setItem("swl-save",JSON.stringify(save));}catch(e){toast("Save storage unavailable");}updateTop();}
function updateTop(){$("#level").textContent="LV "+save.level;$("#coins").textContent="◈ "+save.coins;}
function toast(t){const el=$("#toast");el.textContent=t;el.style.opacity=1;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.opacity=0,1700);}
updateTop();

const scene=new THREE.Scene();scene.background=new THREE.Color(0x101522);scene.fog=new THREE.Fog(0x101522,15,42);
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);camera.position.set(0,4.1,12.8);
const renderer=new THREE.WebGLRenderer({canvas:$("#game"),antialias:matchMedia("(pointer:coarse)").matches?false:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
scene.add(new THREE.HemisphereLight(0x9bb7db,0x211b25,2.1));
const key=new THREE.DirectionalLight(0xffd9aa,3.1);key.position.set(-4,8,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
const rim=new THREE.PointLight(0x4e8ab9,30,22);rim.position.set(5,4,-5);scene.add(rim);
const floor=new THREE.Mesh(new THREE.CylinderGeometry(7.8,8.4,.55,48),new THREE.MeshStandardMaterial({color:0x293142,roughness:.9,metalness:.12}));floor.position.y=-.3;floor.receiveShadow=true;scene.add(floor);
const floorTop=new THREE.Mesh(new THREE.CircleGeometry(7.75,48),new THREE.MeshStandardMaterial({color:0x303747,roughness:.94}));floorTop.rotation.x=-Math.PI/2;floorTop.position.y=-.015;floorTop.receiveShadow=true;scene.add(floorTop);
const grid=new THREE.GridHelper(15,30,0x62758b,0x394454);grid.position.y=.005;scene.add(grid);
function pillar(x,z,h=3){const p=new THREE.Mesh(new THREE.CylinderGeometry(.38,.52,h,8),new THREE.MeshStandardMaterial({color:0x4a4c59,roughness:.8}));p.position.set(x,h/2-.05,z);p.castShadow=true;p.receiveShadow=true;scene.add(p);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.18,8),new THREE.MeshStandardMaterial({color:0x9a7850,metalness:.45,roughness:.5}));cap.position.set(x,h-.05,z);scene.add(cap);}
for(const x of [-6,6])for(const z of [-4,1])pillar(x,z,3.2);
const stars=new THREE.Group();scene.add(stars);for(let i=0;i<80;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.025,5,5),new THREE.MeshBasicMaterial({color:0x9ab8d8,transparent:true,opacity:.65}));m.position.set((Math.random()-.5)*25,2+Math.random()*8,-8-Math.random()*12);stars.add(m);}
let fighters=[],player,enemy,active=false,paused=false,mode="story",round=1,energy=100,lastTime=0,elapsed=0,particles=[],shake=0,combo=0,comboTimer=0,stick={x:0,y:0},keys={},audioCtx=null;
const mat=(color,metalness=.15,roughness=.65)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
function limb(parent,name,geom,material,pos){const m=new THREE.Mesh(geom,material);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function makeFighter(data,x,flip=false){
 const root=new THREE.Group();root.position.set(x,0,0);scene.add(root);
 const skin=mat(0xb78d70),armor=mat(data.color,.45,.38),dark=mat(0x171c2a,.35,.5),accent=mat(0xd9b16c,.65,.3);
 const body=new THREE.Group();root.add(body);
 limb(body,"torso",new THREE.CapsuleGeometry(.39,.65,4,8),armor,[0,1.35,0]);
 limb(body,"chest",new THREE.SphereGeometry(.43,10,8),armor,[0,1.67,0]);
 limb(body,"belt",new THREE.CylinderGeometry(.34,.38,.18,8),accent,[0,1.02,0]);
 const head=limb(body,"head",new THREE.SphereGeometry(.27,12,10),skin,[0,2.12,0]);
 limb(body,"helm",new THREE.SphereGeometry(.3,10,8,0,Math.PI*2,0,Math.PI*.48),dark,[0,2.24,0]);
 limb(body,"mask",new THREE.BoxGeometry(.34,.12,.31),dark,[0,2.03,.13]);
 const shoulderL=limb(body,"shoulderL",new THREE.SphereGeometry(.23,8,8),accent,[-.47,1.72,0]);
 const shoulderR=limb(body,"shoulderR",new THREE.SphereGeometry(.23,8,8),accent,[.47,1.72,0]);
 const upperL=limb(body,"armL",new THREE.CapsuleGeometry(.13,.42,3,6),armor,[-.52,1.42,0]);
 const upperR=limb(body,"armR",new THREE.CapsuleGeometry(.13,.42,3,6),armor,[.52,1.42,0]);
 const fistL=limb(body,"fistL",new THREE.SphereGeometry(.14,7,6),dark,[-.53,1.12,.02]);
 const fistR=limb(body,"fistR",new THREE.SphereGeometry(.14,7,6),dark,[.53,1.12,.02]);
 const legL=limb(body,"legL",new THREE.CapsuleGeometry(.16,.52,3,6),dark,[-.22,.57,0]);
 const legR=limb(body,"legR",new THREE.CapsuleGeometry(.16,.52,3,6),dark,[.22,.57,0]);
 const bootL=limb(body,"bootL",new THREE.BoxGeometry(.3,.16,.48),accent,[-.22,.13,.1]);
 const bootR=limb(body,"bootR",new THREE.BoxGeometry(.3,.16,.48),accent,[.22,.13,.1]);
 // Distinct silhouette details and visible hand-held weapon
 const cape=limb(body,"cape",new THREE.ConeGeometry(.43,.9,5),dark,[0,1.25,-.28]);cape.rotation.x=-.2;
 const weapon=new THREE.Group();weapon.position.set(.64,1.17,.02);body.add(weapon);
 const blade=limb(weapon,"blade",new THREE.BoxGeometry(.09,.95,.045),mat(data.element==="FIRE"?0xe67a45:data.element==="ICE"?0x9de7f1:data.element==="LIGHTNING"?0xf1db83:0x8c9fc6,.65,.25),[0,.53,0]);blade.rotation.z=-.12;
 limb(weapon,"guard",new THREE.BoxGeometry(.36,.07,.1),accent,[0,.12,0]);
 const handle=limb(weapon,"handle",new THREE.CylinderGeometry(.045,.045,.28,6),dark,[0,-.08,0]);
 weapon.rotation.z=-.38;
 // aura ring
 const aura=new THREE.Mesh(new THREE.TorusGeometry(.62,.018,5,32),new THREE.MeshBasicMaterial({color:data.color,transparent:true,opacity:.5}));aura.rotation.x=Math.PI/2;aura.position.y=.06;root.add(aura);
 return {root,body,parts:{head,upperL,upperR,fistL,fistR,legL,legR,bootL,bootR,weapon,cape,aura},data,hp:data.hp,maxHp:data.hp,stun:0,attackCd:0,anim:"idle",animTime:0,blocking:false,flash:0,dead:false,dir:flip?-1:1};
}
function clearFighters(){for(const f of fighters)scene.remove(f.root);fighters=[];}
function setArena(index){const colors=[0x303b50,0x4a2b27,0x344b5a,0x203a32,0x4a3a2c,0x3a3445,0x28283e,0x35445b];floor.material.color.setHex(colors[index%8]);floorTop.material.color.setHex(colors[index%8]+0x080808);scene.fog.color.setHex(index===1?0x281a1a:index===2?0x172b3b:index===3?0x14251f:0x101522);scene.background.setHex(index===1?0x211719:index===2?0x142435:0x101522);rim.color.setHex(index===1?0xff6633:index===2?0x65d9ff:0x4e8ab9);}
function startBattle(m="story"){
 mode=m;round=1;energy=100;combo=0;elapsed=0;paused=false;$("#menu").classList.add("hidden");$("#fighterPanel").classList.add("hidden");$("#infoPanel").classList.add("hidden");$("#result").classList.add("hidden");$("#pausePanel").classList.add("hidden");$("#hud").classList.remove("hidden");
 clearFighters();const chosen=characters[save.selected]||characters[0];player=makeFighter({...chosen,hp:chosen.hp+save.skills.health*8,atk:chosen.atk+save.skills.attack*2,def:chosen.def+save.skills.defense},-2.1,false);
 let enemyIndex=mode==="boss"?14:mode==="story"?Math.min(14,1+save.chapter):Math.floor(Math.random()*15);
 if(enemyIndex===save.selected)enemyIndex=(enemyIndex+1)%15;
 let foe=characters[enemyIndex];let multiplier=mode==="training"?.65:mode==="boss"?1.55:1;
 enemy=makeFighter({...foe,hp:foe.hp*multiplier,atk:foe.atk*multiplier,def:foe.def},2.1,true);
 fighters=[player,enemy];setArena(mode==="story"?save.chapter%8:Math.floor(Math.random()*8));
 $("#enemyName").textContent=foe.name;$("#roundLabel").textContent=mode.toUpperCase()+" · "+round;
 $("#combatHint").textContent=mode==="training"?"TRAINING": "FIGHT!";showHint();
 updateHud();active=true;camera.position.set(0,4.1,12.8);camera.lookAt(0,1.1,0);
}
function showHint(){const h=$("#combatHint");h.classList.add("show");setTimeout(()=>h.classList.remove("show"),900);}
function updateHud(){$("#playerHealth").style.width=(100*player.hp/player.maxHp)+"%";$("#enemyHealth").style.width=(100*enemy.hp/enemy.maxHp)+"%";$("#playerHpText").textContent=Math.ceil(player.hp)+" / "+Math.ceil(player.maxHp);$("#enemyHpText").textContent=Math.ceil(enemy.hp)+" / "+Math.ceil(enemy.maxHp);$("#energyBar").style.width=energy+"%";}
function audio(type){if(!save.settings.sound)return;try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);const f={hit:110,kick:75,heavy:55,power:240,block:180,win:440,lose:90}[type]||140;o.frequency.setValueAtTime(f,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,f*.55),audioCtx.currentTime+.12);g.gain.setValueAtTime(.08,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.16);o.start();o.stop(audioCtx.currentTime+.17);}catch(e){}}
function spawnBurst(pos,color,count=14){for(let i=0;i<count;i++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.035+Math.random()*.035,5,5),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1}));mesh.position.copy(pos);scene.add(mesh);particles.push({mesh,vel:new THREE.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*2),life:.45+Math.random()*.35});}}
function attack(f,kind){
 if(!active||paused||f.dead||f.attackCd>0||f.stun>0)return;
 if(f===player&&kind==="special"){if(energy<35){toast("Not enough energy");return;}energy-=35;}
 const enemyF=f===player?enemy:player;const dist=Math.abs(f.root.position.x-enemyF.root.position.x);
 const cost={punch:.38,kick:.58,heavy:.9,special:1.05}[kind]||.5;f.attackCd=cost;f.anim=kind;f.animTime=0;f.blocking=false;
 if(kind==="special"){audio("power");spawnBurst(f.root.position.clone().add(new THREE.Vector3(0,1.5,0)),f.data.color,35);shake=.25;}
 else audio(kind==="kick"?"kick":kind==="heavy"?"heavy":"hit");
 const range=kind==="special"?4.6:kind==="kick"?2.25:kind==="heavy"?2.05:1.8;
 const hit=dist<range && !enemyF.dead;
 if(hit){const critical=Math.random()<.12;let damage=(f.data.atk*(kind==="punch"?.85:kind==="kick"?1.15:kind==="heavy"?1.7:2.25));damage*=critical?1.65:1;damage*=100/(100+enemyF.data.def*4);if(enemyF.blocking)damage*=.22;damage=Math.max(2,damage);
 enemyF.hp=Math.max(0,enemyF.hp-damage);enemyF.stun=enemyF.blocking?.12:kind==="heavy"?.5:.28;enemyF.root.position.x+=f.dir*(kind==="heavy"?.6:.28);enemyF.flash=.16;spawnBurst(enemyF.root.position.clone().add(new THREE.Vector3(0,1.3,.15)),kind==="special"?f.data.color:0xffcf8a,critical?26:12);shake=critical?.25:.12;
 if(f===player){combo++;comboTimer=1.25;energy=clamp(energy+(kind==="special"?0:5),0,100);$("#combatHint").textContent=(critical?"CRITICAL! ": "")+(combo>1?combo+" HIT COMBO":"HIT!");showHint();}
 }else if(f===player){$("#combatHint").textContent="OUT OF RANGE";showHint();}
 updateHud();if(enemy.hp<=0)finish(true);else if(player.hp<=0)finish(false);
}
function setBlock(f,on){if(!active||paused)return;f.blocking=on;if(on){f.anim="block";}}
function dodge(f){if(!active||paused||f.attackCd>.2)return;f.root.position.x=clamp(f.root.position.x-f.dir*1.0,-5.5,5.5);f.anim="dodge";f.animTime=0;f.attackCd=.35;spawnBurst(f.root.position.clone().add(new THREE.Vector3(0,.5,0)),0x91c8d9,8);}
function finish(win){if(!active)return;active=false;$("#hud").classList.add("hidden");$("#result").classList.remove("hidden");if(win){const reward=mode==="boss"?120:mode==="story"?55:30;save.coins+=reward;save.xp+=mode==="story"?70:35;save.wins++;if(save.xp>=save.level*100){save.xp-=save.level*100;save.level++;toast("LEVEL UP!");}if(mode==="story"){save.chapter=Math.min(9,save.chapter+1);if(save.chapter>=3&&!save.unlocked.includes(1))save.unlocked.push(1);}$("#resultTitle").textContent="VICTORY";$("#resultText").textContent=`${enemy.data.name} has fallen. You earned ${reward} coins and ${mode==="story"?"70":"35"} XP.`;audio("win");}else{save.losses++;$("#resultTitle").textContent="DEFEAT";$("#resultText").textContent="The shadows endure. Regroup, improve your skills, and return stronger.";audio("lose");}persist();}
function enemyThink(dt){if(!active||paused||enemy.dead)return;enemy.attackCd=Math.max(0,enemy.attackCd-dt);enemy.stun=Math.max(0,enemy.stun-dt);const d=player.root.position.x-enemy.root.position.x,dist=Math.abs(d);enemy.dir=d>0?1:-1;enemy.blocking=false;if(enemy.stun>0)return;
 if(dist>1.65){enemy.root.position.x+=Math.sign(d)*dt*(mode==="boss"?1.35:1.05);enemy.anim="walk";}
 else if(enemy.attackCd<=0){if(Math.random()<.14&&player.anim==="heavy")enemy.blocking=true;else attack(enemy,Math.random()<(mode==="boss"?.3:.18)?"heavy":Math.random()<.5?"kick":"punch");}
}
function animateFighter(f,t,dt){f.attackCd=Math.max(0,f.attackCd-dt);f.stun=Math.max(0,f.stun-dt);f.flash=Math.max(0,f.flash-dt);f.animTime+=dt;const p=f.parts;const moving=f.anim==="walk"||f===player&&Math.abs(stick.x)>.12;
 const phase=t*7+(f===enemy?1:0);p.legL.rotation.x=moving?Math.sin(phase)*.55:Math.sin(t*2)*.04;p.legR.rotation.x=moving?Math.sin(phase+Math.PI)*.55:-Math.sin(t*2)*.04;
 p.upperL.rotation.z=f.blocking?-.85:Math.sin(t*2)*.04;p.upperR.rotation.z=f.blocking?.85:Math.sin(t*2)*.04;
 p.body.rotation.y=0;p.body.position.y=Math.sin(t*2.2)*.025;
 if(f.anim==="punch"||f.anim==="heavy"||f.anim==="special"){const dur=f.anim==="heavy"?.42:f.anim==="special"?.55:.28;const a=clamp(f.animTime/dur,0,1);p.upperR.rotation.z=-Math.sin(a*Math.PI)*1.55;p.fistR.position.x=.53+Math.sin(a*Math.PI)*.38;p.weapon.rotation.z=-.38-Math.sin(a*Math.PI)*.8;if(a>=1){f.anim="idle";p.fistR.position.x=.53;p.weapon.rotation.z=-.38;}}
 else if(f.anim==="kick"){const a=clamp(f.animTime/.42,0,1);p.legR.rotation.x=-Math.sin(a*Math.PI)*1.45;if(a>=1)f.anim="idle";}
 else if(f.anim==="dodge"){f.root.rotation.z=Math.sin(clamp(f.animTime/.3,0,1)*Math.PI)*.22;if(f.animTime>.3){f.root.rotation.z=0;f.anim="idle";}}
 else if(f.anim==="block"){p.upperL.rotation.z=-.8;p.upperR.rotation.z=.8;}
 else if(f.anim==="hit"&&f.animTime>.22)f.anim="idle";
 p.aura.rotation.z=t*.4;
 if(f.flash>0){p.aura.material.opacity=.9;}else p.aura.material.opacity=.45;
}
function updatePlayer(dt){if(!active||paused)return;player.attackCd=Math.max(0,player.attackCd-dt);player.stun=Math.max(0,player.stun-dt);if(player.stun>0)return;
 if(Math.abs(stick.x)>.08){player.root.position.x=clamp(player.root.position.x+stick.x*dt*3.3,-5.7,5.7);player.dir=stick.x>0?1:-1;if(player.attackCd<=0)player.anim="walk";}
 if(keys.ArrowLeft||keys.a){player.root.position.x=clamp(player.root.position.x-dt*3.3,-5.7,5.7);}if(keys.ArrowRight||keys.d){player.root.position.x=clamp(player.root.position.x+dt*3.3,-5.7,5.7);}
 if(player.root.position.x<enemy.root.position.x)player.dir=1;else player.dir=-1;
 energy=clamp(energy+dt*3.3,0,100);
}
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.04,(now-lastTime)/1000||0);lastTime=now;elapsed+=dt;if(active&&!paused){updatePlayer(dt);enemyThink(dt);for(const f of fighters)animateFighter(f,elapsed,dt);if(comboTimer>0)comboTimer-=dt;else combo=0;updateHud();}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.mesh.position.addScaledVector(p.vel,dt);p.vel.y-=4*dt;p.mesh.material.opacity=clamp(p.life,0,1);if(p.life<=0){scene.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();particles.splice(i,1);}}
 if(shake>0){camera.position.x=(Math.random()-.5)*shake;shake=Math.max(0,shake-dt);}else camera.position.x+=(0-camera.position.x)*.15;
 if(fighters.length){const mid=(player.root.position.x+enemy.root.position.x)/2;camera.position.x+=(mid*.12-camera.position.x)*.04;camera.lookAt(mid*.12,1.15,0);}
 stars.rotation.y+=dt*.004;renderer.render(scene,camera);}
requestAnimationFrame(loop);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,save.settings.quality==="LOW"?.85:1.5));});
addEventListener("keydown",e=>{keys[e.key]=true;if(e.repeat)return;const map={j:"punch",k:"kick",l:"heavy",u:"special",i:"block", " ":"jump"};const a=map[e.key.toLowerCase()];if(a)doAction(a);if(e.key==="Escape")pauseGame();});
addEventListener("keyup",e=>{keys[e.key]=false;if(e.key.toLowerCase()==="i"&&player)setBlock(player,false);});
function doAction(a){if(!active||paused)return;if(a==="block"){setBlock(player,true);return;}if(a==="dodge"){dodge(player);return;}if(a==="jump"){player.root.position.y=.45;player.anim="jump";setTimeout(()=>{if(player){player.root.position.y=0;player.anim="idle";}},360);return;}attack(player,a);}
$$("[data-action]").forEach(b=>{const a=b.dataset.action;b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);doAction(a);});if(a==="block"){b.addEventListener("pointerup",()=>player&&setBlock(player,false));b.addEventListener("pointercancel",()=>player&&setBlock(player,false));}});
const stickEl=$("#stick"),knob=stickEl.querySelector(".stick-knob");let stickPointer=null;
stickEl.addEventListener("pointerdown",e=>{stickPointer=e.pointerId;stickEl.setPointerCapture(e.pointerId);moveStick(e);});
stickEl.addEventListener("pointermove",e=>{if(e.pointerId===stickPointer)moveStick(e);});
function moveStick(e){const r=stickEl.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.34,len=Math.hypot(dx,dy)||1;stick.x=clamp(dx/max,-1,1);stick.y=clamp(dy/max,-1,1);knob.style.transform=`translate(${clamp(dx,-max,max)}px,${clamp(dy,-max,max)}px)`;}
function resetStick(){stickPointer=null;stick.x=stick.y=0;knob.style.transform="translate(0,0)";}stickEl.addEventListener("pointerup",resetStick);stickEl.addEventListener("pointercancel",resetStick);
function pauseGame(){if(!active)return;paused=!paused;$("#pausePanel").classList.toggle("hidden",!paused);}
$("#pauseBtn").onclick=pauseGame;$("#resumeBtn").onclick=pauseGame;$("#quitBtn").onclick=()=>{active=false;paused=false;$("#hud").classList.add("hidden");$("#pausePanel").classList.add("hidden");$("#menu").classList.remove("hidden");clearFighters();};
$("#continueBtn").onclick=()=>{$("#result").classList.add("hidden");$("#menu").classList.remove("hidden");clearFighters();};
$$("[data-mode]").forEach(b=>b.onclick=()=>startBattle(b.dataset.mode));
let fighterIndex=save.selected;
function showFighter(){const c=characters[fighterIndex];$("#fighterName").textContent=c.name+" · "+c.title;$("#fighterDesc").textContent=c.desc;$("#fighterStats").innerHTML=`<span>HP ${c.hp}</span><span>ATK ${c.atk}</span><span>DEF ${c.def}</span><span>${c.element}</span>`;$("#fighterCount").textContent=`${fighterIndex+1} / ${characters.length}`;$("#selectFighter").textContent=save.unlocked.includes(fighterIndex)?"SELECT FIGHTER":`UNLOCK · ${100+fighterIndex*35} ◈`;}
$("#charactersBtn").onclick=()=>{fighterIndex=save.selected;$("#menu").classList.add("hidden");$("#fighterPanel").classList.remove("hidden");showFighter();};
$("#prevFighter").onclick=()=>{fighterIndex=(fighterIndex+14)%15;showFighter();};$("#nextFighter").onclick=()=>{fighterIndex=(fighterIndex+1)%15;showFighter();};
$("#selectFighter").onclick=()=>{if(!save.unlocked.includes(fighterIndex)){const cost=100+fighterIndex*35;if(save.coins<cost){toast("Not enough coins");return;}save.coins-=cost;save.unlocked.push(fighterIndex);toast("Fighter unlocked!");}save.selected=fighterIndex;persist();showFighter();toast(characters[fighterIndex].name+" selected");};
$$(".back").forEach(b=>b.onclick=()=>{$("#fighterPanel").classList.add("hidden");$("#infoPanel").classList.add("hidden");$("#menu").classList.remove("hidden");});
function info(title,eyebrow,html){$("#menu").classList.add("hidden");$("#fighterPanel").classList.add("hidden");$("#infoPanel").classList.remove("hidden");$("#infoTitle").textContent=title;$("#infoEyebrow").textContent=eyebrow;$("#infoBody").innerHTML=html;}
$("#weaponsBtn").onclick=()=>info("ARSENAL","WEAPON FORGE",weapons.map((w,i)=>`<p><b>${w[0]}</b> · ${Math.round(w[1]*100)}% damage ${save.weapon===i?"<span style='color:#e8b96c'> · EQUIPPED</span>":""}<br><button data-weapon="${i}">${save.weapon===i?"EQUIPPED":save.coins>=w[2]?"UNLOCK · "+w[2]+" ◈":"COST · "+w[2]+" ◈"}</button></p>`).join("")+`<p>Upgrade weapon · current level ${save.weaponLevel}<br><button id="upgradeWeapon">UPGRADE · ${100+save.weaponLevel*100} ◈</button></p>`);
$("#infoBody").addEventListener("click",e=>{const b=e.target.closest("[data-weapon]");if(b){const i=+b.dataset.weapon;if(save.weapon===i)return;const cost=weapons[i][2];if(save.coins<cost){toast("Not enough coins");return;}save.coins-=cost;save.weapon=i;persist();$("#weaponsBtn").click();toast("Weapon equipped");}});
$("#skillsBtn").onclick=()=>info("SKILL TREE","TRAIN YOUR LEGEND",`<p>Spend coins to strengthen your warrior. Each upgrade costs ${"50"} coins.</p>`+Object.entries({attack:"Attack",defense:"Defense",health:"Vitality",energy:"Energy recovery"}).map(([k,v])=>`<p><b>${v}</b> · Rank ${save.skills[k]}<br><button data-skill="${k}">UPGRADE · 50 ◈</button></p>`).join(""));
$("#infoBody").addEventListener("click",e=>{const b=e.target.closest("[data-skill]");if(b){if(save.coins<50){toast("Not enough coins");return;}save.coins-=50;save.skills[b.dataset.skill]++;persist();$("#skillsBtn").click();toast("Skill improved");}});
$("#profileBtn").onclick=()=>info("PLAYER PROFILE","YOUR LEGEND",`<div class="profile-grid"><div><b>${save.level}</b>LEVEL</div><div><b>${save.xp}</b>XP</div><div><b>${save.wins}</b>WINS</div><div><b>${save.losses}</b>LOSSES</div><div><b>${save.coins}</b>COINS</div><div><b>${save.chapter+1}/10</b>CHAPTER</div></div><p>Unlocked fighters: ${save.unlocked.map(i=>characters[i].name).join(", ")}</p><p>Story: The Void has awakened beneath the Ancient Temple. Kairo must cross the five kingdoms and gather the lost seals before the Void Emperor rises.</p><button id="resetSave">RESET ALL PROGRESS</button>`);
$("#infoBody").addEventListener("click",e=>{if(e.target.id==="resetSave"&&confirm("Reset all local game progress?")){localStorage.removeItem("swl-save");location.reload();}});
$("#settingsBtn").onclick=()=>info("SETTINGS","GAME OPTIONS",`<p>Graphics quality<br><select id="quality" style="width:100%;padding:12px;background:#1a2233;color:white"><option>AUTO</option><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></p><p>Sound effects<br><button id="toggleSound">${save.settings.sound?"SOUND ON":"SOUND OFF"}</button></p><p>Performance mode<br><button id="toggleFps">${save.settings.fps} FPS TARGET</button></p><p><button id="fullscreen">FULLSCREEN</button></p><p>Quality changes rendering resolution. 60 FPS is a target, not a guarantee.</p>`);
$("#infoBody").addEventListener("click",e=>{if(e.target.id==="toggleSound"){save.settings.sound=!save.settings.sound;persist();$("#settingsBtn").click();}if(e.target.id==="toggleFps"){save.settings.fps=save.settings.fps===30?60:30;persist();$("#settingsBtn").click();}if(e.target.id==="fullscreen"){document.documentElement.requestFullscreen?.();}});
$("#infoBody").addEventListener("change",e=>{if(e.target.id==="quality"){save.settings.quality=e.target.value;renderer.setPixelRatio(Math.min(devicePixelRatio,e.target.value==="LOW"?.75:e.target.value==="MEDIUM"?1:1.5));persist();toast("Graphics setting saved");}});
$("#soundBtn").onclick=()=>{save.settings.sound=!save.settings.sound;persist();$("#soundBtn").textContent=save.settings.sound?"♫":"×";toast(save.settings.sound?"Sound on":"Sound off");};
