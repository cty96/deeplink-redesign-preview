/* Slow orbital motion with the thin, illustrated card surfaces from the approved Figma artwork. */
import * as THREE from './vendor/three-r180/three.module.js';
import {config,createOperatorRing,createHeroCamera,frameCamera} from './home-operator-orbit.js?v=20261118-figma-static';
import {staticRing} from './home-operator-static-poses.js?v=20261118-static-card-view';
const scenes=new Map();
const names=['MatMul','Softmax','LayerNorm','Attention','GELU','Reduce'];
// Card artwork follows Figma 5718:2664, 5718:2777 and 5718:2816 in native 260 × 480 units.
const graphImage=new Image(220,260);
graphImage.src=new URL('../home-assets/figma-review-20261118/ca8d3.svg',import.meta.url).href;
await graphImage.decode();
function faceTexture(index){
  const canvas=document.createElement('canvas');canvas.width=468;canvas.height=864;
  const ctx=canvas.getContext('2d'),kind=index%3;
  ctx.scale(1.8,1.8);ctx.textBaseline='top';
  const gradient=ctx.createLinearGradient(0,0,0,480);
  gradient.addColorStop(0,'#eaf4ff');gradient.addColorStop(1,'#a7c8f2');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,260,480);
  ctx.strokeStyle='#d3e9ff';ctx.lineWidth=1.8;ctx.beginPath();ctx.roundRect(.9,.9,258.2,478.2,9.1);ctx.stroke();
  const font='"PingFang SC",Arial,sans-serif';
  ctx.font='10px '+font;ctx.fillStyle='#6c96ce';ctx.fillText('•••',21.8,17.8);
  ctx.fillStyle='#5a7eaf';ctx.fillText(['INPUT TENSOR','COMPUTE GRAPH','GENERATED KERNEL'][kind],21.8,45.8);
  ctx.font='500 22px '+font;ctx.fillStyle='#315e9e';ctx.fillText(names[index%6],21.8,73.8);
  ctx.save();ctx.translate(21.8,118.8);
  ctx.beginPath();ctx.rect(0,0,220,285);ctx.clip();
  if(kind===0){
    const palette=['#4c8fe7','#b0d2fa','#8ebaf6','#6aa3ed'];
    for(let row=0;row<6;row++)for(let col=0;col<8;col++){
      ctx.fillStyle=palette[(row+col)%4];ctx.fillRect(col*28,36+row*31,24,26);
    }
    ctx.font='13px '+font;ctx.fillStyle='#315e9e';ctx.fillText('M × K · K × N',0,249);
  }else if(kind===1){
    ctx.drawImage(graphImage,0,0,220,260);
    const cells=[[4,28,'A'],[4,192,'B'],[87,110,'×'],[170,28,'+'],[170,192,'σ']];
    cells.forEach(([x,y,text],i)=>{
      ctx.fillStyle=i===2?'#417fe7':'#edf5ff';ctx.beginPath();ctx.roundRect(x,y,42,40,7);ctx.fill();
      ctx.fillStyle=i===2?'#fff':'#42628d';ctx.font='15px '+font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x+21,y+20);
    });
  }else{
    ctx.font='14px '+font;ctx.fillStyle='#315a91';
    ['@triton.jit','def fused(A, B, C):','  a = tl.load(A)','  b = tl.load(B)','  c = tl.dot(a, b)','  tl.store(C, c)'].forEach((text,i)=>ctx.fillText(text,0,38+i*31.7));
  }
  ctx.restore();ctx.font='11px '+font;ctx.fillStyle='#5279ad';ctx.fillText(['Tensor → Operator','Fuse · Schedule · Lower','Ready to execute'][kind],21.8,417.8);
  ctx.fillStyle='#edf5ff';ctx.fillRect(21.8,447.8,220,2);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;return texture;
}
function initializeFigmaStatic(hero){
  const art=document.createElement('div');art.className='operator-motion operator-figma-static';
  art.setAttribute('role','img');art.setAttribute('aria-label','Figma 设计稿中的静态算子圆环');
  const image=document.createElement('img');image.className='operator-figma-static-art';
  image.src=new URL('../home-assets/home-ring-figma-static-20261118.png',import.meta.url).href;
  image.width=878;image.height=424;image.alt='';image.decoding='async';
  art.append(image);hero.append(art);hero.classList.add('has-operator-motion');
  hero.dataset.operatorMode='static';hero.dataset.operatorRenderer='figma-image';
  hero.dataset.textTone='inverse';
  return {dispose(){art.remove();hero.classList.remove('has-operator-motion');delete hero.dataset.operatorMode;delete hero.dataset.operatorRenderer;}};
}

