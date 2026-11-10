import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {BrushStroke} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {C,GRID,tween,type} from '../theme';

const lines=['HAND-MIXED','HAND-LAID','HAND-FINISHED'];
export const Shot3: React.FC=()=>{
  const f=useCurrentFrame();
  return <PostFX><AbsoluteFill style={{background:C.nearBlack,overflow:'hidden'}}>
    <AbsoluteFill style={{background:C.emerald,clipPath:`polygon(0 0,${100-tween(f,0,9,0,120)}% 0,${125-tween(f,0,9,0,120)}% 100%,0 100%)`}}/>
    {[0,1,2].map((i)=><React.Fragment key={i}>
      <div style={{position:'absolute',left:GRID.margin+i*560,top:130,width:1,height:790,background:C.cream,opacity:.08}}/>
      <BrushStroke x1={400+i*560} y1={135} x2={400+i*560} y2={790} color={[C.gold,C.emerald,C.burntOrange][i]} thickness={125} bristleCount={72} seed={301+i} revealStart={9+i*4} revealDuration={.7}/>
    </React.Fragment>)}
    <div style={{position:'absolute',left:GRID.margin,top:320,width:1680,height:170,overflow:'hidden'}}>
      {lines.map((label,i)=>{
        const start=21+i*32, enter=tween(f,start,start+10), leave=i===2?0:tween(f,start+24,start+32);
        return <div key={label} style={{position:'absolute',left:0,top:0,...type.display,fontSize:142,color:C.cream,
          opacity:enter*(1-leave),transform:`translateY(${(1-enter)*145-leave*145}px)`}}>{label}</div>;
      })}
    </div>
    <div style={{position:'absolute',right:GRID.margin,bottom:112,...type.kicker,color:C.gold,opacity:tween(f,70,82),transform:`translateY(${tween(f,70,82,14,0)}px)`}}>FIVE YEARS � ONE STUDIO</div>
  </AbsoluteFill></PostFX>;
};
