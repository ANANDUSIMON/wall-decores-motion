import React from 'react';
import { AbsoluteFill, Series, interpolate, useCurrentFrame } from 'remotion';
import { interFontFamily, instrumentSerifFontFamily } from '../fonts';
import { VEASE } from './theme';

const paper = '#f4eee2';
const ink = '#181b1a';
const coral = '#ef7059';
const jade = '#27685d';
const ochre = '#e5b54f';
const blue = '#c2dbe6';
const pigments = [coral, ochre, jade];
const ease = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    easing: VEASE.entrance, extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

/** Original botanical print. Each petal grows from the same painted centre. */
function Bloom({ progress = 1 }: { progress?: number }) {
  return <svg width="100%" height="100%" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#e7d7b8"/>
    <path d="M0 375 Q100 135 400 32 V400 H0" fill={jade}/>
    {Array.from({length: 12}, (_, i) => {
      const reveal = Math.max(0, Math.min(1, progress * 2 - i / 12));
      return <g key={i} transform={`translate(195 201) rotate(${i * 30}) scale(${reveal})`}>
        <path d="M0 6 Q-64 -62 -12 -153 Q39 -103 0 6Z" fill={i % 3 === 0 ? ochre : coral}/>
        <path d="M0 4 Q-18 -73 -12 -138" fill="none" stroke={ink} strokeWidth="2"/>
      </g>;
    })}
    <circle cx="195" cy="201" r={24 * progress} fill={ink}/>
  </svg>;
}

function Page({background, light = false, children}: {
  background: string; light?: boolean; children: React.ReactNode;
}) {
  return <AbsoluteFill style={{background, color:light ? paper : ink, fontFamily:interFontFamily, overflow:'hidden'}}>
    <div style={{position:'absolute', left:84, right:84, top:104, borderTop:'3px solid currentColor',
      paddingTop:19, fontSize:24, letterSpacing:3, fontWeight:700}}>WALL DECORES / ARTISAN COLLECTIVES</div>
    {children}
  </AbsoluteFill>;
}

function Title({first, second, frame}: {first:string; second:string; frame:number}) {
  return <div style={{position:'absolute', left:84, right:84, top:246}}>
    {[first,second].map((line,i) => <div key={line} style={{overflow:'hidden'}}>
      <div style={{fontSize:i ? 140 : 108, lineHeight:1.12, letterSpacing:-5,
        fontFamily:i ? instrumentSerifFontFamily : interFontFamily, fontStyle:i ? 'italic' : 'normal',
        fontWeight:i ? 400 : 800, transform:`translateY(${(1-ease(frame,i*4,i*4+16))*110}%)`}}>{line}</div>
    </div>)}
  </div>;
}

const stage: React.CSSProperties = {position:'absolute', left:84, top:720, width:912, height:900};

export function S1() {
  const f = useCurrentFrame();
  const pull = ease(f, 5, 53);
  return <Page background={paper}>
    <Title first="Bespoke art." second="For your room." frame={f-16}/>
    <div style={{...stage, overflow:'hidden', background:ink}}>
      <div style={{position:'absolute', inset:24, transform:`scale(${2.7-1.7*pull}) rotate(${(1-pull)*-18}deg)`}}>
        <Bloom/>
      </div>
    </div>
  </Page>;
}

export function S2() {
  const f = useCurrentFrame();
  const beat = Math.min(2, Math.floor(f/140));
  const local = f % 140;
  const captions = [['It starts','with a line.'],['Colour finds','its shape.'],['A canvas','takes form.']];
  const draw = ease(local,0,78);
  return <Page background={ink} light>
    <Title first={captions[beat][0]} second={captions[beat][1]} frame={local}/>
    <div style={{...stage, background:paper}}>
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        {beat === 0 ? Array.from({length:12},(_,i)=><path key={i}
          transform={`translate(195 201) rotate(${i*30})`} d="M0 6 Q-64 -62 -12 -153 Q39 -103 0 6Z"
          pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease(local,i*4,i*4+40)}
          fill="none" stroke={ink} strokeWidth="2.5"/>) :
          <g transform={`translate(200 200) scale(${beat === 2 ? 1.55-.55*draw : 1}) translate(-200 -200)`}>
            <Bloom progress={beat === 1 ? draw : 1}/></g>}
      </svg>
    </div>
  </Page>;
}