function initializeStatic(hero){
  const art=document.createElement('div');art.className='operator-motion';
  const stage=document.createElement('div');stage.className='operator-motion-scene operator-static-scene';
  stage.setAttribute('role','img');stage.setAttribute('aria-label','静态算子圆环预览：按照设计稿修改后的整体三维角度斜立，24张卡片保持静止');
  const ring=document.createElement('div');ring.className='operator-static-ring';
  // Keep the approved ring plane and positions; orient each card independently below.
  // Match the normal of Figma's revised circle without adding an in-plane spin.
  const orientation=staticRing.orientation;
  let ringRotation=new THREE.Quaternion();
  if(orientation){
    const rotation=orientation.referenceRotation,rad=THREE.MathUtils.degToRad;
    const targetNormal=new THREE.Vector3(0,0,1).applyEuler(new THREE.Euler(rad(rotation.rotateX),rad(rotation.rotateY),rad(rotation.rotateZ),'XYZ'));
    const delta=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...orientation.sourceNormal).normalize(),targetNormal.normalize());
    ringRotation.copy(delta);
    const matrix=new THREE.Matrix4().makeRotationFromQuaternion(delta);
    ring.style.transformOrigin=orientation.center.map(value=>value+'px').join(' ');
    stage.style.perspective=staticRing.perspective+'px';
    ring.style.transform='translate3d('+orientation.framingTranslation.map(value=>value+'px').join(',')+') matrix3d('+matrix.elements.join(',')+')';
    ring.dataset.orientationReference=orientation.referenceNode;
  }

  const images=new Map();
  const inverseRing=ringRotation.clone().invert(),view=staticRing.cardViewing,rad=THREE.MathUtils.degToRad;
  for(const pose of staticRing.cards){
    const pattern=pose.index%6;
    if(!images.has(pattern)){
      const texture=faceTexture(pattern);images.set(pattern,texture.image.toDataURL('image/png'));texture.dispose();
    }
    const card=document.createElement('div');card.className='operator-static-card';
    card.dataset.card=String(pose.index+1);card.dataset.source=pose.userAdjusted?'figma-edited':'completed-arc';
    card.style.left=pose.x+'px';card.style.top=pose.y+'px';
    if(view){
      const radial=new THREE.Vector3(pose.x+pose.width/2,pose.y+pose.height/2,pose.translateZ)
        .sub(new THREE.Vector3(...orientation.center)).applyQuaternion(ringRotation).normalize();
      // Near cards open toward the viewer; far cards turn further away along the arc.
      // Keep a common upright direction instead of inheriting the ring's large roll.
      const yaw=view.baseYaw+radial.x*(radial.z>=0?view.nearYawSpread:view.farYawSpread);
      const pitch=view.pitch+radial.y*view.pitchSpread,roll=view.roll+radial.y*view.rollSpread;
      const worldRotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(pitch),rad(yaw),rad(roll),'XYZ'));
      const localRotation=inverseRing.clone().multiply(worldRotation);
      const matrix=new THREE.Matrix4().makeRotationFromQuaternion(localRotation);
      card.style.transform=`translateZ(${pose.translateZ}px) matrix3d(${matrix.elements.join(',')})`;
      card.dataset.view='three-quarter';
    }else{
      card.style.transform=`translateZ(${pose.translateZ}px) rotateX(${pose.rotateX}deg) rotateY(${pose.rotateY}deg) rotateZ(${pose.rotateZ}deg)`;
    }
    for(const side of ['front','back']){
      const face=document.createElement('div');face.className='operator-static-face '+side;
      face.style.backgroundImage=`url("${images.get(pattern)}")`;
      const sourceFace=pose.faces?.[side==='front'?0:1];
      if(sourceFace&&!view){
        const f=sourceFace.transform3d;
        face.style.left=sourceFace.x+'px';face.style.top=sourceFace.y+'px';
        face.style.transform=`translateZ(${f.translateZ}px) rotateX(${f.rotateX}deg) rotateY(${f.rotateY}deg) rotateZ(${f.rotateZ}deg)`;
      }
      card.append(face);
    }
    ring.append(card);
  }
  stage.append(ring);art.append(stage);hero.append(art);hero.classList.add('has-operator-motion');
  hero.dataset.operatorMode='static';hero.dataset.operatorRenderer='css3d';
  return {dispose(){art.remove();hero.classList.remove('has-operator-motion');delete hero.dataset.operatorMode;delete hero.dataset.operatorRenderer;}};
}

