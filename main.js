import * as THREE from 'three';
import { buildCastle } from './castle.js';
import {makeJacarandas} from './botany.js';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';
import {setGardenState,timeLabel,timeName,lightInterval} from './environment.js';

const $ = s => document.querySelector(s);
const canvas=$('#canvas'), host=$('#garden');
let state={hour:18,weather:'clear'}, shownHour=18, rainAmount=0,snowAmount=0, wetness=0, accumulation=0, doorOpen=false;
let seed=73191;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const rand=(a,b)=>a+(b-a)*random();
const scene=new THREE.Scene();
let renderer;
try {renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});} catch(error){$('#loading').innerHTML='<p>这个浏览器暂未启用 3D 图形</p><small>请开启浏览器硬件加速，或使用最新版 Chrome / Edge。</small>';throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
const homePosition=new THREE.Vector3(12.8,11.2,18.2),homeTarget=new THREE.Vector3(0,3.55,0);
const camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.copy(homePosition);
const controls=new OrbitControls(camera,canvas);controls.target.copy(homeTarget);controls.enableDamping=true;controls.dampingFactor=.055;controls.enablePan=false;controls.minDistance=10;controls.maxDistance=34;controls.minPolarAngle=.3;controls.maxPolarAngle=1.42;controls.rotateSpeed=.5;controls.zoomSpeed=.7;
const hemi=new THREE.HemisphereLight('#b8c9f4','#334653',1.55);scene.add(hemi);
const sun=new THREE.DirectionalLight('#f3c8b5',2.1);sun.position.set(-8,9,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-9;sun.shadow.camera.right=9;sun.shadow.camera.top=10;sun.shadow.camera.bottom=-8;sun.shadow.normalBias=.035;sun.shadow.bias=-.0004;sun.shadow.camera.far=35;scene.add(sun);
scene.add(new THREE.AmbientLight('#afc0ec',.12));
const fill=new THREE.DirectionalLight('#89baff',1.2);fill.position.set(8,5,-8);scene.add(fill);
const garden=new THREE.Group();scene.add(garden);
const staticMeshes=[],snowMeshes=[],glowMats=[],lampLights=[],ribbons=[],fish=[],ripples=[];
const mat=(color,roughness=.8,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
const materials={stone:mat('#71828e'),stoneLight:mat('#99a7ab'),earth:mat('#4b6571'),base:mat('#1c3046',.42),rim:mat('#516579',.48),wood:mat('#8c7564'),darkwood:mat('#514a48'),plaster:mat('#d9d5c5'),roof:mat('#426179',.65),roofLight:mat('#4a6a83',.6),moss:mat('#607b76'),leaf:mat('#4b716d'),white:mat('#dcdad3'),ceramic:mat('#a6c0c9',.27),gold:mat('#cab68c',.45),black:mat('#263b4c')};
const snowMat=mat('#e7f2ff',.95,{transparent:true,opacity:0,depthWrite:false});
const unitBox=new THREE.BoxGeometry(1,1,1), sphere=new THREE.SphereGeometry(1,9,6), stoneGeo=new THREE.IcosahedronGeometry(1,1), cylinder=new THREE.CylinderGeometry(1,1,1,10);
function mesh(geo,material,x,y,z,sx=1,sy=1,sz=1,parent=garden,dynamic=false){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);if(!dynamic)staticMeshes.push(m);return m;}
function box(x,y,z,w,h,d,material=materials.wood,parent=garden,dynamic=false){return mesh(unitBox,material,x,y,z,w,h,d,parent,dynamic);}
function ellipsoid(x,y,z,sx,sy,sz,material=materials.stone,parent=garden,dynamic=false){return mesh(sphere,material,x,y,z,sx,sy,sz,parent,dynamic);}
function branch(a,b,r1,r2,material=materials.darkwood,parent=garden){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),vec=end.clone().sub(start);const m=mesh(new THREE.CylinderGeometry(r2,r1,vec.length(),8),material,...start.clone().add(end).multiplyScalar(.5).toArray(),1,1,1,parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec.normalize());return m;}
function snowCap(x,y,z,w,h,d,rot=0){const m=mesh(unitBox,snowMat,x,y,z,w,h,d,garden,true);m.rotation.x=rot;m.castShadow=false;snowMeshes.push(m);return m;}
function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const woodTex=texture(128,256,(c,w,h)=>{c.fillStyle='#ae9881';c.fillRect(0,0,w,h);for(let i=0;i<220;i++){c.strokeStyle=`rgba(60,44,37,${rand(.03,.14)})`;c.beginPath();const x=rand(0,w);c.moveTo(x,0);c.bezierCurveTo(x+rand(-8,8),h*.3,x+rand(-6,6),h*.8,x,h);c.stroke();}});materials.wood.map=woodTex;materials.wood.color.set('#bda98e');
const groundTex=texture(256,256,(c,w,h)=>{c.fillStyle='#7c9093';c.fillRect(0,0,w,h);for(let i=0;i<14000;i++){c.fillStyle=random()>.5?'rgba(32,52,64,.12)':'rgba(210,225,216,.14)';c.fillRect(rand(0,w),rand(0,h),rand(1,3),rand(1,3));}});groundTex.wrapS=groundTex.wrapT=THREE.RepeatWrapping;groundTex.repeat.set(5,5);const groundMat=mat('#9aa7a6',.93,{map:groundTex,side:THREE.DoubleSide});snowMat.side=THREE.DoubleSide;
// The terrain is split around the actual stream, keeping every viewpoint coherent.
const streamZ=x=>2.55+.43*Math.sin(x*.66)+.17*Math.sin(x*1.3);
const streamW=x=>.85+.13*Math.cos(x*.9);
box(0,-.3,0,10.8,.58,10.8,materials.base);box(0,.015,0,10.87,.07,10.87,materials.rim);box(0,.08,0,10.65,.12,10.65,materials.earth);
function bankShape(front){const s=new THREE.Shape();s.moveTo(-5.3,front?5.3:-5.3);s.lineTo(5.3,front?5.3:-5.3);for(let i=64;i>=0;i--){const x=-5.3+i/64*10.6;s.lineTo(x,streamZ(x)+(front?1:-1)*streamW(x));}s.closePath();const g=new THREE.ShapeGeometry(s,64);g.rotateX(Math.PI/2); // shape y becomes world z
const m=mesh(g,groundMat,0,.255,0);m.receiveShadow=true;
const snowy=new THREE.Mesh(g,snowMat);snowy.position.y=.27;garden.add(snowy);snowMeshes.push(snowy);}
bankShape(false);bankShape(true);
const waterShape=new THREE.Shape();for(let i=0;i<=100;i++){const x=-5.3+i/100*10.6;const z=streamZ(x)-streamW(x);i?waterShape.lineTo(x,z):waterShape.moveTo(x,z);}for(let i=100;i>=0;i--){const x=-5.3+i/100*10.6;waterShape.lineTo(x,streamZ(x)+streamW(x));}waterShape.closePath();const waterGeo=new THREE.ShapeGeometry(waterShape,80);waterGeo.rotateX(Math.PI/2);
const waterMat=new THREE.MeshPhysicalMaterial({color:'#4a94ac',roughness:.2,metalness:.32,transparent:true,opacity:.69,side:THREE.DoubleSide,depthWrite:false});
const water=new THREE.Mesh(waterGeo,waterMat);water.position.y=.205;water.receiveShadow=true;garden.add(water);
waterMat.onBeforeCompile=shader=>{shader.uniforms.uTime={value:0};waterMat.userData.shader=shader;shader.vertexShader='uniform float uTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y += sin(position.x * 5. + uTime)*.012 + cos(position.z*8.+uTime*1.3)*.008;');};
for(let i=0;i<115;i++){const x=rand(-5.2,5.2),z=streamZ(x)+rand(-.7,.7);mesh(stoneGeo,random()>.5?materials.stone:materials.stoneLight,x,.13,z,rand(.05,.18),rand(.02,.07),rand(.06,.14));}
for(let i=0;i<116;i++){const x=-5.23+i/115*10.46;for(const side of [-1,1]){const z=streamZ(x)+side*(streamW(x)+rand(-.03,.12));const sz=rand(.08,.22);const r=mesh(stoneGeo,i%3?materials.stone:materials.stoneLight,x,.29,z,sz,sz*.6,sz*.8);r.rotation.set(rand(0,3),rand(0,3),rand(0,3));if(i%3===0)ellipsoid(x,.31,z+.12*side,.18,.035,.15,materials.moss);}}
// Reference architecture: cream stone, rounded tower and layered balconies.
const {hx,hz,tx,tz,doorGroup,doorTarget,roofHeight}=buildCastle({THREE,garden,mesh,box,ellipsoid,branch,snowCap,mat,materials,staticMeshes,snowMeshes,snowMat,glowMats,texture});
// Curving little bridge, with actual planks and rails.
const bridgeX=1.8,bridgeZ=streamZ(bridgeX);for(let i=0;i<18;i++){const t=i/17,z=bridgeZ-1.28+t*2.56,y=.38+Math.sin(t*Math.PI)*.28;box(bridgeX,y,z,1.12,.09,.135,materials.stoneLight);snowCap(bridgeX,y+.06,z,1.12,.027,.135);}
for(const side of [-1,1]){for(let i=0;i<5;i++){const z=bridgeZ-1.22+i*.61,y=.4+Math.sin(i/4*Math.PI)*.27;box(bridgeX+side*.51,y+.31,z,.065,.66,.065,materials.black);ellipsoid(bridgeX+side*.51,y+.66,z,.055,.045,.055,materials.gold);if(i<4){const yn=.4+Math.sin((i+1)/4*Math.PI)*.27;branch([bridgeX+side*.51,y+.56,z],[bridgeX+side*.51,yn+.56,z+.61],.037,.037,materials.stoneLight);}}}
for(let i=0;i<8;i++){const x=-.5+i*.29,z=1.5+i*.16;if(Math.abs(z-streamZ(x))<streamW(x))continue;const r=mesh(stoneGeo,materials.stoneLight,x,.29,z,.28,.045,.24);r.rotation.y=rand(0,6);}
for(let i=0;i<5;i++){const x=-3.6+i*.35,z=streamZ(x)+Math.sin(i)*.15;mesh(stoneGeo,materials.stoneLight,x,.24,z,.25,.09,.24);}
// Garden lights: small pools of warmth, not oversized bloom.
function lantern(x,z){
  mesh(new THREE.CylinderGeometry(.1,.16,.23,12),materials.black,x,.37,z);
  mesh(new THREE.CylinderGeometry(.026,.045,2.1,12),materials.black,x,1.48,z);
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,2.48,z),new THREE.Vector3(x+.08,2.66,z),new THREE.Vector3(x+.33,2.65,z),new THREE.Vector3(x+.42,2.49,z)]);
  mesh(new THREE.TubeGeometry(curve,16,.025,7,false),materials.black,0,0,0);
  const glow=mat('#f4dcac',.6,{emissive:'#ffbd76',emissiveIntensity:1});glowMats.push(glow);
  mesh(new THREE.CylinderGeometry(.105,.075,.19,12),glow,x+.42,2.38,z);
  mesh(new THREE.ConeGeometry(.18,.1,16),materials.black,x+.42,2.53,z);
  ellipsoid(x+.42,2.24,z,.1,.045,.1,materials.black);
  for(const dx of [-.09,.09])box(x+.42+dx,2.37,z,.014,.23,.014,materials.black);
  const l=new THREE.PointLight('#ffce90',2.8,4,2);l.position.set(x+.42,2.35,z);scene.add(l);lampLights.push(l);
}
lantern(-3.9,1.0);lantern(3.7,3.85);lantern(2.75,.75);
const interior=new THREE.PointLight('#ffd098',4.5,6,2);interior.position.set(hx,2.25,hz+.2);scene.add(interior);lampLights.push(interior);const treeLight=new THREE.PointLight('#92aaff',5,8,2);treeLight.position.set(3,1,-1);scene.add(treeLight);

