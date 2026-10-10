import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type Zone = 'couple' | 'invitation' | 'moments' | 'celebration' | 'venue';
export type View = Zone | 'overview';
export interface World {
  flyTo: (view: View) => void;
  setNight: (night: boolean) => void;
  showPhoto: (index:number) => void;
  showPortrait: (index:number) => void;
  enter: () => void;
  celebrate: () => void;
  zoom: (amount: number) => void;
  setPaused: (paused: boolean) => void;
  destroy: () => void;
}
export const zonePositions: Record<Zone, [number, number, number]> = {
  couple: [0, 6, -8], invitation: [4.8, 3.1, 10], moments: [-10, 4.3, -1], celebration: [8, 3.5, 4], venue: [-4.6, 3, 11],
};
const shots: Record<View, { camera: [number,number,number]; target: [number,number,number] }> = {
  overview: {camera:[24,20,30], target:[0,2,0]},
  couple: {camera:[0,4.2,8], target:[0,3.5,-8]},
  invitation: {camera:[11,6,18], target:[4.8,2,10]},
  moments: {camera:[-18,7,10], target:[-10,2,-1]},
  celebration: {camera:[17,10,16], target:[7,1.8,4]},
  venue: {camera:[-13,7,21], target:[-4.6,2,11]},
};
export function createWorld(host: HTMLElement, options: { reduced: boolean; onSelect: (zone: Zone) => void; onPhotoStep?: (delta:number)=>void; onProject: (positions: Record<Zone,{x:number;y:number;visible:boolean}>) => void; onReady:()=>void; onInteraction:()=>void }): World {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#151e2b');
  scene.fog = new THREE.FogExp2('#151e2b', .010);
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth<700?1.3:1.7));
  renderer.shadowMap.enabled=innerWidth>700;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const camera=new THREE.PerspectiveCamera(42,1,.1,160);
  camera.position.set(...shots.overview.camera);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.target.set(...shots.overview.target);
  controls.enableDamping=!options.reduced; controls.dampingFactor=.075;
  controls.enablePan=false; controls.minDistance=1.8; controls.maxDistance=85;
  controls.maxPolarAngle=Math.PI*.475; controls.minPolarAngle=.2;
  controls.rotateSpeed=.55; controls.zoomSpeed=.7;
  controls.autoRotate=!options.reduced; controls.autoRotateSpeed=.14;
  const hemi=new THREE.HemisphereLight('#becbdf','#817663',2.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#ffdea8',3.6);sun.position.set(-10,22,12);sun.castShadow=true;
  sun.shadow.mapSize.set(innerWidth>1000?2048:1024,innerWidth>1000?2048:1024);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;sun.shadow.normalBias=.04;scene.add(sun);
  const rim=new THREE.DirectionalLight('#819fcd',1.8);rim.position.set(12,12,-15);scene.add(rim);
  const point=new THREE.PointLight('#ffbe76',85,26,1.4);point.position.set(0,5,-5);scene.add(point);
  const room=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(room,.06);scene.environment=environment.texture;scene.environmentIntensity=.4;room.dispose();pmrem.dispose();
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
  const mat=(color:string,metalness=0,roughness=.7)=>{const m=new THREE.MeshStandardMaterial({color,metalness,roughness});materials.add(m);return m};
  const cream=mat('#eee3d0'),ivory=mat('#fff0d9'),gold=mat('#b39359',.72,.28),sage=mat('#536858'),dark=mat('#263f32'),wood=mat('#80694f'),rose=mat('#dcb4a7'),stone=mat('#bdaf96'),white=mat('#f6ecd9');
  const glow=new THREE.MeshStandardMaterial({color:'#ffe9b4',emissive:'#ffca70',emissiveIntensity:2});materials.add(glow);
  const sphere=new THREE.SphereGeometry(1,16,12),cube=new RoundedBoxGeometry(1,1,1,2,.065),cylinder=new THREE.CylinderGeometry(1,1,1,20);geometries.add(sphere);geometries.add(cube);geometries.add(cylinder);
  const mesh=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,sx=1,sy=1,sz=1,parent:THREE.Object3D=scene)=>{geometries.add(g);const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
  const box=(m:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number,p:THREE.Object3D=scene)=>mesh(cube,m,x,y,z,sx,sy,sz,p);
  const cyl=(m:THREE.Material,x:number,y:number,z:number,r:number,h:number,p:THREE.Object3D=scene)=>mesh(cylinder,m,x,y,z,r,h,r,p);
  const orb=(m:THREE.Material,x:number,y:number,z:number,r:number,p:THREE.Object3D=scene)=>mesh(sphere,m,x,y,z,r,r,r,p);
  const group=(zone?:Zone)=>{const g=new THREE.Group();if(zone)g.userData.zone=zone;scene.add(g);return g};
  const line=(points:THREE.Vector3[],color:string)=>{const g=new THREE.BufferGeometry().setFromPoints(points),m=new THREE.LineBasicMaterial({color});geometries.add(g);materials.add(m);const o=new THREE.Line(g,m);scene.add(o);return o};
  const text=(value:string,x:number,y:number,z:number,w:number,h:number,color='#b89b67',p:THREE.Object3D=scene)=>{const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d')!;ctx.font='italic 76px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(value,512,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.add(t);const m=new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false});materials.add(m);return mesh(new THREE.PlaneGeometry(w,h),m,x,y,z,1,1,1,p)};
  // Small-scale material detail, with repeated texture coordinates in world units.
  let seed=719;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const surface=(kind:'linen'|'stone'|'wood'|'grass')=>{const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d')!;ctx.fillStyle=kind==='wood'?'#8a755b':kind==='grass'?'#677456':kind==='stone'?'#b9b4a6':'#c6c4bc';ctx.fillRect(0,0,256,256);for(let i=0;i<9500;i++){const v=Math.floor(90+random()*90);ctx.fillStyle=`rgba(${v},${v},${v},${kind==='linen'?.16:.25})`;const x=random()*256,y=random()*256;ctx.fillRect(x,y,kind==='wood'?1:kind==='linen'?2:3,kind==='wood'?12+random()*60:kind==='grass'?4:1)}if(kind==='linen'){ctx.fillStyle='#ffffff20';for(let i=0;i<256;i+=3){ctx.fillRect(i,0,1,256);ctx.fillRect(0,i,256,1)}}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='grass'?30:6,kind==='grass'?30:6);if(kind==='grass'||kind==='wood')t.colorSpace=THREE.SRGBColorSpace;textures.add(t);return t};
  const linen=surface('linen');for(const material of [cream,ivory,sage]){material.bumpMap=linen;material.bumpScale=.012;material.roughness=.88}wood.map=surface('wood');wood.bumpMap=wood.map;wood.bumpScale=.025;stone.bumpMap=surface('stone');stone.bumpScale=.04;
  const groundMaterial=mat('#6b775d');groundMaterial.map=surface('grass');groundMaterial.bumpMap=groundMaterial.map;groundMaterial.bumpScale=.06;const ground=mesh(new THREE.PlaneGeometry(230,230),groundMaterial,0,-.72,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  const skyTexture=(night:boolean)=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d')!,gradient=ctx.createLinearGradient(0,0,0,512);gradient.addColorStop(0,night?'#071426':'#779fb2');gradient.addColorStop(.44,night?'#37465a':'#f2c6a3');gradient.addColorStop(.57,night?'#565655':'#e9c4a2');gradient.addColorStop(.68,night?'#19291f':'#87917a');gradient.addColorStop(1,night?'#0c1711':'#405740');ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,512);const t=new THREE.CanvasTexture(canvas);t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;textures.add(t);return t};const eveningSky=skyTexture(true),daySky=skyTexture(false);scene.background=eveningSky;
  const glass=new THREE.MeshPhysicalMaterial({color:'#f2e7d2',transparent:true,opacity:.3,roughness:.07,metalness:0,transmission:.65,thickness:.08});materials.add(glass);
  const curtain=(x:number)=>{const g=new THREE.PlaneGeometry(2.6,5.4,48,14);const a=g.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i);a.setZ(i,Math.sin(xx*17)*.105+Math.sin(xx*7)*.03);a.setY(i,yy+.025*Math.cos(xx*9)*(1-yy/2.7))}g.computeVertexNormals();const m=new THREE.MeshStandardMaterial({color:'#e9dfcc',roughness:.96,bumpMap:linen,bumpScale:.007,side:THREE.DoubleSide});materials.add(m);return mesh(g,m,x,3.3,-9.1)};
  // Circular garden terrace and a patterned aisle.
  box(stone,0,-.36,0,38,.6,38);cyl(cream,0,-.08,0,17.95,.14);
  const floorCanvas=document.createElement('canvas');floorCanvas.width=floorCanvas.height=256;const fc=floorCanvas.getContext('2d')!;fc.fillStyle='#e5dcc9';fc.fillRect(0,0,256,256);fc.strokeStyle='#cec4b0';fc.lineWidth=1;for(let x=0;x<256;x+=64){fc.beginPath();fc.moveTo(x,0);fc.lineTo(x,256);fc.stroke();fc.beginPath();fc.moveTo(0,x);fc.lineTo(256,x);fc.stroke()}const floorTexture=new THREE.CanvasTexture(floorCanvas);floorTexture.wrapS=floorTexture.wrapT=THREE.RepeatWrapping;floorTexture.repeat.set(10,10);textures.add(floorTexture);const floorMat=new THREE.MeshStandardMaterial({map:floorTexture,bumpMap:floorTexture,bumpScale:.025,roughness:.8});materials.add(floorMat);const floor=mesh(new THREE.CircleGeometry(17.8,96),floorMat,0,.005,0);floor.rotation.x=-Math.PI/2;
  box(dark,0,.026,3.5,3.5,.025,20);box(gold,-1.67,.043,3.5,.045,.012,20);box(gold,1.67,.043,3.5,.045,.012,20);
  for(let z=-5;z<13;z+=1.7){const pattern=mesh(new THREE.RingGeometry(.23,.245,24),gold,0,.047,z);pattern.rotation.x=-Math.PI/2}
  // Reception stage, arched backdrop, drapery, and floral canopy.
  const stage=group('couple');box(stone,0,.24,-8,13,.5,5.7,stage);box(gold,0,.51,-8,13.05,.045,5.75,stage);box(cream,0,.56,-8,12.85,.06,5.55,stage);box(stone,0,.1,-4.7,8,.2,1,stage);
  const shape=new THREE.Shape();shape.moveTo(-3.6,0);shape.lineTo(3.6,0);shape.lineTo(3.6,3.2);shape.absarc(0,3.2,3.6,0,Math.PI,false);shape.lineTo(-3.6,0);const backdrop=mesh(new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:false}),ivory,0,.6,-10,1,1,1,stage);
  mesh(new THREE.TorusGeometry(3.72,.08,8,64,Math.PI),gold,0,3.8,-9.75,1,1,1,stage);cyl(gold,-3.72,2.2,-9.75,.08,3.2,stage);cyl(gold,3.72,2.2,-9.75,.08,3.2,stage);
  for(const side of [-1,1]){curtain(side*5.2);cyl(gold,side*6.6,3.6,-9.5,.12,6.2,stage);orb(gold,side*6.6,6.8,-9.5,.25,stage)}
  text('Jinustan & Sharon',0,6.3,-9.7,5.7,1.1,'#9f7c42',stage);text('THE BEGINNING OF FOREVER',0,5.65,-9.65,4.5,.5,'#627258',stage);
  // Actual photographs are framed within the three-dimensional set.
  const loader=new THREE.TextureLoader();
  const image=(src:string,x:number,y:number,z:number,w:number,h:number,p:THREE.Object3D,rotation=0)=>{const texture=loader.load(src,t=>{const img=t.image as HTMLImageElement,aspect=img.width/img.height;if((photoMesh.material as THREE.MeshBasicMaterial).map===t)photoMesh.scale.set(Math.min(1,aspect/(w/h)),Math.min(1,(w/h)/aspect),1)});texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);const m=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});materials.add(m);const frame=new THREE.Group();frame.position.set(x,y,z);frame.rotation.y=rotation;p.add(frame);box(gold,0,0,-.07,w+.16,h+.16,.12,frame);box(ivory,0,0,-.003,w+.04,h+.04,.025,frame);const photoMesh=mesh(new THREE.PlaneGeometry(w,h),m,0,0,.02,1,1,1,frame);photoMesh.castShadow=false;frame.userData.surface=photoMesh;frame.userData.size=[w,h];return frame};
  image('/images/couple.webp',0,3.25,-9.4,2.8,4.2,stage);image('/images/groom.webp',-4.85,3.2,-8.8,2.25,2.25,stage,.15);image('/images/bride.webp',4.85,3.2,-8.8,2.25,2.25,stage,-.15);
  // Shared instanced foliage and flower geometry keeps the garden efficient.
  const flowerMatrices:THREE.Matrix4[]=[],leafMatrices:THREE.Matrix4[]=[];const temp=new THREE.Object3D();
  const flower=(x:number,y:number,z:number,size=.2)=>{for(let i=0;i<5;i++){const a=i/5*Math.PI*2;temp.position.set(x+Math.cos(a)*size*.55,y+Math.sin(a)*size*.55,z);temp.rotation.set(.1,a,.1);temp.scale.set(size*.58,size*.65,size*.42);temp.updateMatrix();flowerMatrices.push(temp.matrix.clone())}temp.position.set(x,y,z+.05);temp.scale.set(size*.48,size*.48,size*.45);temp.updateMatrix();flowerMatrices.push(temp.matrix.clone())};
  const leaf=(x:number,y:number,z:number,s=.4)=>{temp.position.set(x,y,z);temp.rotation.set(x*7,y*3,z*5);temp.scale.set(s*.42,s*.065,s*1.3);temp.updateMatrix();leafMatrices.push(temp.matrix.clone())};
  for(let i=0;i<65;i++){const a=i/64*Math.PI;const x=Math.cos(a)*3.9,y=3.8+Math.sin(a)*3.9;flower(x,y,-9.55,.16+Math.sin(i*5)**2*.08);leaf(x+.1,y,-9.6,.3);if(i%3===0)flower(x+.2,y+.12,-9.45,.19)}
  for(const side of [-1,1])for(let i=0;i<21;i++){flower(side*3.9,.8+i*.15,-9.55,.2);leaf(side*4.02,.9+i*.15,-9.6,.35)}
  // Chairs, round tables, centrepieces and place settings.
  const dining=group('celebration');
  const chair=(x:number,z:number,a:number,p:THREE.Object3D)=>{const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-a;p.add(g);box(sage,0,.66,0,.7,.16,.72,g);box(sage,0,1.2,-.32,.67,.95,.13,g);for(const xx of [-.28,.28])for(const zz of [-.27,.27])cyl(gold,xx,.33,zz,.035,.62,g);cyl(gold,-.35,1.2,-.33,.025,1,g);cyl(gold,.35,1.2,-.33,.025,1,g)};
  for(const x of [-7,7])for(const z of [.5,7]){cyl(cream,x,.8,z,2.05,1.3,dining);cyl(ivory,x,1.47,z,2.15,.06,dining);cyl(gold,x,1.55,z,.35,.12,dining);cyl(gold,x,1.92,z,.14,.66,dining);for(let i=0;i<10;i++){const a=i*Math.PI*.7;flower(x+Math.cos(a)*.35,2.2+Math.sin(i*6)*.16,z+Math.sin(a)*.25,.16);leaf(x+Math.cos(a)*.4,2.1,z+Math.sin(a)*.35,.28)}for(let i=0;i<6;i++){const a=i/6*Math.PI*2;chair(x+Math.sin(a)*2.7,z+Math.cos(a)*2.7,a,dining);const px=x+Math.sin(a)*1.55,pz=z+Math.cos(a)*1.55;cyl(gold,px,1.515,pz,.31,.02,dining);cyl(white,px,1.535,pz,.26,.02,dining);box(sage,px,1.555,pz,.18,.025,.28,dining);cyl(gold,px+.3,1.7,pz,.04,.27,dining);cyl(ivory,px+.3,1.82,pz,.095,.13,dining)}}
  // A wedding cake and cake stand, part of the celebration hotspot.
  cyl(gold,10,1.1,4,1,2,dining);cyl(ivory,10,2.15,4,1.15,.12,dining);for(let i=0;i<3;i++){cyl(white,10,2.45+i*.45,4,.78-i*.18,.45,dining);cyl(gold,10,2.25+i*.45,4,.8-i*.18,.035,dining)}flower(10,3.65,4,.22);
  // Gallery easels and the original invitation displayed inside the scene.
  const gallery=group('moments');const galleryFrames:THREE.Group[]=[];
  // A large central print with two neighboring memories, arranged as a garden triptych.
  for(let i=0;i<3;i++){
    const offset=[0,-3.4,3.4][i],x=-11+Math.cos(.4)*offset,z=-4-Math.sin(.4)*offset-(i?1.1:0);
    const w=i?1.9:3.3,h=i?2.7:4.5,y=i?2.6:3.05;
    const frame=image(`/images/gallery${[7,6,8][i]}.webp`,x,y,z,w,h,gallery,.4);
    for(const side of [-1,1]){const leg=cyl(gold,x+side*w*.32,y*.5,z+.1,.045,y,gallery);leg.rotation.z=side*-.12}
    box(wood,x,.65,z+.25,w,.08,.12,gallery);frame.userData.zone='moments';frame.userData.photoStep=[0,-1,1][i];galleryFrames.push(frame);
    // A second surface crossfades into the next print without blanking the frame.
    const front=frame.userData.surface as THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>;
    const overlayMaterial=front.material.clone();overlayMaterial.transparent=true;overlayMaterial.opacity=0;overlayMaterial.depthWrite=false;materials.add(overlayMaterial);
    const overlay=new THREE.Mesh(front.geometry,overlayMaterial);overlay.position.z=.025;overlay.visible=false;frame.add(overlay);frame.userData.overlay=overlay;
  }
  const invite=group('invitation');image('/images/invitation-card.webp',4.8,2.1,10,1.72,3.06,invite,-.28);cyl(gold,4.8,.6,10,.07,1.4,invite);box(gold,4.8,.12,10,.95,.13,.65,invite);
  const welcome=group('venue');box(wood,-4.6,1.8,11,2,.12,.65,welcome);box(ivory,-4.6,2.1,11,2,2.7,.08,welcome);text('Welcome to our forever',-4.6,2.65,11.07,1.9,.65,'#6b765c',welcome);text('20 · 10 · 2026',-4.6,2.1,11.08,1.6,.4,'#9f7c42',welcome);text('Fr. Lopez Hall',-4.6,1.65,11.08,1.8,.45,'#6b765c',welcome);for(const side of [-1,1])cyl(gold,-4.6+side*.7,.55,11,.04,1.1,welcome);
  // The information is printed on physical boards in the venue.
  const board=(lines:string[],x:number,y:number,z:number,w:number,h:number,p:THREE.Object3D)=>{const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d')!;ctx.fillStyle='#f3ecdc';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#b59b70';ctx.lineWidth=3;ctx.strokeRect(28,28,c.width-56,c.height-56);ctx.textAlign='center';ctx.textBaseline='middle';for(let i=0;i<lines.length;i++){ctx.fillStyle=i===0?'#9c8052':'#354d3e';ctx.font=i===0?'italic 64px Georgia':'42px Georgia';ctx.fillText(lines[i],512,105+i*(c.height-170)/Math.max(1,lines.length-1),930)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.add(t);const m=new THREE.MeshBasicMaterial({map:t,toneMapped:false});materials.add(m);box(gold,x,y,z-.035,w+.08,h+.08,.08,p);return mesh(new THREE.PlaneGeometry(w,h),m,x,y,z+.01,1,1,1,p)};
  board(['Jinustan Raj','M.Sc., B.Ed., M.Div.','Pastor, Educator &','Mathematics Content Creator'],-4.85,1.12,-8.68,2.4,1.25,stage);
  board(['Sharon Roja','M.Sc., B.Ed.','Mathematics Teacher','Narayana E-Techno, Madurai'],4.85,1.12,-8.68,2.4,1.25,stage);
  board(['A date with forever','Tuesday, 20 October 2026','5:30 PM · Indian Standard Time','Fr. Lopez Hall, Colachel'],7,2.6,4.4,3.2,2.2,dining);cyl(gold,7,1,4.38,.08,2,dining);
  board(['We’ll see you here','Fr. Lopez Hall','Colachel, Kanyakumari District','Tamil Nadu · 20 October 2026'],-4.6,2.1,11.11,2,2.7,welcome);
  for(const x of [-7,7]){const light=new THREE.PointLight('#ffc883',20,10,2);light.position.set(x,3,4);scene.add(light)}
  // Floral aisle lanterns.
  const lantern=(x:number,z:number)=>{cyl(gold,x,.15,z,.36,.18);box(gold,x,.6,z,.5,.05,.5);box(gold,x,.2,z,.5,.05,.5);for(const xx of [-.22,.22])for(const zz of [-.22,.22])cyl(gold,x+xx,.4,z+zz,.022,.4);cyl(glow,x,.36,z,.12,.3);cyl(glass,x,.42,z,.22,.42)};
  for(const side of [-1,1])for(let i=0;i<5;i++){lantern(side*2.1,-3+i*3.2);for(let j=0;j<5;j++){flower(side*(2.7+Math.sin(j)*.3),.65+Math.sin(j*4)*.2,-3+i*3.2+Math.cos(j)*.3,.18);leaf(side*2.7,.45,-3+i*3.2,.4)}}
  // Pergola beams, suspended string lights, chandelier and leafy perimeter.
  for(const x of [-13,13])for(const z of [-10,10]){cyl(wood,x,3.7,z,.14,7.4);orb(gold,x,7.5,z,.22)}
  box(wood,0,7.45,-10,26,.18,.18);box(wood,0,7.45,10,26,.18,.18);
  for(const z of [-8,-3,2,7]){const pts:THREE.Vector3[]=[];for(let i=0;i<=40;i++){const x=-13+i/40*26;const y=7.4-Math.sin(i/40*Math.PI)*1.5;pts.push(new THREE.Vector3(x,y,z));if(i%2===0){cyl(gold,x,y-.09,z,.03,.12);orb(glow,x,y-.24,z,.075)}}line(pts,'#716650')}
  cyl(gold,0,6.85,-5,.035,2);mesh(new THREE.TorusGeometry(1.3,.04,6,40),gold,0,5.9,-5).rotation.x=Math.PI/2;for(let i=0;i<10;i++){const a=i/10*Math.PI*2;orb(glow,Math.sin(a)*1.3,5.7,-5+Math.cos(a)*1.3,.09);cyl(gold,Math.sin(a)*1.3,5.9,-5+Math.cos(a)*1.3,.02,.4)}
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2,x=Math.cos(a)*16.2,z=Math.sin(a)*16.2;if(z>11&&Math.abs(x)<6)continue;cyl(stone,x,.4,z,.7,.8);const h=2.1+Math.sin(i*7)**2*2.1;cyl(wood,x,h/2+.7,z,.09,h);for(let j=0;j<170;j++)leaf(x+Math.sin(j*8)*(.25+random()*.85),h+.3+Math.sin(j*4)*1.1,z+Math.cos(j*8)*(.25+random()*.85),.24+random()*.24);for(let j=0;j<3;j++)flower(x+Math.sin(j)*.4,.95,z+Math.cos(j)*.4,.16)}
  // Batch static decor by material and destination, preserving raycast navigation.
  scene.updateMatrixWorld(true);
  const batches=new Map<string,{material:THREE.Material;zone:Zone|undefined;objects:THREE.Mesh[]}>();
  scene.traverse(o=>{if(!(o instanceof THREE.Mesh)||o instanceof THREE.InstancedMesh||Array.isArray(o.material)||('map' in o.material && o.material.map))return;let parent:THREE.Object3D|null=o,zone:Zone|undefined;while(parent){if(parent.userData.zone){zone=parent.userData.zone as Zone;break}parent=parent.parent}const key=o.material.uuid+':'+(zone??'decor');const batch=batches.get(key)??{material:o.material,zone,objects:[] as THREE.Mesh[]};batch.objects.push(o);batches.set(key,batch)});
  for(const batch of batches.values()){if(batch.objects.length<2)continue;const parts=batch.objects.map(o=>{const g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(g.index){const plain=g.toNonIndexed();g.dispose();return plain}return g});const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());if(!geometry)continue;geometries.add(geometry);const combined=new THREE.Mesh(geometry,batch.material);combined.castShadow=true;combined.receiveShadow=true;if(batch.zone)combined.userData.zone=batch.zone;scene.add(combined);batch.objects.forEach(o=>o.removeFromParent())}
  const blooms=new THREE.InstancedMesh(sphere,rose,flowerMatrices.length);flowerMatrices.forEach((m,i)=>{blooms.setMatrixAt(i,m);blooms.setColorAt(i,new THREE.Color(i%18<6?'#fff4df':i%18<12?'#e4bdb1':'#f3e6d6'))});scene.add(blooms);
  const foliage=new THREE.InstancedMesh(sphere,sage,leafMatrices.length);leafMatrices.forEach((m,i)=>foliage.setMatrixAt(i,m));scene.add(foliage);
  // Fireflies and click-triggered confetti, animated only when visible.
  const sparkCount=90,positions=new Float32Array(sparkCount*3);for(let i=0;i<sparkCount;i++){positions[i*3]=Math.sin(i*17)*19;positions[i*3+1]=2+(i%16)*.5;positions[i*3+2]=Math.cos(i*13)*19}const particleGeometry=new THREE.BufferGeometry();particleGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometries.add(particleGeometry);const particleMaterial=new THREE.PointsMaterial({color:'#ffdb94',size:.065,transparent:true,opacity:.7,depthWrite:false});materials.add(particleMaterial);const fireflies=new THREE.Points(particleGeometry,particleMaterial);scene.add(fireflies);
  const confettiGeometry=new THREE.PlaneGeometry(.08,.16);geometries.add(confettiGeometry);const confettiMaterial=new THREE.MeshBasicMaterial({color:'#edbd77',side:THREE.DoubleSide});materials.add(confettiMaterial);const confetti=new THREE.InstancedMesh(confettiGeometry,confettiMaterial,150);confetti.visible=false;scene.add(confetti);let confettiStart=-100;
  let tween:ReturnType<typeof gsap.timeline>|null=null,disposed=false,paused=false,frame=0,last=0,elapsed=0,currentView:View='overview';
  let zoomTarget:number|null=null;const zoomOffset=new THREE.Vector3();
  const photoIds=[7,8,5,3,2,4,6];let photoIndex=0,photoRequest=0;const photoCache=new Map<number,THREE.Texture>();
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<600?50:42;camera.clearViewOffset();if(w>800&&currentView==='overview')camera.setViewOffset(w,h,-w*.12,0,w,h);else if(currentView==='moments')camera.setViewOffset(w,h,0,h*.08,w,h);camera.updateProjectionMatrix()};
  const moveCamera=(position:THREE.Vector3,target:THREE.Vector3)=>{tween?.kill();zoomTarget=null;controls.autoRotate=false;controls.enabled=true;controls.enableDamping=false;controls.update();controls.enableDamping=!options.reduced;resize();if(options.reduced){camera.position.copy(position);controls.target.copy(target);controls.update();return}controls.enabled=false;tween=gsap.timeline({onComplete:()=>{controls.enabled=true}}).to(camera.position,{x:position.x,y:position.y,z:position.z,duration:2.2,ease:'power2.inOut'},0).to(controls.target,{x:target.x,y:target.y,z:target.z,duration:2.2,ease:'power2.inOut'},0)};
  const frameArt=(target:THREE.Vector3,width:number,height:number,angle=0,fill=.56)=>{const vfov=THREE.MathUtils.degToRad(host.clientWidth<600?50:42);const distance=Math.max(height/(2*Math.tan(vfov/2)*fill),width/(2*Math.tan(vfov/2)*(host.clientWidth/host.clientHeight)*.74),2.5);moveCamera(target.clone().add(new THREE.Vector3(Math.sin(angle)*distance,.12,Math.cos(angle)*distance)),target)};
  type PhotoSurface=THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>;
  const photoLoads=new Map<number,Promise<THREE.Texture>>();
  const loadPhoto=(index:number)=>{
    const cached=photoCache.get(index);if(cached)return Promise.resolve(cached);
    const pending=photoLoads.get(index);if(pending)return pending;
    const promise=new Promise<THREE.Texture>((resolve,reject)=>{
      const t=loader.load(`/images/gallery${photoIds[index]}.webp`,texture=>{texture.colorSpace=THREE.SRGBColorSpace;if(disposed){texture.dispose();resolve(texture);return}photoCache.set(index,texture);resolve(texture)},undefined,()=>{photoLoads.delete(index);reject(new Error('Photo unavailable'))});textures.add(t);
    });photoLoads.set(index,promise);return promise;
  };
  const fitPhoto=(surface:PhotoSurface,texture:THREE.Texture,w:number,h:number)=>{const img=texture.image as HTMLImageElement,aspect=img.width/img.height;surface.material.map=texture;surface.material.needsUpdate=true;surface.scale.set(Math.min(1,aspect/(w/h)),Math.min(1,(w/h)/aspect),1)};
  const photoFades=new Map<THREE.Group,ReturnType<typeof gsap.timeline>>();
  const showPhoto=(index:number)=>{
    const entering=currentView!=='moments';currentView='moments';photoIndex=((index%photoIds.length)+photoIds.length)%photoIds.length;const request=++photoRequest;
    if(entering)frameArt(new THREE.Vector3(-11,3.05,-4),3.7,4.9,.4,host.clientHeight<650?.38:.47);
    for(let slot=0;slot<galleryFrames.length;slot++){
      const key=(photoIndex+[0,-1,1][slot]+photoIds.length)%photoIds.length,frame=galleryFrames[slot];
      loadPhoto(key).then(texture=>{
        if(disposed||request!==photoRequest)return;
        const surface=frame.userData.surface as PhotoSurface,overlay=frame.userData.overlay as PhotoSurface,[w,h]=frame.userData.size as [number,number];
        photoFades.get(frame)?.kill();
        // Finish the previous visual state before starting the latest requested transition.
        if(overlay.visible&&overlay.material.map)fitPhoto(surface,overlay.material.map,w,h);
        overlay.visible=false;surface.material.opacity=1;
        if(options.reduced){fitPhoto(surface,texture,w,h);return}
        fitPhoto(overlay,texture,w,h);overlay.material.opacity=0;overlay.visible=true;surface.material.transparent=true;
        photoFades.set(frame,gsap.timeline({onComplete:()=>{fitPhoto(surface,texture,w,h);surface.material.opacity=1;overlay.visible=false;photoFades.delete(frame)}}).to(overlay.material,{opacity:1,duration:.6,ease:'sine.inOut'},0).to(surface.material,{opacity:0,duration:.6,ease:'sine.inOut'},0));
      }).catch(()=>{/* Keep the displayed photograph if an asset cannot load. */});
    }
    // Warm the remaining textures only once the gallery is first visited.
    photoIds.forEach((_,i)=>{void loadPhoto(i).catch(()=>{})});
  };
  const showPortrait=(index:number)=>{currentView='couple';if(index===0)frameArt(new THREE.Vector3(0,3.65,-9.4),4.4,5.8);else frameArt(new THREE.Vector3(index===1?-4.85:4.85,2.5,-8.65),2.7,4.1,index===1?.15:-.15)};
  const flyTo=(view:View)=>{if(view==='moments'){currentView='overview';showPhoto(photoIndex);return}currentView=view;if(view==='couple'){showPortrait(0);return}if(view==='invitation'){frameArt(new THREE.Vector3(4.8,2.1,10),2,3.5,-.28);return}if(view==='venue'){frameArt(new THREE.Vector3(-4.6,2.1,11.14),2.4,3.1);return}if(view==='celebration'){frameArt(new THREE.Vector3(7,2.6,4.43),3.6,2.7);return}const shot=shots.overview,target=new THREE.Vector3(...shot.target),position=new THREE.Vector3(...shot.camera);if(host.clientWidth<600)position.sub(target).multiplyScalar(1.5).add(target);moveCamera(position,target)};
  const night=(isNight:boolean)=>{scene.background=isNight?eveningSky:daySky;(scene.fog as THREE.FogExp2).color.set(isNight?'#344044':'#b8bca8');hemi.intensity=isNight?.7:1.8;sun.intensity=isNight?1.7:2.6;sun.color.set(isNight?'#ffdcac':'#fff0d3');rim.intensity=isNight?.7:.3;glow.emissiveIntensity=isNight?2:.65;particleMaterial.opacity=isNight?.55:.05;scene.environmentIntensity=isNight?.32:.6;renderer.toneMappingExposure=isNight?1.1:1.05};
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();if(host.clientWidth<600){const offset=camera.position.clone().sub(controls.target);camera.position.copy(controls.target).add(offset.multiplyScalar(1.5));controls.update()}
  const smoothZoom=(amount:number)=>{
    options.onInteraction();tween?.kill();controls.enabled=true;controls.autoRotate=false;
    zoomTarget=THREE.MathUtils.clamp((zoomTarget??camera.position.distanceTo(controls.target))*amount,1.8,85);
    if(options.reduced){zoomOffset.copy(camera.position).sub(controls.target).setLength(zoomTarget);camera.position.copy(controls.target).add(zoomOffset);zoomTarget=null;controls.update()}
  };
  const wheel=(event:WheelEvent)=>{
    event.preventDefault();event.stopImmediatePropagation();
    const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?host.clientHeight:1);
    smoothZoom(Math.exp(THREE.MathUtils.clamp(pixels,-120,120)*.0015));
  };
  // Capture only canvas wheel events; native scrolling elsewhere remains untouched.
  renderer.domElement.addEventListener('wheel',wheel,{capture:true,passive:false});
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let downX=0,downY=0;
  const down=(e:PointerEvent)=>{downX=e.clientX;downY=e.clientY};
  const findZone=(e:PointerEvent)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);for(const hit of raycaster.intersectObjects(scene.children,true)){let obj:THREE.Object3D|null=hit.object;while(obj){if(obj.userData.zone)return {zone:obj.userData.zone as Zone,step:obj.userData.photoStep as number|undefined};obj=obj.parent}if(hit.distance<raycaster.far&&hit.object===floor)break}return null};
  const up=(e:PointerEvent)=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)>8)return;const hit=findZone(e);if(hit){if(currentView==='moments'&&hit.step&&options.onPhotoStep)options.onPhotoStep(hit.step);else options.onSelect(hit.zone)}};
  let lastHover=0;const move=(e:PointerEvent)=>{if(e.buttons||performance.now()-lastHover<80)return;lastHover=performance.now();renderer.domElement.style.cursor=findZone(e)?'pointer':'grab'};
  const interaction=()=>{zoomTarget=null;controls.autoRotate=false;options.onInteraction()};controls.addEventListener('start',interaction);
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointermove',move);
  const render=(time:number)=>{frame=0;if(disposed||paused||document.hidden)return;const dt=Math.min((time-last)/1000,.05);last=time;elapsed+=dt;if(zoomTarget!==null){const distance=camera.position.distanceTo(controls.target),next=THREE.MathUtils.lerp(distance,zoomTarget,1-Math.exp(-12*dt));zoomOffset.copy(camera.position).sub(controls.target).setLength(next);camera.position.copy(controls.target).add(zoomOffset);if(Math.abs(next-zoomTarget)<.001)zoomTarget=null}controls.dampingFactor=1-Math.exp(-5*dt);controls.update(dt);if(!options.reduced){fireflies.rotation.y=elapsed*.035;fireflies.position.y=Math.sin(elapsed*.4)*.12;if(confetti.visible){const t=elapsed-confettiStart;if(t>6)confetti.visible=false;else for(let i=0;i<150;i++){const a=i*2.399;temp.position.set(Math.cos(a)*(1+t*.65),6.8+Math.sin(i*9)*1.5-t*(.6+(i%7)*.1),-6+Math.sin(a)*(1+t*.65));temp.rotation.set(t+i,t*2+i,i+t*2);temp.scale.set(1,1,1);temp.updateMatrix();confetti.setMatrixAt(i,temp.matrix)}confetti.instanceMatrix.needsUpdate=true}}renderer.render(scene,camera);const projection={} as Record<Zone,{x:number;y:number;visible:boolean}>;for(const [zone,p] of Object.entries(zonePositions)){const v=new THREE.Vector3(...p).project(camera);projection[zone as Zone]={x:(v.x*.5+.5)*host.clientWidth,y:(-.5*v.y+.5)*host.clientHeight,visible:v.z<1&&v.z> -1&&Math.abs(v.x)<.95&&Math.abs(v.y)<.88}}options.onProject(projection);frame=requestAnimationFrame(render)};
  const start=()=>{if(!frame&&!disposed&&!paused&&!document.hidden){last=performance.now();frame=requestAnimationFrame(render)}};const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else start()};document.addEventListener('visibilitychange',visibility);start();renderer.compile(scene,camera);options.onReady();
  return {flyTo,showPhoto,showPortrait,enter:()=>{currentView='couple';moveCamera(new THREE.Vector3(0,3.6,12.5),new THREE.Vector3(0,3.5,-8))},setNight:night,celebrate:()=>{if(!options.reduced){confettiStart=elapsed;confetti.visible=true}},zoom:smoothZoom,setPaused:(value)=>{paused=value;if(value){cancelAnimationFrame(frame);frame=0}else start()},destroy:()=>{disposed=true;cancelAnimationFrame(frame);tween?.kill();photoFades.forEach(f=>f.kill());controls.dispose();resizeObserver.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('wheel',wheel,true);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointermove',move);scene.traverse(o=>{if(o instanceof THREE.InstancedMesh)o.dispose()});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove()}};
}
