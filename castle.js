// Reference-led pale stone residence: rounded tower, layered terraces and tall windows.
// Flat parapets follow the supplied image instead of inventing conical fantasy roofs.
export function buildCastle({THREE,garden,mesh,box,ellipsoid,branch,snowCap,mat,materials,staticMeshes,snowMeshes,snowMat,glowMats,texture}) {
  const hx=-.45,hz=-1.1,front=.55;
  const stone=mat('#dedbd1',.93),trim=mat('#f0e9db',.82),recess=mat('#354655',.8),iron=mat('#465463',.5,{metalness:.38}),doorWood=mat('#586a77',.65);
  const glass=mat('#d8d0af',.35,{emissive:'#ffd292',emissiveIntensity:.7});
  const glassDim=mat('#a7b5bc',.35,{emissive:'#eed8b0',emissiveIntensity:.25});glowMats.push(glass,glassDim);
  glassDim.userData.glowGain=.28;
  const plasterMap=texture(128,128,(c,w,h)=>{c.fillStyle='#e7e3d8';c.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const n=Math.sin(i*127.1)*43758.5453;const x=((n%1)+1)%1*w,y=((Math.sin(i*71.7)*1031.7%1)+1)%1*h;c.fillStyle=i%2?'rgba(70,75,92,.055)':'rgba(255,255,255,.11)';c.fillRect(x,y,1,1);}});plasterMap.wrapS=plasterMap.wrapT=THREE.RepeatWrapping;plasterMap.repeat.set(3,3);stone.map=plasterMap;stone.bumpMap=plasterMap;stone.bumpScale=.018;
  const curtain=texture(64,128,(c,w,h)=>{c.fillStyle='#d5c4a5';c.fillRect(0,0,w,h);for(let x=0;x<w;x++){const v=Math.round(205+Math.sin(x*.55)*25);c.fillStyle=`rgb(${v},${v-9},${v-29})`;c.fillRect(x,0,1,h);}const grad=c.createLinearGradient(0,0,0,h);grad.addColorStop(0,'rgba(35,42,57,.28)');grad.addColorStop(.5,'rgba(255,223,158,.02)');grad.addColorStop(1,'rgba(75,63,44,.14)');c.fillStyle=grad;c.fillRect(0,0,w,h);});glass.map=curtain;glass.emissiveMap=curtain;glassDim.map=curtain;
  const floor=mat('#aab2b5',.78);
  function archShape(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);return s;}
  function archPanel(x,y,z,w,h,material,angle=0){const m=mesh(new THREE.ShapeGeometry(archShape(w,h),22),material,x,y,z);m.rotation.y=angle;return m;}
  function window(x,y,z,w=.66,h=1.32,angle=0,lit=true){
    const nx=Math.sin(angle),nz=Math.cos(angle),cx=Math.cos(angle),cz=-Math.sin(angle);
    const piece=(dx,dy,depth,bw,bh,bd,material)=>{const m=box(x+cx*dx+nx*depth,y+dy,z+cz*dx+nz*depth,bw,bh,bd,material);m.rotation.y=angle;return m;};
    piece(0,h/2,0,w+.09,h+.06,.025,recess);
    piece(0,h/2,.025,w-.035,h-.055,.016,lit?glass:glassDim);
    for(const dx of [-w/2-.035,w/2+.035])piece(dx,h/2,.045,.065,h+.06,.11,trim);
    piece(0,h+.025,.045,w+.15,.075,.12,trim);
    piece(0,h+.105,.015,w+.24,.055,.19,trim);
    piece(0,h*.5,.052,.025,h-.055,.025,materials.stoneLight);
    for(const dy of [.36,.73])if(dy<h-.15)piece(0,dy,.055,w-.04,.022,.025,materials.stoneLight);
    for(const side of [-1,1]){piece(side*(w/2+.145),h/2,.012,.14,h+.07,.045,stone);for(let i=0;i<8;i++)piece(side*(w/2+.145),.09+i*(h-.1)/8,.04,.1,.025,.025,trim);}
    piece(0,-.035,.025,w+.22,.09,.22,trim);
    piece(0,-.13,0,w+.05,.1,.1,stone);
  }
  function slab(x,y,z,w,d){box(x,y,z,w,.12,d,trim);snowCap(x,y+.08,z,w,.035,d);}
  function ring(x,y,z,r,h,material=trim){return mesh(new THREE.CylinderGeometry(r,r,h,48),material,x,y,z);}
  function snowDisc(x,y,z,r){const m=mesh(new THREE.CylinderGeometry(r,r,.03,48),snowMat,x,y,z,1,1,1,garden,true);snowMeshes.push(m);}
  // The main three-storey building has a real recessed entrance on its ground floor.
  box(hx,.39,hz,4.65,.26,3.7,materials.stone);
  box(hx,.57,hz,4.53,.13,3.6,trim);
  box(hx,3.84,hz,4.35,3.46,3.25,stone);
  box(hx,1.36,hz-1.5,4.35,1.57,.23,stone);
  box(hx-2.07,1.36,hz,.22,1.57,3.2,stone);
  box(hx+2.07,1.36,hz,.22,1.57,3.2,stone);
  const doorX=.48;
  box(-1.35,1.36,front,1.82,1.57,.22,stone);
  box(1.44,1.36,front,.7,1.57,.22,stone);
  box(doorX,2.04,front,1.25,.28,.22,stone);
  box(hx,.66,hz,4.15,.08,3.15,floor);
  for(const y of [.69,2.28,3.94,5.59])slab(hx,y,hz,4.55,3.48);
  for(const x of [hx-2.13,hx+2.13]){box(x,3.08,front+.06,.14,4.84,.16,trim);for(let i=0;i<14;i++)box(x,.84+i*.335,front+.12,.24,.14,.12,trim);}
  // Recessed flat roof and stepped parapets, with crisp shadow lines.
  box(hx,5.68,hz,4.18,.1,3.1,materials.roof);
  for(const z of [hz-1.62,hz+1.62]){box(hx,5.91,z,4.4,.46,.16,stone);slab(hx,6.15,z,4.48,.23);}
  for(const x of [hx-2.12,hx+2.12]){box(x,5.91,hz,.16,.46,3.3,stone);slab(x,6.15,hz,.24,3.4);}
  box(hx+.2,6.13,front,1.35,.35,.18,stone);slab(hx+.2,6.32,front,1.5,.28);
  snowCap(hx,5.76,hz,4.18,.025,3.1);
  // Front tall windows and subtle decorative relief panels.
  for(const x of [-1.65,-.36,.94]){window(x,2.56,front+.125,.67,1.12,0,x!==-.36);window(x,4.19,front+.125,.67,1.14,0,x!==.94);}
  for(const z of [-2.1,-.9,.23]){window(hx+2.19,.85,z,.63,1.17,Math.PI/2,z!==-.9);window(hx+2.19,2.56,z,.63,1.12,Math.PI/2);window(hx+2.19,4.2,z,.63,1.12,Math.PI/2,false);}
  for(const x of [-1.6,-.3,1]){window(x,2.57,hz-1.64,.63,1.1,Math.PI,false);window(x,4.2,hz-1.64,.63,1.1,Math.PI);}
  for(const y of [2.02,3.69,5.33])for(const x of [-1.64,-.34, .96]){box(x,y,front+.13,.83,.08,.08,trim);box(x,y-.1,front+.11,.56,.035,.055,trim);}
  // Rounded projecting tower, the distinctive silhouette in the reference.
  const towerX=-1.8,towerZ=.25,r=.97;
  ring(towerX,3.15,towerZ,r,5.12,stone);
  for(const y of [.64,2.29,3.96,5.72]){ring(towerX,y,towerZ,r+.12,.13);ring(towerX,y-.11,towerZ,r+.055,.08,stone);snowDisc(towerX,y+.08,towerZ,r+.1);}
  ring(towerX,5.91,towerZ,r+.02,.38,stone);ring(towerX,6.14,towerZ,r+.13,.12);snowDisc(towerX,6.22,towerZ,r+.12);
  ring(towerX,6.17,towerZ,r-.12,.04,materials.roof);
  for(const angle of [-.98,0,.98])for(const y of [.91,2.57,4.25]){window(towerX+Math.sin(angle)*(r+.015),y,towerZ+Math.cos(angle)*(r+.015),.5,1.15,angle,y!==4.25||angle===0);}
  // Curved balconies with slim wrought-iron railings, matching the cream street villa.
  for(const y of [2.29]){
    ring(towerX,y,towerZ,1.22,.11);snowDisc(towerX,y+.07,towerZ,1.22);
    const railPoints=[];for(let i=0;i<=36;i++){const a=-1.65+i/36*3.3;railPoints.push(new THREE.Vector3(towerX+Math.sin(a)*1.19,y+.57,towerZ+Math.cos(a)*1.19));if(i%2===0){branch([towerX+Math.sin(a)*1.19,y+.08,towerZ+Math.cos(a)*1.19],[towerX+Math.sin(a)*1.19,y+.57,towerZ+Math.cos(a)*1.19],.013,.013,iron);}}
    const rail=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPoints),48,.021,6,false),iron,0,0,0);
  }
  // Entry arch, lanterns, stone steps, and a hinged paneled door.
  archPanel(doorX,.64,front+.13,1.12,1.64,recess);
  const entryArc=mesh(new THREE.TorusGeometry(.59,.075,8,32,Math.PI),trim,doorX,1.7,front+.19);
  for(const x of [doorX-.59,doorX+.59]){box(x,1.17,front+.19,.14,1.08,.24,trim);box(x,.69,front+.19,.22,.16,.32,trim);}
  const doorGroup=new THREE.Group();doorGroup.position.set(doorX-.44,0,front+.18);garden.add(doorGroup);
  box(.44,1.29,0,.87,1.27,.07,doorWood,doorGroup,true);
  for(const x of [.23,.65]){box(x,1.56,.044,.32,.58,.025,glass,doorGroup,true);box(x,.93,.045,.32,.34,.025,materials.wood,doorGroup,true);}
  box(.44,1.57,.065,.035,.62,.025,iron,doorGroup,true);ellipsoid(.75,1.2,.09,.028,.028,.025,materials.gold,doorGroup,true);
  for(let i=0;i<3;i++){box(doorX,.3+i*.11,1.35-i*.23,1.4-i*.13,.11,.6,trim);snowCap(doorX,.37+i*.11,1.4-i*.23,1.4-i*.13,.025,.43);}
  for(const x of [doorX-.87,doorX+.87]){box(x,1.92,front+.19,.1,.32,.15,iron);box(x,1.92,front+.31,.16,.24,.16,glass);box(x,2.08,front+.31,.23,.06,.23,iron);}
  // A small upper terrace and two chimneys complete the layered roofline.
  box(.6,6.42,-1.94,.36,.65,.44,stone);slab(.6,6.78,-1.94,.48,.55);
  box(-1.1,6.33,-2.07,.3,.48,.36,stone);slab(-1.1,6.59,-2.07,.42,.47);
  // Café furniture tucked against the facade and a vintage bicycle near the door.
  const tx=.85,tz=-.48;
  box(tx,1.09,tz,.75,.06,.48,materials.wood);
  for(const x of [-.28,.28])for(const z of [-.16,.16])box(tx+x,.85,tz+z,.035,.45,.035,iron);
  ellipsoid(tx,1.19,tz,.1,.09,.1,materials.ceramic);
  for(const z of [-.13,.13])mesh(new THREE.CylinderGeometry(.045,.035,.06,10),materials.ceramic,tx+.2,1.16,tz+z);
  // The bicycle is beside the east wall, outside both the turret and the full door sweep.
  const bike=new THREE.Group();bike.position.set(2.55,.27,-.4);bike.rotation.y=Math.PI/2;garden.add(bike);
  const bikeY=.26;
  for(const x of [-.35,.35]){mesh(new THREE.TorusGeometry(.25,.021,7,32),iron,x,bikeY,0,1,1,1,bike);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;branch([x,bikeY,0],[x+Math.cos(a)*.23,bikeY+Math.sin(a)*.23,0],.003,.003,materials.stoneLight,bike);}}
  const rear=[-.35,bikeY,0],pedal=[.02,bikeY-.025,0],seat=[-.1,bikeY+.31,0],head=[.23,bikeY+.32,0],frontWheel=[.35,bikeY,0];
  for(const [a,b] of [[rear,seat],[seat,pedal],[pedal,rear],[seat,head],[head,pedal],[head,frontWheel]])branch(a,b,.014,.014,materials.ceramic,bike);
  box(-.1,bikeY+.37,0,.18,.035,.1,iron,bike);branch(head,[.21,bikeY+.47,0],.013,.013,iron,bike);branch([.21,bikeY+.47,-.14],[.21,bikeY+.47,.14],.013,.013,iron,bike);
  branch([.02,bikeY-.025,0],[.02,bikeY-.025,.12],.014,.014,iron,bike);box(.08,bikeY-.025,.12,.13,.025,.055,iron,bike);
  branch([-.03,bikeY-.025,0],[-.14,.015,.12],.012,.012,iron,bike);
  // A small slatted bench, separated from the tower and the nearest trunk.
  for(let i=0;i<4;i++){box(-3.6,.64,-.1+i*.085,1.05,.035,.07,materials.wood);box(-3.6,.81+i*.075,-.18,1.05,.052,.035,materials.wood);}
  for(const x of [-3.99,-3.21]){box(x,.46,.02,.035,.36,.3,iron);box(x,.86,-.19,.035,.6,.035,iron);}
  for(const x of [-2.9,1.65]){mesh(new THREE.CylinderGeometry(.21,.15,.35,16),stone,x,.48,1.08);ellipsoid(x,.74,1.08,.3,.28,.27,materials.leaf);}
  // Pale flagstones connect the entrance with the riverside path.
  for(let x=-3.1;x<2.1;x+=.42)for(let z=1.28;z<1.75;z+=.39)box(x,.284,z,.39,.035,.36,floor);
  function roofHeight(x,z){if(Math.hypot(x-towerX,z-towerZ)<1.24)return 6.23;if(x>hx-2.25&&x<hx+2.25&&z>hz-1.78&&z<hz+1.78)return 6.32;return .25;}
  return {hx,hz,tx,tz,doorGroup,doorTarget:{open:-Math.PI*.48,closed:0},roofHeight};
}
