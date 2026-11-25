const get=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const game=get<HTMLCanvasElement>("game"),g=game.getContext("2d")!;
let yaw=.25,pitchAngle=.59,zoom=4.25,focusX=0,focusY=0,persp=.0017;
function project(x:number,y:number,z=0){const a=x-focusX,b=y-focusY,depth=a*Math.sin(yaw)+b*Math.cos(yaw);const factor=zoom/Math.max(.57,1-depth*persp);return {x:Math.round(320+(a*Math.cos(yaw)-b*Math.sin(yaw))*factor),y:Math.round(203+(depth*Math.sin(pitchAngle)-z*Math.cos(pitchAngle))*factor)}}
function worldInput(x:number,y:number){return {x:x*Math.cos(yaw)+y*Math.sin(yaw),y:-x*Math.sin(yaw)+y*Math.cos(yaw)}}
function cameraStep(dt:number){const a=1-Math.exp(-dt*4),follow=athletes[selected[0]]||athletes[0],chase=cam===2;
 let tx=chase?follow.x+7:0,ty=chase?follow.y:0;
 focusX+=(tx-focusX)*a;focusY+=(ty-focusY)*a;yaw+=([0,.25,-1.46][cam]-yaw)*a;pitchAngle+=([1.5,.59,.28][cam]-pitchAngle)*a;zoom+=([4.8,4.25,6.25][cam]-zoom)*a;persp+=([0,.0017,.013][cam]-persp)*a}
function pixelLine(a:{x:number,y:number},b:{x:number,y:number},c:string,w=1){g.fillStyle=c;const n=Math.max(1,Math.abs(a.x-b.x),Math.abs(a.y-b.y));for(let i=0;i<=n;i++){g.fillRect(Math.round(a.x+(b.x-a.x)*i/n),Math.round(a.y+(b.y-a.y)*i/n),w,w)}}
// Each colored cross section is projected at its own height. The bottom-to-top
// slices overlap in screen space when the camera lowers toward the ground.
function drawAthlete(p:Athlete){const idx=athletes.indexOf(p),s=p.side,body=s?"#e25987":"#1da89b",light=s?"#ffb0be":"#91f4cf",shadow=s?"#833857":"#156967",skin=s?"#ba7654":"#db9a6a",horse=sport==="Horse Racing";
 const selectedHere=idx===selected[s],stride=Math.sin(p.phase),jump=horse?Math.sin(air[s]/.76*Math.PI)*3:0;
 const foot=project(p.x,p.y);const scale=Math.max(2,Math.abs(project(p.x+1,p.y).x-foot.x)+Math.abs(project(p.x,p.y+1).x-foot.x));g.fillStyle="#182c394d";g.beginPath();g.ellipse(foot.x+2,foot.y+1,scale*2.2,scale*.8,0,0,Math.PI*2);g.fill();
 function layer(x:number,y:number,z:number,rx:number,ry:number,color:string){const c=project(p.x+x,p.y+y,z+jump);const w=Math.max(1,Math.round(rx*scale)),h=Math.max(1,Math.round(ry*scale*(.36+.55*Math.sin(pitchAngle))));g.fillStyle=color;for(let j=-h;j<=h;j++){const span=Math.round(w*Math.sqrt(1-(j/(h+.4))**2));g.fillRect(c.x-span,c.y+j,2*span+1,1)}}
 let base=horse?2.4:0;if(horse){for(let t=0;t<2;t+=.35){layer(stride*.65-1,-.65,t,.5,.45,"#4e3436");layer(-stride*.65+1,.65,t,.5,.45,"#40313b")}for(let t=1.7;t<3.2;t+=.3)layer(0,0,t,2.5,1.05,t>2.8?"#a66a49":"#79503c");layer(2.2,0,3.4,1.1,.7,"#ac7951");layer(2.8,0,3.9,.9,.6,"#ba8358")}
 for(let t=0;t<1.6;t+=.35){layer(stride*.44,-.52,t+base,.57,.51,t<.42?"#263546":"#e7d8bd");layer(-stride*.44,.52,t+base,.57,.51,t<.42?"#263546":"#c5c2b3")}
 for(let t=1.6;t<3.5;t+=.28)layer(0,0,t+base,t<2.15?.95:1.25,.9,t<2.1?"#354658":t<2.6?shadow:body);
 layer(-stride*.6,-1,2.8+base,.54,.5,skin);layer(stride*.6,1,2.8+base,.54,.5,skin);layer(0,0,3.46+base,1.05,.8,light);
 for(let t=3.6;t<4.9;t+=.26)layer(.12*dir(s),0,t+base,.79,.73,t<4.2?skin:sport==="Football"||sport==="Hockey"?"#f7e8bb":t<4.55?"#523b3e":body);
 if(selectedHere){const q=project(p.x,p.y,base+6.1+jump);g.fillStyle=s?"#ff88ae":"#d9ff64";g.fillRect(q.x-3,q.y-1,7,2);g.fillRect(q.x-2,q.y+1,5,1);g.fillRect(q.x-1,q.y+2,3,1)}
 if(sport==="Hockey"||racket()||sport==="Baseball"&&s===turn||sport==="Golf"){const f=dir(s);pixelLine(project(p.x,p.y+1,2.9+base),project(p.x+2*f,p.y+2,sport==="Hockey"?.2:3.7),sport==="Hockey"?"#61452c":"#e4b87a",2);if(racket()){const q=project(p.x+2*f,p.y+2,4.2);g.fillStyle=s?"#d75b80":"#b7ed9c";g.fillRect(q.x-3,q.y-3,6,6)}}
}
function paint(){g.imageSmoothingEnabled=false;drawVenue(g,project,sport,elapsed);
 if(sport==="Horse Racing")for(const x of rails()){for(const y of [-13,0,13])pixelLine(project(x,y,0),project(x,y,1.6),"#785339",2);pixelLine(project(x,-13,1.6),project(x,13,1.6),"#fff1ba",2)}
 if(sport==="Golf"&&stage==="aim"){for(let d=2;d<=Math.max(4,power*42);d+=2){const q=project(ball.x+Math.cos(aim[turn])*d,ball.y+Math.sin(aim[turn])*d,.2);g.fillStyle="#fff5ad";g.fillRect(q.x,q.y,2,2)}}
 if(fullMatch && sport==="Baseball"){
 const positions=[[-23,-17],[-4,0],[-23,17]];
 bases.forEach((occupied,i)=>{if(occupied)drawAthlete({x:positions[i][0],y:positions[i][1],side:turn,slot:1,phase:0})});
 }
 const ordered=athletes.slice().sort((a,b)=>project(a.x,a.y).y-project(b.x,b.y).y);for(const p of ordered)drawAthlete(p);
 if(sport!=="Horse Racing"){const q=project(ball.x,ball.y,ball.z),shadow=project(ball.x,ball.y);g.fillStyle="#16273366";g.fillRect(shadow.x-3,shadow.y,6,2);g.fillStyle="#283146";g.fillRect(q.x-3,q.y-2,7,5);g.fillStyle=sport==="Hockey"?"#30384b":sport==="Basketball"||sport==="Football"?"#eb9954":racket()?"#e4ff72":"#fff5d8";g.fillRect(q.x-2,q.y-2,5,4);g.fillStyle="#fff2cf";g.fillRect(q.x-1,q.y-2,2,1)}
 for(const p of particles){const q=project(p.x,p.y,p.z);g.fillStyle=p.color;g.fillRect(q.x,q.y,2,2)}
}

