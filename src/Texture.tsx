import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from './theme';

// Procedural canvas/impasto surface: ridged paint, fibre crosshatch, directional glancing light.
export const Texture: React.FC<{light?: boolean; scale?: number}> = ({light=false,scale=1}) => {
  const base=light?C.cream:C.gold;
  return <AbsoluteFill style={{overflow:'hidden',transform:`scale(${scale})`,backgroundColor:base,
    backgroundImage:`radial-gradient(ellipse at 27% 30%,${light?'#fff9e9':'#f4d9a1'} 0%,transparent 40%),radial-gradient(ellipse at 72% 68%,${light?'#9b8b72':'#543b24'} 0%,transparent 47%),repeating-linear-gradient(18deg,transparent 0px,rgba(34,22,14,.21) 2px,rgba(255,255,255,.22) 4px,transparent 8px,transparent 15px)`}}>
    <svg viewBox="0 0 1920 1080" preserveAspectRatio="none" width="100%" height="100%" style={{mixBlendMode:'multiply',opacity:.56}}>
      <defs><filter id="impasto"><feTurbulence type="fractalNoise" baseFrequency=".012 .16" numOctaves={3} seed={17}/><feColorMatrix type="saturate" values="0"/></filter></defs>
      <rect width="1920" height="1080" filter="url(#impasto)" opacity=".39"/>
      {Array.from({length:90},(_,i)=>{
        const y=(i*83)%1120-20, x=(i*179)%1840-50;
        return <path key={i} d={`M${x} ${y} q140 -20 330 8 t390 -4`} fill="none" stroke={i%3===0?'#fff8e5':'#55412f'} strokeWidth={2+(i%7)*1.3} opacity={.07+(i%5)*.025}/>;
      })}
    </svg>
    <AbsoluteFill style={{opacity:.12,backgroundImage:'repeating-linear-gradient(0deg,transparent 0px,transparent 3px,#5c4a38 4px),repeating-linear-gradient(90deg,transparent 0px,transparent 3px,#5c4a38 4px)'}}/>
  </AbsoluteFill>;
};
