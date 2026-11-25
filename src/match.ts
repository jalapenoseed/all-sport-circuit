type Athlete={x:number,y:number,side:number,slot:number,phase:number};
type Orb={x:number,y:number,z:number,vx:number,vy:number,vz:number};
type Spark={x:number,y:number,z:number,life:number,vx:number,vy:number,color:string};
const names=["Football","Soccer","Baseball","Golf","Basketball","Hockey","Tennis","Ping-Pong","Horse Racing"];
const cards=[
 ["GRIDIRON","SHOWDOWN","Iron Valley Stadium","NATURAL TURF"],
 ["GOLDEN","GOAL","Marigold Park","STRIPED TURF"],
 ["DIAMOND","KINGS","Sundown Ballpark","CLAY DIAMOND"],
 ["FAIRWAY","FEVER","Emerald Links","BENTGRASS"],
 ["BLACKTOP","ROYALTY","Neon Junction","HARDWOOD"],
 ["FROZEN","RUSH","Northstar Rink","ICE"],
 ["BASELINE","BLAZE","Coral Courts","HARD COURT"],
 ["TABLE","TITANS","Club Spin","INDOOR TABLE"],
 ["FINAL","FURLONG","Copper Ridge","DIRT TRACK"]];
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const distance=(a:{x:number,y:number},b:{x:number,y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
const dir=(s:number)=>s===0?1:-1;
const keys=new Set<string>(),pressed=new Set<string>();
const primary=["Space","Enter"], secondary=["KeyE","Slash"];
let sport=names[0],opp="cpu",role="player",active=false,paused=false,cam=1;
let athletes:Athlete[]=[],ball:Orb,particles:Spark[]=[],owner=0,selected=[0,1],scores=[0,0],clock=75,elapsed=0,down=1,lineStart=-32,grace=0;
let aiReturn=true,resetDelay=0;
let cool=[0,0],strategy=[1,1],energy=[1,1],turn=0,attempt=0,stage="",timer=0,flight=0,hitter=0,strokes=[0,0],lies=[-40,-40],lats=[0,0],aim=[0,0],power=0,finished=[false,false],air=[0,0],hurdles=[0,0],rallies=0,notice="",noticeTime=0,result="";
const fieldGame=()=>["Football","Soccer","Basketball","Hockey"].includes(sport);
const racket=()=>sport==="Tennis"||sport==="Ping-Pong";
const automated=(side:number)=>role==="manager"||(side===1&&opp==="cpu");
function makeBall(x=0,y=0):Orb{return {x,y,z:.7,vx:0,vy:0,vz:0}}
function announce(s:string,t=1){notice=s;noticeTime=t}
function burst(x:number,y:number,color:string){for(let i=0;i<14;i++)particles.push({x,y,z:1,life:.4+Math.random()*.3,vx:(Math.random()-.5)*22,vy:(Math.random()-.5)*22,color})}
function move(p:Athlete,dx:number,dy:number,speed:number,dt:number){let length=Math.hypot(dx,dy);if(length<.12)return;const step=Math.min(length,speed*dt);p.x=clamp(p.x+dx/length*step,-50,50);p.y=clamp(p.y+dy/length*step,-28,28);p.phase+=step*.9}
function input(side:number){const k=side?["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"]:["KeyA","KeyD","KeyW","KeyS"];return {x:Number(keys.has(k[1]))-Number(keys.has(k[0])),y:Number(keys.has(k[3]))-Number(keys.has(k[2]))}}
function action(side:number){return pressed.has(primary[side])}
function sideName(s:number){return s===0?"Comets":"Vipers"}
function setupField(kick:number,x=0,y=0){const n=fieldGame()?(fullMatch?5:3):1;athletes=[];for(let slot=0;slot<n;slot++)for(let s=0;s<2;s++){athletes.push({x:slot===0?(s===kick?x:clamp(x+dir(kick)*13,-48,48)):clamp(x+(s===kick?dir(s)*(slot<=2?11:-9):dir(kick)*(slot<=2?21:6)),-40,40),y:slot===0?y:([-20,20,-9,9][slot-1]),side:s,slot,phase:0})}
 owner=kick;selected=[0,1];ball=makeBall(x,y);grace=1.3;lineStart=x}
function beginMatch(){resetDelay=0;active=true;paused=false;elapsed=0;clock=75;scores=[0,0];cool=[0,0];strategy=[1,1];energy=[1,1];turn=0;attempt=0;down=1;particles=[];air=[0,0];hurdles=[0,0];strokes=[0,0];lies=[-40,-40];lats=[0,0];aim=[0,0];finished=[false,false];rallies=0;stage="";timer=0;flight=0;pressed.clear();keys.clear();resetFormat();setupField(0,sport==="Football"?-33:-4);announce(sport==="Football"?"KICKOFF":sport==="Hockey"?"PUCK DROP":sport==="Basketball"?"TIP-OFF":"PLAY BALL",1);if(racket())serve(0);if(sport==="Baseball")pitch();if(sport==="Golf"){if(fullMatch)startHole();else tee()}if(sport==="Horse Racing"){athletes.forEach((p,i)=>{p.x=-46;p.y=i?6:-6});if(fullMatch)startHeat();else announce("RACE ON")}showArena();tone("start")}
function endMatch(message?:string){if(!active)return;active=false;result=message||(scores[0]===scores[1]?"Draw game":sideName(scores[0]>scores[1]?0:1)+" win");tone("score");recordResult();showResult()}
function points(s:number,n:number,msg:string){scores[s]+=n;if(fieldGame())resetDelay=1.4;announce(msg,1.5);burst(ball.x,ball.y,s?"#fd80a6":"#dbff68");tone("score")}
function fieldStep(dt:number){
 for(let s=0;s<2;s++)if(!automated(s)&&pressed.has(s?"Period":"KeyQ")&&athletes[owner].side!==s){const candidates=athletes.filter(p=>p.side===s).sort((a,b)=>distance(a,ball)-distance(b,ball));selected[s]=athletes.indexOf(candidates[0])}
 const football=sport==="Football",basket=sport==="Basketball",ice=sport==="Hockey";
 const carrier=athletes[owner],side=carrier.side,goal=dir(side)*49;grace-=dt;if(resetDelay>0){resetDelay-=dt;return}
 for(const p of athletes){const s=p.side,manual=!automated(s)&&selected[s]===athletes.indexOf(p);
 let target={x:p.x,y:p.y};let speed=(ice?22:18)*(1+(strategy[s]-1)*.14)*(energy[s]<.2?.78:1);
 if(manual){const k=input(s);const w=worldInput(k.x,k.y);target={x:p.x+w.x*50,y:p.y+w.y*50}}
 else if(p===carrier){target={x:goal,y:clamp(Math.sin(elapsed*1.4+p.slot+s*2)*(football?18:11),-20,20)};if(strategy[s]===0)speed*=.91}
 else if(s===side){target={x:clamp(carrier.x+dir(s)*(p.slot<3?16+strategy[s]*3:-8+strategy[s]*2),-47,47),y:[-19,19,-8,8][Math.max(0,p.slot-1)]}}
 else{const defender=athletes.filter(a=>a.side===s).sort((a,b)=>distance(a,carrier)-distance(b,carrier))[0];target=p===defender?carrier:{x:carrier.x+dir(side)*(9+p.slot*3),y:carrier.y*.35+([-13,13,-6,6][Math.max(0,p.slot-1)])};speed*=.84+strategy[s]*.06}
 move(p,target.x-p.x,target.y-p.y,speed,dt)}
 for(let s=0;s<2;s++)energy[s]=clamp(energy[s]+dt*(strategy[s]===2?-.049:strategy[s]===0?.1:.01),0,1);
 if(flight>0){flight-=dt;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.z=.8+(basket?9:2)*Math.sin(Math.PI*(1-Math.max(flight,0)/timer));if(flight<=0){if(stage==="pass"){owner=hitter;selected[side]=owner;grace=.75;tone("hit")}else{const hit=Math.abs(ball.y)<(basket?2.6:8);if(hit){points(side,basket?shotValue:1,basket?(shotValue===3?"THREE POINTER!":"BUCKET!"):"GOAL!")}else announce("WIDE");setupField(1-side,-dir(side)*5);stage=""}}return}
 ball.x=carrier.x+dir(side)*1.15;ball.y=carrier.y;ball.z=basket?1+Math.abs(Math.sin(elapsed*9))*1.5:football?2:.7;
 const auto=automated(side),forward=Math.abs(goal-carrier.x);
 const wantsPass=(!auto&&pressed.has(secondary[side]))||(football&&auto&&grace<-.9&&Math.sin(elapsed*3)>.96);
 if(wantsPass&&cool[side]<=0){const mates=athletes.filter(a=>a!==carrier&&a.side===side).sort((a,b)=>(b.x-a.x)*dir(side));const to=mates[0];hitter=athletes.indexOf(to);flight=timer=.35;ball.vx=(to.x-ball.x)/timer;ball.vy=(to.y-ball.y)/timer;stage="pass";cool[side]=1;tone("pass");announce("PASS",.4);return}
 if(football&&((!auto&&action(side))||(auto&&forward<18))&&cool[side]<=0){carrier.x=clamp(carrier.x+dir(side)*6,-50,50);grace=.55;cool[side]=2;burst(carrier.x,carrier.y,"#efd3a4");tone("hit")}
 if(football&&forward<4){points(side,6,"TOUCHDOWN!");down=1;setupField(1-side,dir(side)*33);return}
 if(!football&&cool[side]<=0&&(auto?forward<(basket?15:23)+strategy[side]*3:action(side))){shotValue=fullMatch&&forward>23?3:2;const spread=Math.max(.2,forward*(basket?.18:.17));let offset=clamp(carrier.y*.12+(Math.random()-.5)*spread,-18,18);flight=timer=basket?.75:.52;stage="shot";ball.vx=(goal-ball.x)/timer;ball.vy=(offset-ball.y)/timer;cool[side]=1.2;tone("hit");return}
 const enemy=athletes.filter(p=>p.side!==side).sort((a,b)=>distance(a,carrier)-distance(b,carrier))[0];
 if(grace<=0&&distance(enemy,carrier)<(action(enemy.side)?5:2.1)){burst(carrier.x,carrier.y,"#f5cbab");tone("hit");if(football){let yard=carrier.x;const oldLine=lineStart;down=(yard-lineStart)*dir(side)>=10?1:down+1;if(down>4){down=1;setupField(1-side,yard);announce("TURNOVER")}else{setupField(side,yard,carrier.y);if(down!==1)lineStart=oldLine;announce("DOWN "+down,.8)}}else{owner=athletes.indexOf(enemy);selected[enemy.side]=owner;grace=1;announce("STEAL",.5)}}
}
function serve(s:number){aiReturn=true;turn=s;stage="serve";timer=.85;athletes[0].x=-42;athletes[1].x=42;athletes.forEach(p=>p.y=0);ball=makeBall(athletes[s].x,0);rallies=0;announce(sideName(s)+" serve",.8)}
function racketStep(dt:number){const table=sport==="Ping-Pong";for(const p of athletes){const s=p.side,k=input(s);let target=automated(s)?ball.y+Math.sin(elapsed*2+s)*((3-strategy[s])*1.2):p.y+k.y*50;move(p,0,target-p.y,table?35:28,dt)}
 if(stage==="serve"){ball.x=athletes[turn].x;ball.y=athletes[turn].y;timer-=dt;if(timer<0&&(automated(turn)||action(turn))){stage="rally";ball.vx=dir(turn)*(table?72:57);ball.vy=Math.sin(elapsed*1.6)*9;tone("hit")}return}
 ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.z=1+Math.abs(Math.sin((ball.x+42)/84*Math.PI*2))*(table?2:5);
 const receiver=ball.vx>0?1:0,p=athletes[receiver];if(action(receiver))cool[receiver]=.27;
 if(Math.abs(p.x-ball.x)<6&&distance(p,ball)<(table?11:10)&&((automated(receiver)&&aiReturn)||cool[receiver]>0)){rallies++;aiReturn=Math.random()>Math.min(.48,.06+rallies*.025+strategy[1-receiver]*.025);ball.vx=dir(receiver)*Math.min(104,Math.abs(ball.vx)+3);ball.x=p.x+dir(receiver)*5;ball.vy=automated(receiver)?(Math.sin(elapsed*2.8)*18*strategy[receiver]):clamp((ball.y-p.y)*2+input(receiver).y*12,-20,20);burst(p.x,p.y,"#eff6a4");tone("hit")}
 if(Math.abs(ball.x)>51||Math.abs(ball.y)>29){const winner=Math.abs(ball.y)>29?receiver:1-receiver;if(fullMatch){racketPoint(winner);return}points(winner,1,"POINT");if(scores[winner]>=5)endMatch();else serve(winner)}}
function pitch(){swingTarget=(Math.random()-.48)*(fullMatch?21:1);stage="windup";timer=.85;athletes[turn].x=-41;athletes[turn].y=1;athletes[1-turn].x=-6;athletes[1-turn].y=0;ball=makeBall(-6,0);announce(sideName(turn)+" at bat",.8)}
function nextBat(){if(fullMatch){nextPitch();return}attempt++;if(attempt===10){endMatch();return}turn=1-turn;pitch()}
function baseballStep(dt:number){timer-=dt;if(stage==="windup"){if(timer<=0&&(automated(1-turn)||action(1-turn))){stage="pitch";pitchStyle=automated(1-turn)?Math.floor(Math.random()*3):input(1-turn).y+1;ball.vx=-(25+(automated(1-turn)?Math.random()*13:Math.abs(Math.sin(elapsed*2))*17));if(fullMatch)ball.vx=-[23,33,43][pitchStyle];ball.z=2;tone("pass")}return}
 if(stage==="pitch"){ball.x+=ball.vx*dt;const gap=Math.abs(ball.x+41);const swing=automated(turn)?(fullMatch?ball.x+41<=swingTarget+(1-strategy[turn]):gap<(1.1+1.3*(2-strategy[turn]))):action(turn);if(swing){if(gap<7){
 if(fullMatch && gap>1.15 && Math.random()<.25+gap*.09){
   strikes=0;outs++;stage="hit";timer=1.3;ball.vx=gap>4?27:45;ball.vy=Math.sin(elapsed)*9;
   announce((gap>4?"GROUNDOUT":"FLY OUT")+" · "+outs+" OUT",1.2);tone("hit");return;
 }
 const bases=gap<1.7?4:gap<3.4?3:gap<5?2:1;if(fullMatch)hitBases(bases);else points(turn,bases,["","SINGLE","DOUBLE","TRIPLE","HOME RUN!"][bases]);stage="hit";timer=1.3;ball.vx=37+bases*7;ball.vy=Math.sin(elapsed)*12;burst(ball.x,ball.y,"#ffcd86");return}if(fullMatch)calledStrike();else{stage="out";timer=.65;announce("STRIKEOUT");tone("miss")}}else if(ball.x< -48){if(fullMatch)calledStrike();else{stage="out";timer=.65;announce("STRIKEOUT");tone("miss")}}}
 else if(stage==="hit"){ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.z=2+13*Math.sin((1-timer/1.3)*Math.PI);if(timer<=0)nextBat()}else if(timer<=0)nextBat()}
function tee(){stage="aim";timer=.7;athletes.forEach((p,s)=>{p.x=lies[s]-1.2;p.y=lats[s]+1.3});ball=makeBall(lies[turn],lats[turn]);aim[turn]=Math.atan2(course().y-ball.y,course().x-ball.x);announce(sideName(turn)+" to swing",.8)}
function golfStep(dt:number){timer-=dt;if(stage==="aim"){power=.5-.5*Math.cos(elapsed*2.7);let k=input(turn);if(!automated(turn))aim[turn]+=k.x*dt*1.4;const dist=Math.hypot(course().x-ball.x,course().y-ball.y),club=fullMatch&&Math.hypot((ball.x-25)/6.9,(ball.y+10.7)/3.3)<1?24:42,desired=clamp((dist-1)/club,0,1);const shoot=automated(turn)?timer<0&&Math.abs(power-desired)<.04+strategy[turn]*.024:action(turn);if(shoot){const deviation=automated(turn)?(Math.random()-.5)*(.03+strategy[turn]*.17):0;aim[turn]+=deviation;const length=1+club*power;flight=timer=.28+power*.75;ball.vx=Math.cos(aim[turn])*length/timer;ball.vy=Math.sin(aim[turn])*length/timer+(fullMatch?course().wind*power:0);stage="drive";strokes[turn]++;tone("hit")}}
 else{ball.x=clamp(ball.x+ball.vx*dt,-49,49);ball.y=clamp(ball.y+ball.vy*dt,-28,28);ball.z=1+8*power*Math.sin(Math.PI*clamp(timer/flight,0,1));if(timer<=0){const wet=fullMatch&&Math.hypot((ball.x+1)/10.6,(ball.y-14)/4)<1;
 if(wet){strokes[turn]=Math.min(8,strokes[turn]+1);ball.x=lies[turn];ball.y=lats[turn]}else{lies[turn]=ball.x;lats[turn]=ball.y}
 const sunk=!wet&&distance(ball,course())<3.8;if(sunk||strokes[turn]>=8){finished[turn]=true;if(!fullMatch)scores[turn]=sunk?10-strokes[turn]:0;burst(ball.x,ball.y,"#e0f561");tone(sunk?"score":"miss")}if(finished.every(Boolean)){if(fullMatch)finishHole();else endMatch();return}turn=finished[1-turn]?turn:1-turn;tee();if(wet)announce("WATER · ONE PENALTY STROKE",1)}}}
function raceStep(dt:number){heatElapsed+=dt;for(const p of athletes){const s=p.side;if(fullMatch&&raceFinishes[s]>0)continue;const barrier=rails()[hurdles[s]]??Infinity;const ai=automated(s),jump=action(s)||(ai&&p.x>barrier-4&&p.x<barrier);air[s]=Math.max(0,air[s]-dt);if(jump&&air[s]===0&&cool[s]<=0){air[s]=.76;cool[s]=1.15;tone("pass")}const sprint=ai?(energy[s]>.28&&Math.sin(elapsed*1.4+s)>-.18+(1-strategy[s])*.3):keys.has(secondary[s]);energy[s]=clamp(energy[s]+dt*(sprint?-.24:.16),0,1);const speed=6.5+(sprint&&energy[s]>.02?3.4:0)-(cool[s]>1.16?3.3:0);p.x+=speed*dt;p.phase+=speed*dt;if(p.x>=barrier){hurdles[s]++;if(air[s]<.1){p.x-=2;cool[s]=2.3;tone("miss");announce("CLIPPED RAIL",.6)}else burst(p.x,p.y,"#ffd88e")}if(p.x>=48){if(fullMatch){raceFinishes[s]=Math.round(heatElapsed*100)/100;p.x=48;if(raceFinishes.every(t=>t>0)){finishHeat();return}continue}points(s,1,"FINISH");endMatch(sideName(s)+" win the race");return}}}
function simulate(dt:number){elapsed+=dt;noticeTime-=dt;cool=cool.map(n=>Math.max(0,n-dt));if(role==="manager")for(let s=0;s<(opp==="cpu"?1:2);s++){for(let n=0;n<3;n++)if(pressed.has((s?"Numpad":"Digit")+(n+1)))strategy[s]=n;if(action(s))strategy[s]=(strategy[s]+1)%3}
 if(opp==="cpu"&&Math.floor(elapsed/8)!==Math.floor((elapsed-dt)/8))strategy[1]=energy[1]<.3?0:scores[1]<=scores[0]?2:1;
 if(fieldGame()){clock-=dt;if(clock<=0){nextPeriod();return}fieldStep(dt)}else if(racket())racketStep(dt);else if(sport==="Golf")golfStep(dt);else if(sport==="Baseball")baseballStep(dt);else raceStep(dt);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=dt*5;p.life-=dt}particles=particles.filter(p=>p.life>0)}

