import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {tween} from './theme';

const random = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const gaussian = (r: () => number) => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-8))) * Math.cos(2 * Math.PI * r());
export type BristlePath = {d: string; opacity: number};
type Geometry = {x1: number; y1: number; x2: number; y2: number; width?: number; count?: number; seed?: number; dryness?: number; spine?: string};

// Filled tapered strands rather than round-capped lines. Geometry is seeded and frame-stable.
export const generateBristles = ({x1, y1, x2, y2, width = 80, count = 64, seed = 42, dryness = 0.12, spine}: Geometry): BristlePath[] => {
  const r = random(seed);
  const nums = spine?.match(/-?\d+(?:\.\d+)?/g)?.map(Number);
  const points = nums?.length === 8 ? nums : [x1, y1, x1+(x2-x1)/3, y1+(y2-y1)/3, x1+2*(x2-x1)/3, y1+2*(y2-y1)/3, x2, y2];
  const at = (t: number) => {
    const u = 1-t, [a,b,c,d,e,f,g,h] = points;
    const x = u*u*u*a+3*u*u*t*c+3*u*t*t*e+t*t*t*g;
    const y = u*u*u*b+3*u*u*t*d+3*u*t*t*f+t*t*t*h;
    const dx = 3*u*u*(c-a)+6*u*t*(e-c)+3*t*t*(g-e);
    const dy = 3*u*u*(d-b)+6*u*t*(f-d)+3*t*t*(h-f);
    const len = Math.hypot(dx,dy)||1;
    return {x,y,nx:-dy/len,ny:dx/len};
  };
  const fmt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const result: BristlePath[] = [];
  const n = Math.max(40, Math.min(80, count));
  for (let i=0; i<n; i++) {
    const off = ((i+.5)/n-.5)*width + gaussian(r)*width*.018;
    const edge = Math.abs(off)/(width/2);
    const thick = width/n*(1.3+r()*.8)*(1-edge*.55);
    const skip = r() < dryness+edge*.04;
    const gap = .29+r()*.3, gapEnd = gap+.035+r()*.07, flick=.15+r()*.1;
    const samples = Array.from({length: 32}, (_,j) => {
      const t=j/31, q=at(t);
      const drift=Math.sin(t*27+i*2.9)*width*.005+Math.sin(t*73+i)*width*.002;
      const taper=Math.max(.012, Math.min(1,t*7,(1-t)*9));
      const center=off+drift+(t>.86 ? (t-.86)/.14*flick*thick*3 : 0);
      return {t,q,center,half:thick*taper/2};
    });
    const sections=skip ? [samples.filter(s=>s.t<=gap),samples.filter(s=>s.t>=gapEnd)] : [samples];
    for (const section of sections) {
      if (section.length<2) continue;
      const upper=section.map(s=>fmt(s.q.x+s.q.nx*(s.center+s.half),s.q.y+s.q.ny*(s.center+s.half)));
      const lower=section.slice().reverse().map(s=>fmt(s.q.x+s.q.nx*(s.center-s.half),s.q.y+s.q.ny*(s.center-s.half)));
      result.push({d:`M${upper.join(' L')} L${lower.join(' L')} Z`,opacity:.3+r()*.7});
    }
  }
  return result;
};

export const BrushStroke: React.FC<Geometry & {color: string; thickness?: number; bristleCount?: number; revealStart?: number; revealDuration?: number; angle?: number; progress?: number}> = ({
  color,x1,y1,x2,y2,spine,thickness,width,bristleCount=64,dryness=.12,revealStart=0,revealDuration=.7,angle,progress,seed=42,
}) => {
  const frame=useCurrentFrame(), w=thickness??width??80;
  const p=progress??tween(frame,revealStart,revealStart+revealDuration*30);
  const strands=useMemo(()=>generateBristles({x1,y1,x2,y2,width:w,count:bristleCount,seed,dryness,spine}),[x1,y1,x2,y2,w,bristleCount,seed,dryness,spine]);
  const direction=angle??Math.atan2(y2-y1,x2-x1)*180/Math.PI, len=Math.hypot(x2-x1,y2-y1), id=`brush-${seed}`;
  const sweep=(amount:number)=><rect x={-w} y={-w*2} width={(len+2*w)*amount} height={w*4} transform={`translate(${x1} ${y1}) rotate(${direction})`}/>;
  return <svg viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}}>
    <defs>
      <clipPath id={`${id}-clip`}>{sweep(p)}</clipPath>
      <clipPath id={`${id}-blur`}>{sweep(Math.max(0,p-.012))}</clipPath>
      <mask id={`${id}-alpha`}><g fill="white">{strands.map((b,i)=><path key={i} d={b.d} opacity={b.opacity}/>)}</g></mask>
      <pattern id={`${id}-weave`} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0H5 M0 0V5" stroke="#111" strokeWidth=".65" opacity=".6"/></pattern>
    </defs>
    {p>0 && <>
      {p<1 && <g clipPath={`url(#${id}-blur)`} fill={color} opacity=".13" transform="translate(-3 1)">{strands.map((b,i)=><path key={i} d={b.d} opacity={b.opacity}/>)}</g>}
      <g clipPath={`url(#${id}-clip)`} fill={color}>
        {strands.map((b,i)=><path key={i} d={b.d} opacity={b.opacity}/>)}
        <rect width="1920" height="1080" fill={`url(#${id}-weave)`} opacity=".06" mask={`url(#${id}-alpha)`}/>
      </g>
    </>}
  </svg>;
};
