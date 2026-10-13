/* Kiemel, Elahi & Jeka (2008) plant model.
 * Angles theta1 (leg) and theta2 (HAT) are absolute angles from vertical.
 * This file intentionally uses no fitted/visual tuning constants in the physics.
 */
(function(global){
  'use strict';
  const PARAMS = Object.freeze({
    // Table 1: physical model parameters (means)
    g:9.81, mTot:70.6, l1a:0.420, l1b:0.378, l2:0.511,
    m1aRel:0.093, m1bRel:0.200, m2Rel:0.678,
    h1aRel:0.567, h1bRel:0.567, h2Rel:0.626,
    r1aRel:0.643, r1bRel:0.653, r2Rel:0.798,
    // Table 2: HIGH-amplitude condition
    w01:7.64, w02:9.37, eta1:0.97, eta2:1.50,
    gamma1:27.4, gamma2:12.8, k1:362, k2:147, alpha1:0.0, alpha2:18.0
  });
  const c=(re,im=0)=>({re,im}), add=(a,b)=>c(a.re+b.re,a.im+b.im), sub=(a,b)=>c(a.re-b.re,a.im-b.im),
    mul=(a,b)=>c(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re), div=(a,b)=>{const d=b.re*b.re+b.im*b.im;return c((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d)},
    scale=(a,s)=>c(a.re*s,a.im*s), abs=a=>Math.hypot(a.re,a.im), phase=a=>Math.atan2(a.im,a.re), polar=(r,p)=>c(r*Math.cos(p),r*Math.sin(p));
  function derived(p=PARAMS){
    const m1a=p.mTot*p.m1aRel,m1b=p.mTot*p.m1bRel,m2=p.mTot*p.m2Rel;
    const h1a=p.l1a*p.h1aRel,h1b=p.l1b*p.h1bRel,h2=p.l2*p.h2Rel;
    const r1a=p.l1a*p.r1aRel,r1b=p.l1b*p.r1bRel,r2=p.l2*p.r2Rel;
    const m1=m1a+m1b,l1=p.l1a+p.l1b;
    const h1=(m1a*h1a+m1b*(p.l1a+h1b))/m1;
    const J1=m1a*r1a*r1a+m1b*r1b*r1b+m1b*((p.l1a+h1b)**2-h1b**2);
    const J2=m2*r2*r2;
    return {m1a,m1b,m1,m2,l1,h1,h2,J1,J2};
  }
  function inv2(A){const det=sub(mul(A[0][0],A[1][1]),mul(A[0][1],A[1][0]));return [[div(A[1][1],det),div(scale(A[0][1],-1),det)],[div(scale(A[1][0],-1),det),div(A[0][0],det)]]}
  function mv(A,v){return A.map(r=>add(mul(r[0],v[0]),mul(r[1],v[1])))}
  function torqueFilter(w,w0,eta,gamma){
    // Eq. (5a): T0'' + 2*w0*eta*T0' + w0^2*T0 = -gamma*w0^2*u
    return div(c(-gamma*w0*w0),c(w0*w0-w*w,2*w0*eta*w));
  }
  function response(freq,p=PARAMS){
    const d=derived(p),w=2*Math.PI*freq,iW=c(0,w);
    const Ht=[torqueFilter(w,p.w01,p.eta1,p.gamma1),torqueFilter(w,p.w02,p.eta2,p.gamma2)];
    // Eq. (4): M*theta'' - G*theta = B*T, B=[[1,-1],[0,1]].
    const M=[[d.J1+d.m2*d.l1*d.l1,d.m2*d.l1*d.h2],[d.m2*d.l1*d.h2,d.J2]];
    const G=[p.g*(d.m1*d.h1+d.m2*d.l1),p.g*d.m2*d.h2];
    // Eq. (5b): T=T0-K*phi-A*phi', phi=C*theta, C=[[1,0],[-1,1]].
    // D=(-w^2 M-G)+B(K+i*w*A)C, then D*Theta=B*T0.
    const q1=c(p.k1,w*p.alpha1),q2=c(p.k2,w*p.alpha2);
    const D=[
      [add(c(-w*w*M[0][0]-G[0]),add(q1,q2)),add(c(-w*w*M[0][1]),scale(q2,-1))],
      [add(c(-w*w*M[1][0]),scale(q2,-1)),add(c(-w*w*M[1][1]-G[1]),q2)]
    ];
    const rhs=[sub(Ht[0],Ht[1]),Ht[1]],theta=mv(inv2(D),rhs);
    const phi=[theta[0],sub(theta[1],theta[0])];
    const totalT=[sub(Ht[0],mul(q1,phi[0])),sub(Ht[1],mul(q2,phi[1]))];
    return {freq,w,theta,activeTorque:Ht,totalTorque:totalT,phi};
  }
  function sweep(n=180){const lo=Math.log10(.024),hi=Math.log10(2.936),out=[];for(let i=0;i<n;i++)out.push(response(10**(lo+(hi-lo)*i/(n-1))));return out}
  global.KiemelModel={PARAMS,derived,response,sweep,complex:{abs,phase,polar}};
  if(typeof module!=='undefined')module.exports=global.KiemelModel;
})(typeof window!=='undefined'?window:globalThis);
