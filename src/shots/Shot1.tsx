import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {BrushStroke} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {Texture} from '../Texture';
import {C,GRID,tween,type} from '../theme';

export const Shot1: React.FC=()=>{
  const f=useCurrentFrame(), line=tween(f,0,12), paint=tween(f,9,32), rule=tween(f,25,40);
  return <PostFX><AbsoluteFill style={{background:C.nearBlack,overflow:'hidden'}}>
    <div style={{position:'absolute',left:GRID.margin,top:540,width:1680,height:2,background:C.gold,transform:`scaleX(${line})`,filter:f<12?'drop-shadow(8px 0 5px #c8a87088)':undefined}}/>
    <AbsoluteFill style={{clipPath:`polygon(0 0,${Math.max(0,paint*115-15)}% 0,${Math.max(0,paint*115+22)}% 100%,0 100%)`}}><Texture light/></AbsoluteFill>
    <BrushStroke color={C.gold} x1={165} y1={90} x2={1770} y2={840} thickness={130} bristleCount={78} dryness={.14} revealStart={9} revealDuration={.8} seed={101}/>
    <div style={{position:'absolute',left:680,top:0,width:2,height:360,background:C.gold,transform:`scaleY(${rule})`,transformOrigin:'top'}}/>
    <div style={{position:'absolute',left:GRID.margin,bottom:112,...type.kicker,color:C.nearBlack,opacity:tween(f,36,49),transform:`translateY(${tween(f,36,49,14,0)}px)`}}>ANGAMALY � KERALA</div>
  </AbsoluteFill></PostFX>;
};
