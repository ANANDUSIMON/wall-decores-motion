import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {BrushStroke} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {C,GRID,tween,type} from '../theme';

export const Shot6: React.FC=()=>{
  const f=useCurrentFrame(), sweep=tween(f,9,31),line=tween(f,27,43);
  return <PostFX><AbsoluteFill style={{background:C.nearBlack,overflow:'hidden'}}>
    {[C.gold,C.emerald,C.burntOrange].map((color,i)=><div key={color} style={{position:'absolute',left:GRID.margin+i*560,top:390,width:440,height:2,background:color,
      opacity:.2*(1-tween(f,0,14)),transform:`translateX(${tween(f,0,14,(i-1)*320,0)}px) scaleX(${1-tween(f,0,14)})`}}/>)}
    <BrushStroke color={C.gold} x1={260} y1={480} x2={1680} y2={480} thickness={110} bristleCount={75} seed={601} revealStart={5} revealDuration={.85}/>
    <div style={{position:'absolute',left:GRID.margin,top:378,width:1680,overflow:'hidden',clipPath:`inset(0 ${100-sweep*100}% 0 0)`}}>
      <div style={{...type.display,fontSize:143,color:C.cream,whiteSpace:'nowrap',letterSpacing:'.12em',transform:`translateX(${tween(f,9,31,25,0)}px)`}}>WALL DECORES</div>
    </div>
    <div style={{position:'absolute',left:GRID.margin,top:580,width:1680,height:1,background:C.gold,
      transform:`scaleX(${line})`,transformOrigin:'center'}}/>
    <div style={{position:'absolute',left:GRID.margin,top:620,width:1680,textAlign:'center',...type.body,color:C.gold,letterSpacing:'.4em',
      opacity:tween(f,36,48),transform:`translateY(${tween(f,36,48,18,0)}px)`}}>ARTISAN � COLLECTIVES</div>
    <div style={{position:'absolute',left:GRID.margin,bottom:110,width:1680,textAlign:'center',...type.body,fontSize:19,color:C.cream,letterSpacing:'.1em',
      opacity:tween(f,52,66),transform:`translateY(${tween(f,52,66,10,0)}px)`}}>walldecores.com � @wall_decores_artisan � 9037790012</div>
  </AbsoluteFill></PostFX>;
};