// Botanical silhouette: tapering branches and thousands of small, separated florets.
const blossoms=[],snowBlossoms=[],leaflets=[];
const barkTex=texture(128,256,(c,w,h)=>{c.fillStyle='#716a67';c.fillRect(0,0,w,h);for(let i=0;i<210;i++){c.strokeStyle=`rgba(20,24,32,${rand(.08,.32)})`;c.lineWidth=rand(.5,2);const x=rand(0,w),y=rand(0,h);c.beginPath();c.moveTo(x,y);c.lineTo(x+rand(-3,3),y+rand(12,70));c.stroke();}});const bark=mat('#aaa19b',.95,{map:barkTex});
const botanical=makeJacarandas();
blossoms.push(...botanical.flowers);snowBlossoms.push(...botanical.snow);leaflets.push(...botanical.leaves);
for(const limb of botanical.limbs){
  const curve=new THREE.CatmullRomCurve3(limb.points.map(p=>new THREE.Vector3(...p)));
  const steps=24,sides=8,frames=curve.computeFrenetFrames(steps,false),positions=[],uvs=[],indices=[];
  for(let i=0;i<=steps;i++){
    const p=curve.getPoint(i/steps),radius=THREE.MathUtils.lerp(limb.r0,limb.r1,(i/steps)**.8);
    for(let j=0;j<=sides;j++){
      const a=j/sides*Math.PI*2,offset=frames.normals[i].clone().multiplyScalar(Math.cos(a)*radius).addScaledVector(frames.binormals[i],Math.sin(a)*radius);
      positions.push(p.x+offset.x,p.y+offset.y,p.z+offset.z);uvs.push(j/sides,i/steps*3);
      if(i<steps&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,bark,0,0,0);
}
const dummy=new THREE.Object3D(),color=new THREE.Color();
const blossomMat=mat('#ffffff',.85,{emissive:'#555e9c',emissiveIntensity:.09});
const flowerGeo=new THREE.IcosahedronGeometry(1,0);
const flowerInstances=new THREE.InstancedMesh(flowerGeo,blossomMat,blossoms.length);
const palette=['#626fc2','#788cdb','#96a9ed','#b4c0f1','#5967af','#9595d7'];
blossoms.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.s,p.s*.9,p.s*.8);dummy.rotation.set(rand(0,3),rand(0,6),rand(0,3));dummy.updateMatrix();flowerInstances.setMatrixAt(i,dummy.matrix);flowerInstances.setColorAt(i,color.set(palette[Math.floor(p.c*palette.length)]));});flowerInstances.castShadow=true;flowerInstances.receiveShadow=true;garden.add(flowerInstances);
const snowFlowers=new THREE.InstancedMesh(sphere,snowMat,snowBlossoms.length);snowBlossoms.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.s,.025,p.s*.7);dummy.rotation.set(0,0,0);dummy.updateMatrix();snowFlowers.setMatrixAt(i,dummy.matrix);});garden.add(snowFlowers);snowMeshes.push(snowFlowers);
const leafInstances=new THREE.InstancedMesh(sphere,materials.leaf,leaflets.length);leaflets.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.s,.012,p.s*.5);dummy.updateMatrix();leafInstances.setMatrixAt(i,dummy.matrix);});garden.add(leafInstances);
// Ferns and bankside grasses, individually shaped but batched below.
for(let i=0;i<105;i++){const x=rand(-5,5),z=rand(-4.9,5);if(Math.abs(z-streamZ(x))<streamW(x)+.22 || (x>-2.8&&x<2&&z>-2.6&&z<1.7))continue;const size=rand(.08,.23);ellipsoid(x,.29,z,size*1.6,.05,size,materials.moss);for(let k=0;k<4;k++){const a=k*Math.PI*.5+rand(-.3,.3),e=[x+Math.cos(a)*size,.3+size*1.7,z+Math.sin(a)*size];branch([x,.27,z],e,.008,.002,materials.leaf);for(let q=0;q<3;q++){const t=.4+q*.2;const xx=THREE.MathUtils.lerp(x,e[0],t),yy=THREE.MathUtils.lerp(.27,e[1],t),zz=THREE.MathUtils.lerp(z,e[2],t);const l=ellipsoid(xx,yy,zz,size*.5,.015,size*.18,materials.leaf);l.rotation.y=a+.7;}}}
const fallenCount=1200;const fallen=new THREE.InstancedMesh(flowerGeo,blossomMat,fallenCount);for(let i=0;i<fallenCount;i++){const x=rand(-5.1,5.1),z=rand(-4.9,5.1);let y=.28;if(Math.abs(z-streamZ(x))<streamW(x))y=.22;if(x>-2.6&&x<1.7&&z>-2.4&&z<1.1)y=.12;dummy.position.set(x,y,z);dummy.scale.set(rand(.02,.05),.008,rand(.02,.045));dummy.rotation.set(0,rand(0,6),0);dummy.updateMatrix();fallen.setMatrixAt(i,dummy.matrix);fallen.setColorAt(i,color.set(palette[i%6]));}garden.add(fallen);
// Wind chime and silk strips, away from the entrance.
const windChime=new THREE.Group();windChime.position.set(1.52,2.6,.65);garden.add(windChime);branch([0,0,0],[0,-.18,0],.006,.006,materials.gold,windChime);ellipsoid(0,-.25,0,.09,.1,.09,materials.ceramic,windChime,true);box(0,-.49,0,.065,.24,.012,materials.white,windChime,true);
for(let i=0;i<5;i++){const g=new THREE.Group();g.position.set(i<3?2.4+i*.42:-3.8+i*.2,i<3?4.2+i*.2:3.5,i<3?-.2:-1.4);garden.add(g);const m=box(0,-.24,0,.07,.48,.014,mat(i%2?'#bbc9df':'#8cadd0'),g,true);const tag=box(0,-.51,0,.1,.13,.02,materials.white,g,true);ribbons.push(g);}
// Fish are below the transparent water, with tails animated independently.
for(let i=0;i<6;i++){const g=new THREE.Group(),fm=mat(['#f3d7ad','#dbaa7f','#d7dce0'][i%3]);ellipsoid(0,0,0,.055,.032,.18,fm,g,true);ellipsoid(.013,.012,.02,.035,.023,.055,materials.darkwood,g,true);const tail=mesh(new THREE.ConeGeometry(.065,.13,3),fm,0,0,-.2,1,.25,1,g,true);tail.rotation.x=-Math.PI/2;garden.add(g);fish.push({group:g,tail,phase:rand(0,6),speed:rand(.12,.23)});}
// Soft transparent puddles suggest wet surfaces without an expensive reflection pass.
const puddleMat=new THREE.MeshPhysicalMaterial({color:'#7c9db9',roughness:.09,metalness:.55,transparent:true,opacity:0,depthWrite:false});
for(let i=0;i<18;i++){const x=rand(-4.9,4.9),z=rand(3.8,5.0);const p=new THREE.Mesh(new THREE.CircleGeometry(rand(.1,.37),20),puddleMat);p.rotation.x=-Math.PI/2;p.scale.y=.6;p.position.set(x,.279,z);garden.add(p);}
// Rain, snow, petals and steam have independent motion and fade strengths.
function dotTexture(){return texture(32,32,c=>{const g=c.createRadialGradient(16,16,1,16,16,15);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,32,32);});}
const dot=dotTexture();
function pointSystem(n,size,color){const positions=new Float32Array(n*3),phase=new Float32Array(n);for(let i=0;i<n;i++){positions[i*3]=rand(-5.2,5.2);positions[i*3+1]=rand(.4,9);positions[i*3+2]=rand(-5.2,5.2);phase[i]=rand(0,6.28);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const material=new THREE.PointsMaterial({size,color,map:dot,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:true});const obj=new THREE.Points(geo,material);garden.add(obj);return{obj,positions,phase,n};}
const snow=pointSystem(950,.085,'#ecf4ff'),petals=pointSystem(100,.055,'#a4b6ed'),steam=pointSystem(30,.045,'#e1e7ee');
const rainN=1000,rainPositions=new Float32Array(rainN*6),rainSpeeds=new Float32Array(rainN);for(let i=0;i<rainN;i++){rainPositions[i*6]=rand(-5.2,5.2);rainPositions[i*6+1]=rand(.3,10);rainPositions[i*6+2]=rand(-5.2,5.2);rainSpeeds[i]=rand(4,7);}
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));const rainMat=new THREE.LineBasicMaterial({color:'#b2c9e9',transparent:true,opacity:0,depthWrite:false});const rain=new THREE.LineSegments(rainGeo,rainMat);garden.add(rain);
function isRoof(x,z){return roofHeight(x,z)>.3;}
function surfaceHeight(x,z){return roofHeight(x,z);}
const rippleGeo=new THREE.RingGeometry(.95,1,48);for(let i=0;i<26;i++){const m=new THREE.Mesh(rippleGeo,new THREE.MeshBasicMaterial({color:'#c8e0f0',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;garden.add(m);ripples.push({mesh:m,age:100,duration:1.5,scale:1});}
let rippleIndex=0;function ripple(x,z,strength=1,onGround=false){const r=ripples[rippleIndex++%ripples.length];r.mesh.position.set(x,onGround?.29:.23,z);r.age=0;r.scale=strength;r.mesh.visible=true;}
// Static meshes are merged per material to keep the detailed scene practical on phones.
garden.updateMatrixWorld(true);const batches=new Map();for(const m of staticMeshes){if(m.parent!==garden)continue;const key=m.material.uuid;if(!batches.has(key))batches.set(key,{material:m.material,geos:[]});const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);if(!g.attributes.uv){g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));}batches.get(key).geos.push(g);garden.remove(m);}
for(const {material,geos} of batches.values()){const geometry=mergeGeometries(geos,false);if(!geometry)throw Error('Scene geometry could not be combined');const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;garden.add(m);for(const g of geos)g.dispose();}
// Merge transparent snow caps as well; they fade in with weather rather than pop.
const snowGeos=[];for(const m of snowMeshes){if(m.isInstancedMesh)continue;m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);snowGeos.push(g);garden.remove(m);}const snowSurface=new THREE.Mesh(mergeGeometries(snowGeos),snowMat);snowSurface.receiveShadow=true;garden.add(snowSurface);

