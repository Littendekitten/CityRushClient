const SKIN = {light:0xf4d5bd,warm:0xe8b58f,medium:0xc98e68,tan:0xa96f4d,deep:0x704632};
const HAIR = {black:0x17191f,brown:0x4b2f24,blonde:0xd9b46b,auburn:0x8e422c,blue:0x315eae,silver:0x9aa3b0};
const TOP = {"city-blue":0x2d5787,orange:0xe36e32,black:0x242832,red:0x9f3439,forest:0x315e48,violet:0x62418c,white:0xe6e8ed};
const PANTS = {navy:0x273650,charcoal:0x343a43,black:0x20232b,khaki:0x8d815d,denim:0x405b7c};
const SHOES = {black:0x17191e,white:0xe7e9ed,brown:0x523b2b,red:0x9b3636};
const makeMat = (THREE,color,roughness=.72,metalness=.02) => new THREE.MeshStandardMaterial({color,roughness,metalness});
function mesh(THREE,geometry,material,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m;}
function segment(THREE,group,material,radius,length,y){const m=mesh(THREE,new THREE.CylinderGeometry(radius*.92,radius,length,16),material,0,y,0);group.add(m);return m;}
export default {
 id:"character-mod", name:"CharacterMod", description:"Per-instance character creator with a clean detailed avatar model.",
 init(api){
  if(!api.betterGraphicsEnabled) throw new Error("CharacterMod requires BetterGraphics.");
  if(!api.THREE||!api.player) throw new Error("CharacterMod needs the CityRush player model API.");
  const THREE=api.THREE,player=api.player,config=api.modConfig?.character||{};
  const defaults={style:"masculine",skin:"medium",hairStyle:"short",hairColor:"brown",shirt:"city-blue",pants:"navy",shoes:"black"};
  const c={...defaults,...config};
  const skin=makeMat(THREE,SKIN[c.skin]??SKIN.medium),hair=makeMat(THREE,HAIR[c.hairColor]??HAIR.brown),shirt=makeMat(THREE,TOP[c.shirt]??TOP["city-blue"]),pants=makeMat(THREE,PANTS[c.pants]??PANTS.navy),shoes=makeMat(THREE,SHOES[c.shoes]??SHOES.black),white=makeMat(THREE,0xf5f7fb,.28),dark=makeMat(THREE,0x20242d,.36),iris=makeMat(THREE,0x416f8d,.3),lip=makeMat(THREE,0x854d4b,.55);
  const previous=player.children.map(child=>({child,visible:child.visible}));
  previous.forEach(entry=>entry.child.visible=false);
  const root=new THREE.Group();root.name="CityRushCharacterModRig";player.add(root);
  const torsoWidth=c.style==="masculine"?0.36:c.style==="feminine"?0.305:0.33;
  const torso=mesh(THREE,new THREE.CylinderGeometry(torsoWidth*.88,torsoWidth,.82,24,1,false),shirt,0,1.22,0);torso.scale.set(1,1,0.82);root.add(torso);
  const pelvis=mesh(THREE,new THREE.BoxGeometry(.47,.25,.29),pants,0,.76,0);root.add(pelvis);
  const neck=mesh(THREE,new THREE.CylinderGeometry(.085,.095,.16,16),skin,0,1.69,0);root.add(neck);
  const head= new THREE.Group();head.position.y=1.98;root.add(head);
  const face=mesh(THREE,new THREE.SphereGeometry(.245,28,20),skin,0,0,0);face.scale.set(.9,1.08,.88);head.add(face);
  // Ears, eyes, brows, nose and mouth are placed on a single forward-facing (+Z) plane.
  for(const side of [-1,1]){
   const ear=mesh(THREE,new THREE.SphereGeometry(.055,14,10),skin,side*.226,-.005,0);ear.scale.set(.65,1,.65);head.add(ear);
   const eye=mesh(THREE,new THREE.SphereGeometry(.047,16,12),white,side*.078,.045,.198);eye.scale.set(1,1.05,.48);head.add(eye);
   const pupil=mesh(THREE,new THREE.SphereGeometry(.022,14,10),iris,side*.078,.044,.219);head.add(pupil);
   const brow=mesh(THREE,new THREE.BoxGeometry(.085,.018,.025),hair,side*.078,.105,.197);head.add(brow);
  }
  const nose=mesh(THREE,new THREE.SphereGeometry(.043,14,10),skin,0,-.015,.221);nose.scale.set(.72,.8,.82);head.add(nose);
  const mouth=mesh(THREE,new THREE.BoxGeometry(.075,.012,.014),lip,0,-.092,.212);head.add(mouth);
  // Hair uses one continuous cap plus optional side/back locks, avoiding stacked face meshes.
  if(c.hairStyle!=="none"){
   const cap=mesh(THREE,new THREE.SphereGeometry(.25,24,16,0,Math.PI*2,0,Math.PI*.56),hair,0,.085,-.012);head.add(cap);
   if(c.hairStyle==="long"){
    for(const side of [-1,1]){const lock=mesh(THREE,new THREE.SphereGeometry(.09,16,12),hair,side*.19,-.12,-.025);lock.scale.set(.75,1.65,.85);head.add(lock)}
    const back=mesh(THREE,new THREE.SphereGeometry(.19,18,14),hair,0,-.12,-.12);back.scale.set(1,1.45,.65);head.add(back);
   }else if(c.hairStyle==="curly"){
    for(let i=0;i<7;i++){const angle=i/7*Math.PI*2;const curl=mesh(THREE,new THREE.SphereGeometry(.085,12,10),hair,Math.cos(angle)*.17,.16,Math.sin(angle)*.13-.01);head.add(curl)}
   }else if(c.hairStyle==="slick"){
    const sweep=mesh(THREE,new THREE.SphereGeometry(.15,16,12),hair,0,.14,.12);sweep.scale.set(1,.55,.72);head.add(sweep);
   }else if(c.hairStyle==="buzz"){
    cap.scale.set(1,.68,1);
   }
  }
  // Clothing seams and collar details add definition without intersecting the face or torso.
  const collar=mesh(THREE,new THREE.TorusGeometry(.105,.022,8,18),dark,0,1.595,.015);collar.rotation.x=Math.PI/2;root.add(collar);
  const zipper=mesh(THREE,new THREE.BoxGeometry(.012,.42,.012),dark,0,1.22,.274);root.add(zipper);
  const leftArm=new THREE.Group(),rightArm=new THREE.Group();leftArm.position.set(-torsoWidth-.045,1.48,0);rightArm.position.set(torsoWidth+.045,1.48,0);root.add(leftArm,rightArm);
  const arms=[leftArm,rightArm];
  for(const arm of arms){segment(THREE,arm,shirt,.105,.42,-.22);const elbow=mesh(THREE,new THREE.SphereGeometry(.084,14,10),shirt,0,-.43,0);arm.add(elbow);segment(THREE,arm,skin,.073,.29,-.61);const hand=mesh(THREE,new THREE.SphereGeometry(.075,14,10),skin,0,-.79,.015);hand.scale.set(.85,1.1,.8);arm.add(hand);}
  const leftLeg=new THREE.Group(),rightLeg=new THREE.Group();leftLeg.position.set(-.135,.9,0);rightLeg.position.set(.135,.9,0);root.add(leftLeg,rightLeg);const legs=[leftLeg,rightLeg];
  // Raise the leg pivots so shoes sit on the ground rather than intersecting the floor.
  for(const leg of legs){segment(THREE,leg,pants,.105,.44,-.21);const knee=mesh(THREE,new THREE.SphereGeometry(.09,14,10),pants,0,-.42,0);leg.add(knee);segment(THREE,leg,pants,.078,.4,-.61);const ankle=mesh(THREE,new THREE.SphereGeometry(.08,12,10),pants,0,-.8,0);leg.add(ankle);const shoe=mesh(THREE,new THREE.BoxGeometry(.23,.12,.34),shoes,0,-.85,.075);leg.add(shoe);const sole=mesh(THREE,new THREE.BoxGeometry(.232,.025,.345),dark,0,-.914,.075);leg.add(sole);}
  // Outfit sleeves and subtle shoulder panels.
  for(const side of [-1,1]){const panel=mesh(THREE,new THREE.BoxGeometry(.045,.28,.018),dark,side*(torsoWidth-.035),1.25,.25);root.add(panel)}
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  api.characterRig={root,head,arms,legs};
  let raf=0,last=0,phase=0,lastPos=player.position.clone(),speed=0;
  function animate(ts){raf=requestAnimationFrame(animate);if(!api.characterRig||!api.characterRig.root)return;const dt=Math.min(.05,Math.max(.001,(ts-last)/1000||.016));last=ts;const dx=player.position.x-lastPos.x,dz=player.position.z-lastPos.z;lastPos.copy(player.position);const instant=Math.min(1,Math.hypot(dx,dz)/(dt*6.8));speed+=(instant-speed)*(1-Math.exp(-dt*12));if(speed>.035)phase+=dt*(5+speed*8);const gait=Math.sin(phase)*.72*speed;legs[0].rotation.x=gait;legs[1].rotation.x=-gait;arms[0].rotation.x=-gait*.76;arms[1].rotation.x=gait*.76;head.rotation.x=Math.sin(ts*.0014)*.012;torso.rotation.z=Math.sin(phase*2)*.012*speed;root.position.y=Math.abs(Math.sin(phase))*0.018*speed;}
  raf=requestAnimationFrame(animate);
  api.onModUnload(()=>{cancelAnimationFrame(raf);player.remove(root);root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}});previous.forEach(entry=>{entry.child.visible=entry.visible});api.characterRig=null;});
 }
};
