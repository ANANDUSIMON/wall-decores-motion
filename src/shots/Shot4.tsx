import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {BrushStroke} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {C,GRID,tween,type} from '../theme';

export const Shot4: React.FC=()=>{
  const f=useCurrentFrame(), second=f>=33;
  return <PostFX hardCut><AbsoluteFill style={{background:C.cream,overflow:'hidden'}}>
    <div style={{position:'absolute',left:GRID.margin,top:345,...type.display,color:C.nearBlack,fontSize:170,
      transform:`translateX(${second?0:tween(f,0,8,38,0)}px)`}}>{second?'PAINTED.':'NOT PRINTED.'}</div>
    {second && <>
      <BrushStroke color={C.burntOrange} x1={GRID.margin} y1={690} x2={1660} y2={655}
        spine="M120 690 C480 635 1090 705 1660 655" thickness={115} bristleCount={80} dryness={.17}
        revealStart={35} revealDuration={.8} seed={401}/>
      <div style={{position:'absolute',left:1680,top:632,width:25,height:25,background:C.rose,
        opacity:tween(f,56,63),transform:`scale(${tween(f,56,63,.5,1)})`}}/>
    </>}
    <div style={{position:'absolute',left:GRID.margin,bottom:110,...type.kicker,color:C.nearBlack,
      opacity:tween(f,58,72),transform:`translateY(${tween(f,58,72,12,0)}px)`}}>REAL HANDS. REAL CANVAS.</div>
  </AbsoluteFill></PostFX>;
};