function initialize(hero){
  if(config.figmaStaticArtwork)return initializeFigmaStatic(hero);
  if(config.staticPreview)return initializeStatic(hero);
  const art=document.createElement('div');art.className='operator-motion';
  const stage=document.createElement('div');stage.className='operator-motion-scene';
  stage.setAttribute('role','img');stage.setAttribute('aria-label','缓缓转动的算子圆环：'+config.count+'张浅蓝渐变卡片沿圆周排列，展示矩阵计算、计算图和算子代码');
  art.append(stage);hero.append(art);hero.classList.add('has-operator-motion');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}
  catch(error){art.remove();hero.classList.remove('has-operator-motion');console.error('Operator artwork renderer unavailable',error);return {dispose(){}};}
  renderer.setSize(config.width,config.height);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NoToneMapping;
  renderer.domElement.className='operator-3d-canvas';renderer.domElement.setAttribute('aria-hidden','true');stage.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=createHeroCamera(THREE),textures=[],materials=[];
  const model=createOperatorRing(THREE,index=>{
    const frontMap=faceTexture(index),backMap=faceTexture(index);textures.push(frontMap,backMap);
    const front=new THREE.MeshBasicMaterial({map:frontMap}),back=new THREE.MeshBasicMaterial({map:backMap});
    materials.push(front,back);return {front,back};
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
    hero.dataset.operatorMode=paused?'paused':'animated';inspection.mode=hero.dataset.operatorMode;
    render();if(canAnimate())frame=requestAnimationFrame(animate);
  }
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
  reduced.addEventListener('change',handlePreference);
  document.addEventListener('visibilitychange',updatePlayback);
  renderer.domElement.addEventListener('webglcontextlost',handleContextLost);
  renderer.domElement.addEventListener('webglcontextrestored',handleContextRestored);
  const visibility='IntersectionObserver' in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updatePlayback();},{threshold:0}):null;
  visibility?.observe(hero);updatePlayback();
  return {dispose(){
    disposed=true;if(frame)cancelAnimationFrame(frame);resize.disconnect();visibility?.disconnect();
    reduced.removeEventListener('change',handlePreference);document.removeEventListener('visibilitychange',updatePlayback);
    renderer.domElement.removeEventListener('webglcontextlost',handleContextLost);renderer.domElement.removeEventListener('webglcontextrestored',handleContextRestored);
    model.geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());textures.forEach(texture=>texture.dispose());renderer.dispose();
    art.remove();hero.classList.remove('has-operator-motion');delete hero.dataset.operatorMode;delete hero.dataset.operatorRenderer;
    if(window.DeepLinkHero3D===inspection)delete window.DeepLinkHero3D;
  }};
}
function scan(){
  for(const [hero,view]of scenes)if(!hero.isConnected){view.dispose();scenes.delete(hero);}
  document.querySelectorAll('.fd-navigation-wrap .revision-brand').forEach(hero=>{if(!scenes.has(hero))scenes.set(hero,initialize(hero));});
}
scan();new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
