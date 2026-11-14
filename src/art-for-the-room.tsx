import React from 'react';
import {AbsoluteFill, Composition, Easing, interpolate, registerRoot, useCurrentFrame} from 'remotion';
import {interFontFamily, instrumentSerifFontFamily} from './fonts';

const ink = '#202522', paper = '#f5eddf', sage = '#859988', teak = '#986746';
const teal = '#234f54', apricot = '#ee925c', berry = '#943953';
const clamp = (t:number, a:number, b:number) => interpolate(t,[a,b],[0,1],{
  extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.35,0,.15,1),
});
const petal = 'M0 2 C-15 -7 -24 -26 -17 -42 Q-7 -54 1 -48 C16 -49 21 -30 16 -19 Q9 -5 0 2Z';
function Flower({x,y,r,color,progress=1}:{x:number;y:number;r:number;color:string;progress?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${r})`}>
    {Array.from({length:6},(_,i)=><g key={i} transform={`rotate(${i*60+8}) scale(${clamp(progress, i*.065, .64+i*.065)})`}>
      <path d={petal} fill={color} stroke="#705246" strokeWidth=".7"/>
      {[0,1,2,3].map(j=><path key={j} d={`M${-4+j*2} -4 Q${-20+j*8} -25 ${-10+j*6} ${-39+j%2*4}`} fill="none" stroke={paper} opacity=".42" strokeWidth={j===0?1.7:.8}/>)}
    </g>)}
    <circle r={6*progress} fill="#ab752d"/>
  </g>;
}
function Print({progress=1}:{progress?:number}) {
  return <svg viewBox="0 0 300 180" width="100%" height="100%">
    <rect width="300" height="180" fill="#e8d6af"/>
    <path d="M0 7H55V180H0ZM170 0H224V116H170Z" fill={sage}/>
    <path d="M0 138L300 70V180H0Z" fill={teal}/>
    {[24,71,117,175,228,270].map((x,i)=><path key={x} transform={`translate(${x} 145) rotate(${i%2?17:-22})`} d="M0 0Q-24 -54 2 -98Q18 -48 0 0Z" fill={i%2?sage:'#657145'}/>)}
    <Flower x={59} y={95} r={.76} color={paper} progress={progress}/>
    <Flower x={113} y={119} r={.76} color={apricot} progress={progress}/>
    <Flower x={169} y={68} r={.91} color={paper} progress={progress}/>
    <Flower x={216} y={112} r={.81} color={berry} progress={progress}/>
    <Flower x={268} y={74} r={.69} color={apricot} progress={progress}/>
  </svg>;
}
function Label({x,y,children,size=32}:{x:number;y:number;children:React.ReactNode;size?:number}){
  return <text x={x} y={y} fontSize={size} fontWeight={700} fill="currentColor">{children}</text>;
}
// Elevation uses two drawing units per centimetre throughout.
function Room({t,measure=false}:{t:number;measure?:boolean}){
  const width=180+120*clamp(t,17,19);
  const build=clamp(t,46,49);
  const finished=t>=46;
  return <g>
    <g opacity={finished?build:1}>
      <rect x="60" y="750" width="960" height="540" fill="#e7dfcf"/>
      <path d="M60 750H332L60 1180Z" fill="#f6efdf"/>
      <path d="M60 1290H1020V1390H60Z" fill={teak}/>
      <rect x="300" y="1120" width="480" height="125" rx="24" fill={sage}/>
      <rect x="300" y="1200" width="480" height="58" rx="12" fill="#647e70"/>
      <path d="M328 1256v34m424-34v34" stroke={ink} strokeWidth="10"/>
      <path d="M835 1195h105m-54 0v90" stroke={teak} strokeWidth="12"/>
    </g>
    <g transform={`translate(${540-width/2} ${985-width*.3})`}>
      {finished?<><svg width={width} height={width*.6}><Print/></svg>
        <rect width={width} height={width*.6} fill="none" stroke={teak} strokeWidth="8" pathLength="1" strokeDasharray="1" strokeDashoffset={1-clamp(t,46,48)}/></>:
        <rect width={width} height={width*.6} fill={paper} stroke={ink} strokeWidth="3"/>}
    </g>
    {measure&&<g><Label x={70} y={1470}>Wall height  2.7 m</Label><Label x={70} y={1530}>Sofa  240 cm</Label>
      <path d="M540 780V1120" stroke={ink} strokeDasharray="4 10" opacity=".35"/>
      <Label x={360} y={856}>{t<18?'90 x 54 cm':'150 x 90 cm'}</Label></g>}
  </g>;
}

function Film(){
  const t=useCurrentFrame()/60;
  const opening=t<6, palette=t>=24&&t<36, craft=t>=36&&t<46, end=t>=55;
  const first= t<14?'Bespoke canvas art.':t<24?'Sized for your wall.':palette?'Colour, composed.':craft?'Painted by hand.':end?'Send us a photo':'See it in your room.';
  const second=t<14?'Designed for your space.':t<24?'One wall. Two sizes.':palette?'From room to canvas.':craft?'Layer by layer.':end?'of your wall.':'Before you commission.';
  const beat=[55,46,36,24,14,6].find(start=>t>=start)??0;
  const reveal=clamp(t,beat,beat+.48);
  const fold=clamp(t,9.8,11.5);
  return <AbsoluteFill style={{background:opening?ink:paper,color:opening?paper:ink,fontFamily:interFontFamily}}>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920">
      {opening?<g>
        <path d="M367 660l82 208 91-169 91 169 82-208" fill="none" stroke="#c8a477" strokeWidth="9" pathLength="1" strokeDasharray="1" strokeDashoffset={1-clamp(t,0,1.8)}/>
        <clipPath id="word"><rect x="65" y="930" width={950*clamp(t,1.2,2.8)} height="170"/></clipPath>
        <text clipPath="url(#word)" x="540" y="1050" textAnchor="middle" fill={paper} fontSize="103" fontWeight="800" letterSpacing="-6">WALL DECORES</text>
        <g opacity={clamp(t,2.5,3.3)}><text x="540" y="1130" fill={paper} textAnchor="middle" fontSize="34" letterSpacing="7">ARTISAN COLLECTIVES</text></g>
        <path d="M72 1200H1008V780" stroke="#c8a477" strokeWidth="4" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1-clamp(t,4.4,6)}/>
      </g>:<>
        <Label x={72} y={156} size={26}>WALL DECORES   /   ARTISAN COLLECTIVES</Label>
        <g opacity={reveal} transform={`translate(0 ${24*(1-reveal)})`}>
          <Label x={72} y={410} size={83}>{first}</Label>
          <text x="72" y="517" fontFamily={instrumentSerifFontFamily} fontStyle="italic" fontSize="90" fill={ink}>{second}</text>
        </g>
        {t<14?<><g opacity={1-fold} transform={`translate(0 ${fold*350}) scale(1 ${1-fold*.4})`}>
          <path d="M72 1200H942V660H222V1200" stroke={teak} strokeWidth="5" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1-clamp(t,6,7.7)}/>
          <rect x="403" y="685" width="360" height="100" rx="15" fill={sage} opacity={clamp(t,7,8)}/>
          <Label x={320} y={1050} size={52}>4.8 x 3.6 m</Label></g>
          <g opacity={fold}><Room t={t}/><Label x={72} y={1500}>Living room   /   2.7 m ceiling</Label></g></>:
        t<24?<Room t={t} measure/>:
        palette?<><svg x="90" y="825" width="900" height="540"><Print progress={clamp(t,28,34)}/></svg>
          {[[paper,'Ivory'],[sage,'Sage'],[teak,'Teak'],[apricot,'Apricot'],[berry,'Berry'],[teal,'Teal']].map(([color,name],i)=>{
            const p=clamp(t,24+i*.55,26+i*.55);
            return <g key={name} transform={`translate(${132+i*160} ${1520-780*p})`}>
              <circle r="38" fill={color} stroke={ink} strokeWidth="2"/><Label x={-44} y={-66} size={28}>{name}</Label></g>;
          })}</>:
        craft?<><g opacity={1-clamp(t,42,43)} transform="translate(540 1260) scale(7)">
          <path d={petal} fill="#d8c6a5"/>
          <clipPath id="knife"><rect x="-26" y={4-62*clamp(t,36.6,38.5)} width="54" height="62"/></clipPath>
          <path d={petal} fill="#fff6df" clipPath="url(#knife)"/>
          {[-8,-4,0,5].map((x,i)=><path key={x} d={`M0 0 Q${x-15} -20 ${x} -43`} fill="none" stroke={i%2?'#fffef5':'#c3af91'} strokeWidth="1.1" pathLength="1" strokeDasharray="1" strokeDashoffset={1-clamp(t,38.4+i*.55,40+i*.55)}/>)}</g>
          <svg x="90" y="825" width="900" height="540" opacity={clamp(t,42,43)}><Print/></svg>
          <Label x={72} y={1510}>{t<38.5?'01   Base colour':t<40?'02   Shadow':'03   Raised highlight'}</Label></>:
        <><Room t={t}/>{end?<g opacity={clamp(t,55.5,56.5)}><Label x={72} y={1550} size={46}>WhatsApp  +91 90377 90012</Label></g>:
          <Label x={72} y={1510}>150 x 90 cm   /   Teak frame</Label>}</>}
      </>}
    </svg>
  </AbsoluteFill>;
}
export const ArtForTheRoom=Film;
registerRoot(()=> <Composition id="ArtForTheRoom" component={Film} fps={60} width={1080} height={1920} durationInFrames={3600}/>);
