/* Keep the approved circular layout and camera crop; cards are two thin, unlit faces. */
export const config=Object.freeze({
  staticPreview:true,
  figmaStaticArtwork:true,
  count:24,radius:8,cardWidth:2.6,cardHeight:4.8,thickness:.002,cornerRadius:.1,
  width:1280,height:700,elevation:40,roll:6,distance:14,focalLengthPixels:900,
  principalX:1100,principalY:686,centerX:5,phase:-.12,tiltX:6
});
export function roundedCardShape(THREE){
  const {cardWidth:w,cardHeight:h,cornerRadius:r}=config;
  const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}
export function createOperatorRing(THREE,materials){
  const ring=new THREE.Group();ring.name='operator-card-ring';
  ring.rotation.y=config.phase;ring.rotation.x=THREE.MathUtils.degToRad(config.tiltX);ring.position.x=config.centerX;
  const shape=roundedCardShape(THREE);
  const faceGeometry=new THREE.ShapeGeometry(shape,12),pos=faceGeometry.attributes.position;
  const uv=faceGeometry.attributes.uv;
  for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/config.cardWidth+.5,pos.getY(i)/config.cardHeight+.5);
  const cards=[];
  for(let i=0;i<config.count;i++){
    const theta=i/config.count*Math.PI*2;
    const card=new THREE.Group();card.name='operator-card-'+i;card.userData.theta=theta;
    card.position.set(config.radius*Math.cos(theta),config.cardHeight/2,config.radius*Math.sin(theta));
    // Base pose faces radially outward before the requested local tilt. No lookAt(camera), yaw
    // compensation, per-card screen positions, or per-card animation.
    card.rotation.y=Math.PI/2-theta;
    // Turn each complete card 90 degrees about its local Y axis; keep its center fixed.
    card.rotateY(Math.PI/2);
    const material=materials(i);
    const front=new THREE.Mesh(faceGeometry,material.front);front.position.z=config.thickness/2;
    const back=new THREE.Mesh(faceGeometry,material.back);back.position.z=-config.thickness/2;back.rotation.y=Math.PI;
    front.name='operator-front';back.name='operator-back';
    card.add(front,back);ring.add(card);cards.push(card);
  }
  return {ring,cards,geometries:[faceGeometry]};
}
export function createHeroCamera(THREE){
  const fov=THREE.MathUtils.radToDeg(2*Math.atan(config.height/(2*config.focalLengthPixels)));
  const camera=new THREE.PerspectiveCamera(fov,config.width/config.height,.1,100);
  const elevation=THREE.MathUtils.degToRad(config.elevation);
  camera.position.set(0,config.distance*Math.sin(elevation),config.distance*Math.cos(elevation));
  camera.lookAt(0,0,0);
  // Roll the fixed camera, never the cards: the ellipse recedes diagonally.
  camera.rotateZ(THREE.MathUtils.degToRad(config.roll));
  frameCamera(camera,config.width);
  camera.updateMatrixWorld();return camera;
}

// Extend the same camera crop on wide screens instead of clipping a 1280px canvas.
export function frameCamera(camera,width){
  camera.setViewOffset(config.width,config.height,
    config.width/2-config.principalX-(width-config.width)/2,
    config.height/2-config.principalY,width,config.height);
}
