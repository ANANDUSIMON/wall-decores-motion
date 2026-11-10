import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {BrushStroke,generateBristles} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {Texture} from '../Texture';
import {C,GRID,tween,type} from '../theme';

const Edge: React.FC<{id:string;y:number;p:number;seed:number}>=({id,y,p,seed})=>{
  const bristles=generateBristles({x1:90,y1:y,x2:1740,y2:y,width:145,count:70,seed,dryness:.13});
  return <mask id={id}><rect width="1920" height="1080" fill="black"/>
    <rect x="0" y={y-119} width={Math.max(0,1590*p)} height="192" fill="white"/>
    <g fill="white" transform={`translate(${1590*p-150} 0)`}>{bristles.map((b,i)=><path key={i} d={b.d} opacity={b.opacity}/>)}</g>
  </mask>;
};
export const Shot2: React.FC=()=>{
  const f=useCurrentFrame(), a=tween(f,5,25), b=tween(f,18,39), zoom=tween(f,0,105,1,1.08);
  const slice=f<76?0:tween(f,76,103);
  return <PostFX><AbsoluteFill style={{background:C.nearBlack,overflow:'hidden'}}>
    <AbsoluteFill style={{left:910,top:170,width:850,height:750,clipPath:'polygon(2% 12%,93% 0,100% 88%,15% 100%,0 76%)',opacity:tween(f,15,36),transform:`scale(${zoom})`}}><Texture/></AbsoluteFill>
    <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      <defs><Edge id="every-matte" y={390} p={a} seed={211}/><Edge id="surface-matte" y={618} p={b} seed={212}/></defs>
      <text x={GRID.margin} y="465" mask="url(#every-matte)" fill={C.cream} style={type.display}>EVERY</text>
      <text x={GRID.margin} y="692" mask="url(#surface-matte)" fill={C.cream} style={type.display}>SURFACE</text>
    </svg>
    <BrushStroke color={C.gold} x1={110} y1={390} x2={1450} y2={390} thickness={33} seed={213} progress={a}/>
    <BrushStroke color={C.burntOrange} x1={110} y1={618} x2={1590} y2={618} thickness={34} seed={214} progress={b}/>
    <div style={{position:'absolute',left:GRID.margin,bottom:104,...type.kicker,color:C.gold,opacity:tween(f,31,47),transform:`translateY(${tween(f,31,47,12,0)}px)`}}>TEXTURE IS THE HERO</div>
    {slice>0 && <AbsoluteFill style={{background:C.emerald,clipPath:`polygon(${110-slice*145}% 100%,${135-slice*145}% 0,140% 0,140% 100%)`}}/>}
  </AbsoluteFill></PostFX>;
};
