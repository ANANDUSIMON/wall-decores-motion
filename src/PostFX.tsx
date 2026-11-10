import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// Applied inside every shot so the individual compositions rendered by GitHub carry the same finish.
export const PostFX: React.FC<{children: React.ReactNode; hardCut?: boolean}> = ({children,hardCut=false}) => {
  const frame=useCurrentFrame();
  const fringe=hardCut && (frame<2 || frame===33 || frame===34);
  return <AbsoluteFill>
    {children}
    <AbsoluteFill style={{pointerEvents:'none',opacity:.05,mixBlendMode:'overlay'}}>
      <svg width="100%" height="100%"><defs><filter id="film-grain"><feTurbulence type="fractalNoise" baseFrequency=".66" numOctaves={2} seed={frame+1}/></filter></defs>
        <rect width="100%" height="100%" filter="url(#film-grain)"/>
      </svg>
    </AbsoluteFill>
    <AbsoluteFill style={{pointerEvents:'none',background:'radial-gradient(ellipse at center,transparent 34%,rgba(0,0,0,.45) 100%)'}}/>
    {fringe && <AbsoluteFill style={{pointerEvents:'none',boxShadow:'inset 1px 0 rgba(255,40,35,.24),inset -1px 0 rgba(25,95,220,.24)'}}/>}
  </AbsoluteFill>;
};
