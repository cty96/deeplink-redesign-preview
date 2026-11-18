/* The approved ring geometry rotates gently; lighting keeps both faces readable. */
import * as THREE from './vendor/three-r180/three.module.js';
import {config,createOperatorRing,createHeroCamera,frameCamera} from './home-operator-orbit.js?v=20261117-batch-review-v13';
const scenes=new Map();
const names=['MatMul','Softmax','LayerNorm','Attention','GELU','Reduce'];
function faceTexture(index,reverse=false){
  const canvas=document.createElement('canvas');canvas.width=468;canvas.height=864;
  const ctx=canvas.getContext('2d'),kind=index%3;
  const gradient=ctx.createLinearGradient(0,0,468,864);
  gradient.addColorStop(0,reverse?'#eff7ff':'#f7fbff');gradient.addColorStop(1,reverse?'#c3dcfa':'#d5e7ff');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,468,864);
  ctx.globalAlpha=reverse?.88:1;
  ctx.fillStyle='#6c96ce';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(40+i*16,37,4,0,Math.PI*2);ctx.fill();}
  ctx.font='18px Menlo,Consolas,monospace';ctx.fillStyle='#5a7eaf';
  ctx.fillText(['INPUT TENSOR','COMPUTE GRAPH','GENERATED KERNEL'][kind],36,87);
  ctx.font='600 40px Arial,sans-serif';ctx.fillStyle='#315e9e';ctx.fillText(names[index%6],36,148);
  if(kind===0){
    for(let row=0;row<6;row++)for(let col=0;col<8;col++){
      ctx.fillStyle='hsl('+(212+(row+col)%5*3)+',78%,'+(57+(row*7+col*3+index)%25)+'%)';
      ctx.fillRect(36+col*50,239+row*55,43,47);
    }
    ctx.font='23px Menlo,monospace';ctx.fillStyle='#5279ad';ctx.fillText('M × K · K × N',36,647);ctx.fillText('Tensor → Operator',36,689);
  }else if(kind===1){
    ctx.lineWidth=4;ctx.strokeStyle='#74a1df';
    for(const [start,end]of [[310,460],[610,460],[460,310],[460,610]]){
      ctx.beginPath();ctx.moveTo(start===460?234:81,start);ctx.bezierCurveTo(170,start,290,end,start===460?390:234,end);ctx.stroke();
    }
    const cells=[[43,274,'A'],[43,574,'B'],[196,424,'×'],[352,274,'+'],[352,574,'σ']];
    cells.forEach(([x,y,text],i)=>{ctx.fillStyle=i===2?'#417fe7':'#edf5ff';ctx.beginPath();ctx.roundRect(x,y,76,72,12);ctx.fill();ctx.fillStyle=i===2?'#fff':'#42628d';ctx.font='28px Arial';ctx.textAlign='center';ctx.fillText(text,x+38,y+46);});
    ctx.textAlign='left';ctx.font='20px Menlo,monospace';ctx.fillStyle='#5279ad';ctx.fillText('Fuse · Schedule · Lower',36,742);
  }else{
    ctx.font='25px Menlo,Consolas,monospace';
    ['@triton.jit','def fused(A, B, C):','  a = tl.load(A)','  b = tl.load(B)','  c = tl.dot(a, b)','  tl.store(C, c)'].forEach((text,i)=>{ctx.fillStyle=i===0?'#1b60c9':'#315a91';ctx.fillText(text,36,272+i*57);});
    ctx.font='22px Menlo,monospace';ctx.fillStyle='#5279ad';ctx.fillText('Generated kernel',36,697);ctx.fillText('Ready to execute',36,739);
  }
  ctx.fillStyle='#edf5ff';ctx.fillRect(36,806,396,4);ctx.fillStyle='#4988ec';ctx.fillRect(36,806,240,4);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;return texture;
}
function initialize(hero){
  const art=document.createElement('div');art.className='operator-motion';
  const stage=document.createElement('div');stage.className='operator-motion-scene';
  stage.setAttribute('role','img');stage.setAttribute('aria-label','缓缓转动的三维算子圆环：'+config.count+'张玻璃卡片沿圆周排列，圆环整体倾斜，展示矩阵计算、计算图和算子代码');
  const toggle=document.createElement('button');toggle.type='button';toggle.className='operator-motion-toggle';
  art.append(stage);hero.append(art,toggle);hero.classList.add('has-operator-motion');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}
  catch(error){art.remove();toggle.remove();hero.classList.remove('has-operator-motion');console.error('Operator 3D renderer unavailable',error);return {dispose(){}};}
  renderer.setSize(config.width,config.height);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NoToneMapping;
  renderer.domElement.className='operator-3d-canvas';renderer.domElement.setAttribute('aria-hidden','true');stage.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=createHeroCamera(THREE),textures=[],materials=[];
  scene.add(new THREE.AmbientLight(0xffffff,.55));
  scene.add(new THREE.HemisphereLight(0xf5fbff,0xb6d2ff,1.1));
  const key=new THREE.DirectionalLight(0xffffff,1.8);key.position.set(-4,10,14);scene.add(key);
  const fill=new THREE.DirectionalLight(0xe3f1ff,1);fill.position.set(-10,4,-8);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xc9e7ff,1.4);rim.position.set(10,10,-10);scene.add(rim);
  const edge=new THREE.MeshPhysicalMaterial({color:0xd9eaff,metalness:.06,roughness:.16,clearcoat:1,clearcoatRoughness:.1});materials.push(edge);
  const model=createOperatorRing(THREE,index=>{
    const frontMap=faceTexture(index),backMap=faceTexture(index,true);textures.push(frontMap,backMap);
    const front=new THREE.MeshPhongMaterial({map:frontMap,specular:0xf5fbff,shininess:85}),back=new THREE.MeshPhongMaterial({map:backMap,specular:0xf5fbff,shininess:85});
    materials.push(front,back);return {edge,front,back};
  });
  scene.add(model.ring);let disposed=false,contextLost=false,visible=true,frame=0,lastTime=0,lastPaint=0,elapsed=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
  const angularSpeed=Math.PI*2/72;
  function render(){if(!disposed&&!contextLost)renderer.render(scene,camera);}
  function canAnimate(){return !disposed&&!contextLost&&!paused&&visible&&!document.hidden;}
  function animate(time){
    frame=0;if(!canAnimate()){lastTime=0;return;}
    if(lastTime)elapsed+=Math.min((time-lastTime)/1000,.1);
    lastTime=time;model.ring.rotation.y=config.phase+elapsed*angularSpeed;
    if(time-lastPaint>=1000/30){render();lastPaint=time;}
    frame=requestAnimationFrame(animate);
  }
  function updatePlayback(){
    if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;
    const label=paused?'播放动画':'暂停动画';toggle.textContent=label;toggle.setAttribute('aria-label',label);
    toggle.dataset.paused=String(paused);hero.dataset.operatorMode=paused?'paused':'animated';inspection.mode=hero.dataset.operatorMode;
    render();if(canAnimate())frame=requestAnimationFrame(animate);
  }
  const handleToggle=()=>{paused=!paused;updatePlayback();};
  const handlePreference=()=>{paused=reduced.matches;updatePlayback();};
  const handleContextLost=event=>{event.preventDefault();contextLost=true;updatePlayback();};
  const handleContextRestored=()=>{contextLost=false;updatePlayback();};
  hero.dataset.operatorRenderer='webgl';
  function resizeViewport(){
    const width=Math.round(stage.clientWidth);
    if(width>0){renderer.setSize(width,config.height);frameCamera(camera,width);render();}
  }
  const resize=new ResizeObserver(resizeViewport);resize.observe(stage);resizeViewport();
  const inspection={scene,camera,ring:model.ring,cards:model.cards,renderer,config,render,mode:'animated'};
  window.DeepLinkHero3D=inspection;
  toggle.addEventListener('click',handleToggle);reduced.addEventListener('change',handlePreference);
  document.addEventListener('visibilitychange',updatePlayback);
  renderer.domElement.addEventListener('webglcontextlost',handleContextLost);
  renderer.domElement.addEventListener('webglcontextrestored',handleContextRestored);
  const visibility='IntersectionObserver' in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updatePlayback();},{threshold:0}):null;
  visibility?.observe(hero);updatePlayback();
  return {dispose(){
    disposed=true;if(frame)cancelAnimationFrame(frame);resize.disconnect();visibility?.disconnect();
    toggle.removeEventListener('click',handleToggle);reduced.removeEventListener('change',handlePreference);document.removeEventListener('visibilitychange',updatePlayback);
    renderer.domElement.removeEventListener('webglcontextlost',handleContextLost);renderer.domElement.removeEventListener('webglcontextrestored',handleContextRestored);
    model.geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());textures.forEach(texture=>texture.dispose());renderer.dispose();
    art.remove();toggle.remove();hero.classList.remove('has-operator-motion');delete hero.dataset.operatorMode;delete hero.dataset.operatorRenderer;
    if(window.DeepLinkHero3D===inspection)delete window.DeepLinkHero3D;
  }};
}
function scan(){
  for(const [hero,view]of scenes)if(!hero.isConnected){view.dispose();scenes.delete(hero);}
  document.querySelectorAll('.fd-navigation-wrap .revision-brand').forEach(hero=>{if(!scenes.has(hero))scenes.set(hero,initialize(hero));});
}
scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
