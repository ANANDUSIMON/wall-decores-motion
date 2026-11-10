import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {PostFX} from '../PostFX';
import {Texture} from '../Texture';
import {C,GRID,tween,type} from '../theme';

export const Shot5: React.FC=()=>{
  const f=useCurrentFrame(), x=GRID.margin,y=205,w=970,h=650;
  const segments=[
    {x1:x,y1:y,x2:x+w,y2:y}, {x1:x+w,y1:y,x2:x+w,y2:y+h},
    {x1:x+w,y1:y+h,x2:x,y2:y+h}, {x1:x,y1:y+h,x2:x,y2:y},
  ];
  return <PostFX><AbsoluteFill style={{background:C.nearBlack,overflow:'hidden'}}>
    <AbsoluteFill style={{left:x+12,top:y+12,width:w-24,height:h-24,overflow:'hidden',opacity:tween(f,34,53),transform:`scale(${tween(f,0,105,1,1.07)})`}}><Texture/></AbsoluteFill>
    <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
      {segments.map((s,i)=> <line key={i} {...s} stroke={C.gold} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-tween(f,i*9,i*9+17)}/>)}
      <line x1="1090" y1="526" x2="1190" y2="526" stroke={C.gold} strokeWidth="1" pathLength="1" strokeDasharray="1" strokeDashoffset={1-tween(f,48,65)}/>
      <circle cx="1090" cy="526" r="4" fill={C.gold} opacity={tween(f,55,65)}/>
    </svg>
    <div style={{position:'absolute',left:1220,top:396,width:565}}>
      {['IMPASTO','OIL ON CANVAS','BESPOKE SCALE'].map((label,i)=><div key={label} style={{...type.body,fontSize:i===0?43:27,fontWeight:i===0?800:500,color:i===0?C.gold:C.cream,
        marginBottom:34,letterSpacing:i===0?'.05em':'.12em',opacity:tween(f,39+i*11,52+i*11),transform:`translateY(${tween(f,39+i*11,52+i*11,24,0)}px)`}}>{label}</div>)}
    </div>
    <div style={{position:'absolute',left:GRID.margin,bottom:110,...type.kicker,color:C.gold}}>MADE FOR YOUR SPACE</div>
  </AbsoluteFill></PostFX>;
};