function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<700?THREE.MathUtils.radToDeg(2*Math.atan(Math.max(10,8.4/(w/h))/22.5)):35;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(host);resize();
const notes={clear:'The last light lingers.<br>Let the world wait a little.',rain:'A softer kind of afternoon.<br>Listen to the rain.',snow:'Where seasons dream together.<br>Blossoms beneath the snow.'};
function syncUI(){const [label,en]=timeName(state.hour);$('#clock').textContent=timeLabel(state.hour);$('#time-slider').value=state.hour;$('#time-description').textContent=en;document.querySelectorAll('[data-hour]').forEach(b=>b.setAttribute('aria-pressed',Math.abs(Number(b.dataset.hour)-state.hour)<.03));document.querySelectorAll('[data-weather]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.weather===state.weather));$('#scene-status').textContent=`${label} · ${{clear:'晴天',rain:'下雨',snow:'下雪'}[state.weather]}`;$('#scene-note').innerHTML=notes[state.weather];document.body.dataset.weather=state.weather;document.body.dataset.hour=state.hour;}
document.querySelectorAll('[data-hour]').forEach(b=>b.addEventListener('click',()=>{state=setGardenState(state,{hour:+b.dataset.hour});syncUI();}));
document.querySelectorAll('[data-weather]').forEach(b=>b.addEventListener('click',()=>{state=setGardenState(state,{weather:b.dataset.weather});syncUI();}));
$('#time-slider').addEventListener('input',e=>{state=setGardenState(state,{hour:+e.target.value});syncUI();});
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function toggleDoor(){doorOpen=!doorOpen;$('#door-button').innerHTML=doorOpen?'Stay a little longer.<span>↗</span>':'Under the jacaranda.<span>↗</span>';$('#door-button').setAttribute('aria-label',doorOpen?'合上大门':'推开大门');toast(doorOpen?'门开了，进来坐一会儿。':'把风雪留在门外。');}
$('#door-button').addEventListener('click',toggleDoor);
function pure(on){document.body.classList.toggle('pure',on);document.querySelectorAll('header,.editorial,.control-panel,footer').forEach(el=>el.inert=on);$('#pure').setAttribute('aria-pressed',on);(on?$('#restore'):$('#pure')).focus();requestAnimationFrame(resize);}
$('#pure').onclick=()=>pure(true);$('#restore').onclick=()=>pure(false);document.addEventListener('keydown',e=>{if(e.key==='Escape')pure(false);});
let resetCamera=false;$('#reset').onclick=()=>{resetCamera=true;toast('回到初见的角度。');};controls.addEventListener('start',()=>resetCamera=false);
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerStart=null;
canvas.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY,time:performance.now()};});
canvas.addEventListener('pointerup',e=>{if(!pointerStart||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5||performance.now()-pointerStart.time>500)return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const doorHit=raycaster.intersectObject(doorGroup,true);if(doorHit.length){toggleDoor();return;}const waterHit=raycaster.intersectObject(water);if(waterHit.length){ripple(waterHit[0].point.x,waterHit[0].point.z,.9);}});
syncUI();
const clock=new THREE.Clock(),backgroundA=new THREE.Color(),backgroundB=new THREE.Color(),lightC=new THREE.Color(),tempC=new THREE.Color();let elapsed=0,frame=0;
const damp=(a,b,dt,s=2)=>THREE.MathUtils.lerp(a,b,1-Math.exp(-s*dt));
function lighting(dt){shownHour=damp(shownHour,state.hour,dt);const {a,b,t}=lightInterval(shownHour);const darkness=THREE.MathUtils.lerp(a.night,b.night,t);const cloud=rainAmount*.24+snowAmount*.1;
hemi.color.copy(lightC.set(a.sky).lerp(tempC.set(b.sky),t));hemi.intensity=THREE.MathUtils.lerp(a.ambient,b.ambient,t)*(1-cloud*.35);
sun.color.copy(lightC.set(a.sun).lerp(tempC.set(b.sun),t));sun.intensity=THREE.MathUtils.lerp(a.power,b.power,t)*(1-cloud*2);const angle=(shownHour-6)/12*Math.PI;sun.position.set(-8*Math.sin(angle*.65),Math.max(3,Math.sin(angle)*11+2),7*Math.cos(angle*.4));sun.shadow.radius=rainAmount*3+2;
fill.intensity=.72+darkness*.25;treeLight.intensity=darkness*5;lampLights.forEach((l,i)=>l.intensity=(i===3?5:2.5)*(.05+darkness*.95));glowMats.forEach(m=>m.emissiveIntensity=(.1+darkness*.9)*(m.userData.glowGain??1));
backgroundA.set(a.top).lerp(backgroundB.set(b.top),t).multiplyScalar(1-cloud*.3);document.documentElement.style.setProperty('--bg-top','#'+backgroundA.getHexString());backgroundA.set(a.bottom).lerp(backgroundB.set(b.bottom),t).multiplyScalar(1-cloud*.3);document.documentElement.style.setProperty('--bg-bottom','#'+backgroundA.getHexString());
waterMat.color.set('#5b9eaf').lerp(tempC.set('#335573'),darkness*.55);waterMat.roughness=.2+rainAmount*.1;groundMat.roughness=.93-wetness*.55;groundMat.color.set('#9aa7a6').multiplyScalar(1-wetness*.17);puddleMat.opacity=wetness*.35;snowMat.opacity=accumulation*.9;snowSurface.visible=snowFlowers.visible=accumulation>.005;
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;frame++;
rainAmount=damp(rainAmount,state.weather==='rain'?1:0,dt,1.2);snowAmount=damp(snowAmount,state.weather==='snow'?1:0,dt,1.0);wetness=damp(wetness,state.weather==='rain'?1:0,dt,.35);accumulation=damp(accumulation,state.weather==='snow'?1:0,dt,.28);if(frame%3===0)lighting(dt*3);
doorGroup.rotation.y=damp(doorGroup.rotation.y,doorOpen?doorTarget.open:doorTarget.closed,dt,3);
if(resetCamera){camera.position.lerp(homePosition,1-Math.exp(-dt*3));controls.target.lerp(homeTarget,1-Math.exp(-dt*3));if(camera.position.distanceTo(homePosition)<.025)resetCamera=false;}
controls.update();windChime.rotation.z=Math.sin(elapsed*1.4)*(.07+rainAmount*.07);ribbons.forEach((g,i)=>{g.rotation.x=Math.sin(elapsed*1.3+i)*.16;g.rotation.z=Math.sin(elapsed*.8+i*2)*(.1+rainAmount*.06);});
fish.forEach((f,i)=>{const x=Math.sin(elapsed*f.speed+f.phase)*4.6,z=streamZ(x)+Math.sin(elapsed*.6+i)*.28;const nx=Math.sin((elapsed+.04)*f.speed+f.phase)*4.6,nz=streamZ(nx)+Math.sin((elapsed+.04)*.6+i)*.28;f.group.position.set(x,.13,z);f.group.rotation.y=Math.atan2(nx-x,nz-z);f.tail.rotation.z=Math.sin(elapsed*5+i)*.25;});
if(waterMat.userData.shader)waterMat.userData.shader.uniforms.uTime.value=elapsed;
rainMat.opacity=rainAmount*.32;rain.visible=rainAmount>.01;if(rain.visible){for(let i=0;i<rainN;i++){const o=i*6;rainPositions[o]+=.27*dt;rainPositions[o+1]-=rainSpeeds[i]*dt;const ground=surfaceHeight(rainPositions[o],rainPositions[o+2]);if(rainPositions[o+1]<ground){if(i%23===0&&!isRoof(rainPositions[o],rainPositions[o+2])){const x=rainPositions[o],z=rainPositions[o+2];if(Math.abs(z-streamZ(x))<streamW(x))ripple(x,z,.26);else if(z>3.8)ripple(x,z,.18,true);}rainPositions[o]=rand(-5.2,5.2);rainPositions[o+1]=rand(7.5,10);rainPositions[o+2]=rand(-5.2,5.2);}rainPositions[o+3]=rainPositions[o]-.035;rainPositions[o+4]=rainPositions[o+1]+.22;rainPositions[o+5]=rainPositions[o+2];}rainGeo.attributes.position.needsUpdate=true;}
snow.obj.material.opacity=snowAmount*.88;snow.obj.visible=snowAmount>.01;if(snow.obj.visible){for(let i=0;i<snow.n;i++){const o=i*3;snow.positions[o]+=Math.sin(elapsed*.65+snow.phase[i])*.13*dt;snow.positions[o+1]-=(.24+(i%7)*.045)*dt;snow.positions[o+2]+=Math.cos(elapsed*.4+snow.phase[i])*.06*dt;if(snow.positions[o+1]<surfaceHeight(snow.positions[o],snow.positions[o+2])){snow.positions[o]=rand(-5.2,5.2);snow.positions[o+1]=rand(7.5,9);snow.positions[o+2]=rand(-5.2,5.2);}}snow.obj.geometry.attributes.position.needsUpdate=true;}
petals.obj.material.opacity=.55*(1-rainAmount*.7)*(1-snowAmount*.4);for(let i=0;i<petals.n;i++){const o=i*3;petals.positions[o]+=Math.sin(elapsed*.5+petals.phase[i])*.1*dt;petals.positions[o+1]-=.11*dt;petals.positions[o+2]+=.055*dt;if(petals.positions[o+1]<surfaceHeight(petals.positions[o],petals.positions[o+2])){petals.positions[o]=rand(-4.7,4.7);petals.positions[o+1]=rand(4.5,6.5);petals.positions[o+2]=rand(-3.2,1);}}petals.obj.geometry.attributes.position.needsUpdate=true;
steam.obj.material.opacity=.16+snowAmount*.1;for(let i=0;i<steam.n;i++){const o=i*3,t=(elapsed*.2+i/steam.n)%1;steam.positions[o]=tx+.2+Math.sin(elapsed+i)*t*.025;steam.positions[o+1]=1.2+t*.5;steam.positions[o+2]=tz+(i%2?.15:-.13)+Math.cos(elapsed+i)*t*.02;}steam.obj.geometry.attributes.position.needsUpdate=true;
for(const r of ripples){r.age+=dt;if(r.age>r.duration){r.mesh.visible=false;continue;}const p=r.age/r.duration;r.mesh.scale.setScalar((.02+p*.6)*r.scale);r.mesh.material.opacity=(1-p)*.45;}
renderer.render(scene,camera);if(frame===3){$('#loading').classList.add('loaded');document.body.dataset.ready='true';}
}animate();