export function S3() {
  const f = useCurrentFrame();
  const mix = ease(f,130,202);
  return <Page background={blue}>
    <Title first="A palette" second="built around you." frame={f}/>
    <svg style={stage} viewBox="0 0 912 900">
      {pigments.map((color,i)=>{
        const x=165+i*290;
        const width=244+mix*44;
        const height=244+mix*(340-i*74);
        return <g key={color} transform={`translate(${x} ${430-100*Math.sin(Math.PI*ease(f,15+i*12,60+i*12))})`}>
          <rect x={-width/2} y={-height/2} width={width} height={height} rx={122*(1-mix)} fill={color}/>
          <text y="382" textAnchor="middle" fill={ink} fontSize="34" fontWeight="700">{['Clay','Ochre','Jade'][i]}</text>
        </g>;
      })}
    </svg>
  </Page>;
}

function Room({scale}: {scale:number}) {
  return <svg style={stage} viewBox="0 0 912 900">
    <rect width="912" height="900" fill="#e5d5b9"/>
    <path d="M0 0H270L0 515Z" fill="#f6e9d3"/>
    <rect y="695" width="912" height="205" fill="#bd9873"/>
    <g transform={`translate(456 306) scale(${scale}) translate(-165 -165)`}>
      <rect x="-8" y="-8" width="346" height="346" fill="#62442e"/>
      <svg width="330" height="330"><Bloom/></svg>
    </g>
    <rect x="89" y="545" width="734" height="170" rx="44" fill={jade}/>
    <rect x="70" y="640" width="772" height="100" rx="30" fill="#24564c"/>
    <path d="M120 740v42m672-42v42" stroke={ink} strokeWidth="18"/>
  </svg>;
}

export function S4() {
  const f = useCurrentFrame();
  const fitted = ease(f,115,185);
  const installed = f >= 265;
  return <Page background={paper}>
    <Title first={installed ? 'See it in' : 'Made to fit'} second={installed ? 'your space.' : 'your wall.'} frame={installed ? f-265 : f}/>
    <Room scale={.60+.72*fitted}/>
    <div style={{position:'absolute', left:84, top:1650, fontSize:36, fontWeight:700}}>
      {installed ? 'A room mockup before you commission.' : 'Same wall. Two canvas sizes.'}
    </div>
  </Page>;
}

export function S5() {
  const f = useCurrentFrame();
  return <Page background={coral}>
    <Title first="Send us a photo" second="of your wall." frame={f}/>
    <div style={{...stage, display:'grid', placeItems:'center', background:ink}}>
      <div style={{width:590,height:590,transform:`rotate(${-8+8*ease(f,0,45)}deg)`}}><Bloom/></div>
    </div>
    <div style={{position:'absolute',left:84,top:1650,fontSize:48,fontWeight:800}}>WhatsApp +91 90377 90012</div>
  </Page>;
}

export const SCENES = [
  {id:'VS1', C:S1, dur:120}, {id:'VS2', C:S2, dur:420}, {id:'VS3', C:S3, dur:300},
  {id:'VS4', C:S4, dur:480}, {id:'VS5', C:S5, dur:180},
];
export const TOTAL = SCENES.reduce((sum, scene) => sum + scene.dur, 0);
export function VibrantFilm() {
  return <Series>{SCENES.map(({id,C,dur})=><Series.Sequence key={id} name={id} durationInFrames={dur}><C/></Series.Sequence>)}</Series>;
}
