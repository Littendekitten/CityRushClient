export default {
 id:"better-maps",name:"BetterMaps",description:"Resizable minimap, larger map view and a blue ground arrow for the active quest.",
 init(api){
  if(!api.worldSlicerEnabled) throw new Error("BetterMaps requires WorldSlicer.");
  const canvas=api.minimapCanvas;if(!canvas)throw new Error("Minimap canvas is unavailable.");
  const config=api.modConfig||{};const scale=Math.max(.7,Math.min(1.6,(Number(config.betterMapsScale)||100)/100));
  const mapKey=typeof config.betterMapsKeybind==="string"?config.betterMapsKeybind:"KeyN";
  const arrowKey=typeof config.betterMapsArrowKeybind==="string"?config.betterMapsArrowKeybind:"KeyG";
  let arrowEnabled=config.betterMapsQuestArrow!==false,mapOpen=false,mapRaf=0,tickFrame=0,disposed=false;
  canvas.style.width=`${130*scale}px`;canvas.style.height=`${130*scale}px`;canvas.style.transformOrigin="bottom left";canvas.style.zIndex="12";
  const overlay=document.createElement("div");overlay.id="cityrush-bettermaps-overlay";overlay.style.cssText="position:fixed;inset:0;z-index:10020;display:none;place-items:center;background:rgba(4,9,18,.88);backdrop-filter:blur(12px);padding:24px;color:#eef6ff;font:14px system-ui,sans-serif";
  overlay.innerHTML=`<section style="width:min(760px,94vw);max-height:92vh;overflow:auto;border:1px solid #427ca8;border-radius:20px;background:linear-gradient(145deg,#132238,#09121e);padding:18px;box-shadow:0 24px 80px #000b"><header style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px"><div><strong style="letter-spacing:.16em">CITY MAP</strong><div id="cityrush-bettermaps-hint" style="font-size:11px;opacity:.7"></div></div><button type="button" data-close style="border:1px solid #45617b;background:#22344b;color:#fff;border-radius:10px;padding:8px 12px;cursor:pointer">Close map</button></header><canvas width="520" height="520" style="display:block;width:min(68vh,82vw);height:min(68vh,82vw);margin:auto;border-radius:14px;border:1px solid #284965;background:#15263a"></canvas><footer style="text-align:center;opacity:.7;font-size:11px;margin-top:12px">Blue marker: you · red markers: traffic · gold markers: pickups/quest</footer></section>`;
  document.body.appendChild(overlay);overlay.querySelector("#cityrush-bettermaps-hint").textContent=`Local map view · press ${mapKey.replace(/^Key/,"")} to close`;const mapCanvas=overlay.querySelector("canvas"),mapCtx=mapCanvas.getContext("2d");
  const close=()=>{mapOpen=false;overlay.style.display="none"};const open=()=>{mapOpen=true;overlay.style.display="grid";};
  overlay.addEventListener("click",event=>{if(event.target===overlay||event.target.closest("[data-close]"))close()});
  const shape=new api.THREE.Shape();shape.moveTo(0,1.25);shape.lineTo(-.38,.2);shape.lineTo(-.14,.28);shape.lineTo(-.14,-.65);shape.lineTo(.14,-.65);shape.lineTo(.14,.28);shape.lineTo(.38,.2);shape.closePath();
  const arrowGeo=new api.THREE.ShapeGeometry(shape);const arrowMat=new api.THREE.MeshBasicMaterial({color:0x32baff,transparent:true,opacity:.94,depthWrite:false,side:api.THREE.DoubleSide});const arrow=new api.THREE.Mesh(arrowGeo,arrowMat);arrow.rotation.x=Math.PI/2;arrow.position.y=.12;arrow.renderOrder=12;arrow.visible=false;api.scene.add(arrow);
  function updateMap(){if(!mapOpen||disposed)return;mapCtx.clearRect(0,0,mapCanvas.width,mapCanvas.height);mapCtx.fillStyle="#14283c";mapCtx.fillRect(0,0,mapCanvas.width,mapCanvas.height);try{mapCtx.drawImage(canvas,0,0,mapCanvas.width,mapCanvas.height)}catch{};mapRaf=requestAnimationFrame(updateMap)}
  function onKeyDown(event){if(event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.target?.matches?.("input,textarea,select,[contenteditable=true]"))return;if(event.code===mapKey){event.preventDefault();event.stopImmediatePropagation();if(mapOpen)close();else{open();cancelAnimationFrame(mapRaf);updateMap()}}else if(event.code===arrowKey){event.preventDefault();event.stopImmediatePropagation();arrowEnabled=!arrowEnabled;}}
  window.addEventListener("keydown",onKeyDown,true);
  const tick=()=>{if(disposed)return;const target=api.getQuestTarget?.(),player=api.getPlayerPosition?.();if(arrowEnabled&&target&&player){const dx=target.x-player.x,dz=target.z-player.z,len=Math.hypot(dx,dz)||1;const dirX=dx/len,dirZ=dz/len;arrow.position.set(player.x+dirX*1.05,.13,player.z+dirZ*1.05);arrow.rotation.y=Math.atan2(dirX,dirZ);arrow.visible=true;}else arrow.visible=false;tickFrame=requestAnimationFrame(tick)};
  tickFrame=requestAnimationFrame(tick);
  api.betterMaps={open,close,setArrowEnabled(value){arrowEnabled=Boolean(value)},get arrowEnabled(){return arrowEnabled}};
  api.loadedMods=api.loadedMods||[];
  api.onModUnload(()=>{disposed=true;cancelAnimationFrame(mapRaf);cancelAnimationFrame(tickFrame);window.removeEventListener("keydown",onKeyDown,true);close();overlay.remove();arrow.removeFromParent();arrowGeo.dispose();arrowMat.dispose();canvas.style.width="";canvas.style.height="";api.betterMaps=null;});
 }
};
