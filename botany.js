// Keep geometry out of the complete facade, balcony and roof envelope, not just its centre.
export function insideArchitecture(x,y,z,padding=0){
  if(y<.23 || y>6.95+padding)return false;
  return (x> -2.78-padding && x<1.92+padding && z> -2.99-padding && z<.83+padding)
    || (Math.hypot(x+1.8,z-.25)<1.26+padding && y<6.3+padding);
}
export function makeJacarandas(){
  let seed=82812;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const rand=(a,b)=>a+(b-a)*random();
  const limbs=[],flowers=[],leaves=[],snow=[];
  const quad=(a,b,c,t)=>a.map((v,i)=>(1-t)**2*v+2*(1-t)*t*b[i]+t*t*c[i]);
  function limb(a,b,c,r0,r1){
    const pts=Array.from({length:21},(_,i)=>quad(a,b,c,i/20));
    if(pts.some((p,i)=>insideArchitecture(...p,r0+(1-i/20)*.06+.16)))return null;
    limbs.push({points:pts,r0,r1});return pts;
  }
  function panicle(cx,cy,cz,s){
    // Small connected flower sprays build an irregular volume; no stacked sphere canopies.
    for(let bunch=0;bunch<9;bunch++){
      const a=rand(0,Math.PI*2),rad=rand(.12,1),bx=cx+Math.cos(a)*s*rad,by=cy+rand(-.48,.4)*s,bz=cz+Math.sin(a)*s*rad*.8;
      for(let i=0;i<32;i++){
        const angle=rand(0,Math.PI*2),r=Math.sqrt(random())*s*.37;
        const x=bx+Math.cos(angle)*r,y=by+rand(-.22,.2)*s,z=bz+Math.sin(angle)*r;
        if(insideArchitecture(x,y,z,.13))continue;
        flowers.push({x,y,z,s:rand(.027,.067),c:random()});
        if(i<2)snow.push({x,y:y+.065,z,s:rand(.04,.10)});
        if(i===2)leaves.push({x,y:y-.07,z,s:rand(.04,.075)});
      }
    }
  }
  const trees=[
    {x:3.65,z:-.6,h:9.0,spread:2.65,lean:.3},
    {x:-3.9,z:-1.9,h:7.85,spread:2.12,lean:-.18},
    {x:1.65,z:-4.1,h:8.45,spread:2.35,lean:.1},
    {x:-4.05,z:1.13,h:5.05,spread:1.4,lean:-.12}
  ];
  for(const tree of trees){
    const {x,z,h,spread,lean}=tree;
    const trunk=limb([x,.26,z],[x-.3,h*.4,z+.12],[x+lean,h*.86,z-.18],.29*h/9,.055);
    if(!trunk)throw Error('Tree trunk overlaps the architecture');
    // Branches begin on the same curved trunk; each successful limb carries its own flowers.
    for(let j=0;j<14;j++){
      const t=.32+j*.043,a=quad([x,.26,z],[x-.3,h*.4,z+.12],[x+lean,h*.86,z-.18],t);
      const angle=j*2.39996+rand(-.22,.22),radius=spread*rand(.64,1.05);
      const end=[x+Math.cos(angle)*radius,h*(.59+j*.026)+rand(-.12,.25),z+Math.sin(angle)*radius];
      const mid=[a[0]+Math.cos(angle-.18)*radius*.48,a[1]+h*.16,a[2]+Math.sin(angle-.18)*radius*.48];
      const primary=limb(a,mid,end,.092*(1-j/24),.013);if(!primary)continue;
      for(let k=0;k<4;k++){
        const u=.45+k*.17,start=quad(a,mid,end,u),side=angle+(k%2?.85:-.85);
        const tip=[start[0]+Math.cos(side)*spread*.24,start[1]+rand(.08,.4),start[2]+Math.sin(side)*spread*.24];
        const bend=[(start[0]+tip[0])/2,start[1]+rand(.02,.2),(start[2]+tip[2])/2];
        if(limb(start,bend,tip,.024,.004))panicle(...tip,spread*rand(.25,.36));
      }
      panicle(...end,spread*.34);
    }
    panicle(x+lean,h*.91,z-.18,spread*.48);
    for(let j=0;j<7;j++){const angle=j/7*Math.PI*2;limb([x,.47,z],[x+Math.cos(angle)*.25,.28,z+Math.sin(angle)*.25],[x+Math.cos(angle)*.48,.27,z+Math.sin(angle)*.48],.075,.012);}
  }
  // This branch crosses in front of the upper windows, with real depth and facade clearance.
  const a=[3.5,4.8,-.55],b=[4.65,5.6,2.35],c=[.45,5.9,1.9];
  if(limb(a,b,c,.115,.014))for(let k=0;k<8;k++){const p=quad(a,b,c,.38+k*.085);panicle(p[0],p[1]+.12,p[2],.52+random()*.12);}
  return {limbs,flowers,leaves,snow};
}

