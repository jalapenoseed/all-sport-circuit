// Championship formats share the same controls and physical playing surfaces as quick play.
let fullMatch = true;
let period = 1, halfInning = 0, outs = 0, strikes = 0, bases = [false, false, false];
let swingTarget = 0, pitchStyle = 0, shotValue = 2;
let round = 0, rallyPoints = [0, 0], games = [0, 0], openingServer = 0;
let roundLog: string[] = [], raceFinishes = [0, 0], heatElapsed = 0;
const courses = [
  {name:"Opening Drive", teeX:-41, teeY:0, x:40,y:0,wind:0,par:3},
  {name:"Dogleg Creek", teeX:-43,teeY:17,x:38,y:-16,wind:3.8,par:4},
  {name:"Crosswind Ridge",teeX:-36,teeY:-17,x:30,y:16,wind:-4.5,par:3},
  {name:"Sand Hollow",teeX:-46,teeY:3,x:44,y:-9,wind:2.1,par:4},
  {name:"Short Approach",teeX:-22,teeY:19,x:28,y:3,wind:-2.7,par:3},
  {name:"Sunset Green",teeX:-46,teeY:-20,x:45,y:15,wind:4.2,par:4}
];
function course(){return courses[fullMatch && sport==="Golf" ? Math.min(round,courses.length-1) : 0]}
function rails(){return fullMatch ? [[-24,4,32],[-30,-5,18,36],[-31,-14,6,31]][Math.min(round,2)] : [-24,4,32]}
const formats: Record<string,string> = {
  Football:"Four 60-second quarters · fourth-down turnovers",
  Soccer:"Two 2-minute halves · extra time on a draw",
  Basketball:"Four 60-second quarters · two- and three-point shots",
  Hockey:"Three 90-second periods · overtime on a draw",
  Baseball:"Three innings · three outs per side · extra innings on a tie",
  Golf:"Six-hole stroke play · crosswinds, water and bunkers",
  Tennis:"One short set · first to four games · tiebreak at 3–3",
  "Ping-Pong":"Best of three games · play to 11 and win by two",
  "Horse Racing":"Three timed heats · lowest combined time wins"
};
function periodCount(){return sport==="Soccer"?2:sport==="Hockey"?3:4}
function periodSeconds(){return sport==="Soccer"?120:sport==="Hockey"?90:60}
function periodName(){return period>periodCount()?"OT":(sport==="Soccer"?"H":sport==="Hockey"?"P":"Q")+period}
function resetFormat(){
  period=1;halfInning=0;outs=0;strikes=0;bases=[false,false,false];round=0;
  rallyPoints=[0,0];games=[0,0];openingServer=0;roundLog=[];raceFinishes=[0,0];heatElapsed=0;
  if(fullMatch && fieldGame())clock=periodSeconds();
}
function nextPeriod(){
  if(!fullMatch){endMatch();return}
  roundLog.push(periodName()+" · "+scores.join(" – "));
  if(period>=periodCount() && (scores[0]!==scores[1] || period>periodCount())){endMatch();return}
  period++;clock=period>periodCount()?45:periodSeconds();down=1;flight=0;stage="";resetDelay=1.4;
  const receive=(period-1)%2;setupField(receive,sport==="Football"?-33*dir(receive):0);
  energy=energy.map(v=>Math.min(1,v+.3));announce(periodName()+" · "+sideName(receive)+" possession",1.8);
}
function hitBases(count:number){
  let runs=0;
  for(let i=2;i>=0;i--)if(bases[i]){
    bases[i]=false;
    if(i+count>=3)runs++;else bases[i+count]=true;
  }
  if(count===4)runs++;else bases[count-1]=true;
  scores[turn]+=runs;strikes=0;
  announce(["","SINGLE","DOUBLE","TRIPLE","HOME RUN!"][count]+(runs?"  +"+runs:""),1.25);
  tone(runs?"score":"hit");
}
function calledStrike(){
  stage="out";timer=.85;strikes++;
  if(strikes===3){strikes=0;outs++;announce("STRIKEOUT · "+outs+" OUT",.85)}
  else announce("STRIKE "+strikes,.85);
  tone("miss");
}
function nextPitch(){
  if(halfInning>=5 && turn===1 && scores[1]>scores[0]){endMatch("Vipers win on a walk-off");return}
  if(outs>=3){
    roundLog.push((turn?"Bottom ":"Top ")+(1+Math.floor(halfInning/2))+" · "+scores.join(" – "));
    halfInning++;outs=0;strikes=0;bases=[false,false,false];turn=halfInning%2;
    if((halfInning>=5 && turn===1 && scores[1]>scores[0]) ||
       (halfInning>=6 && turn===0 && scores[0]!==scores[1])){endMatch();return}
  }
  pitch();
}
function tennisCounter(side:number){
  const a=rallyPoints[side],b=rallyPoints[1-side];
  if(games[0]===3 && games[1]===3)return String(a);
  if(a>=3 && b>=3)return a===b?"40":a>b?"AD":"40";
  return ["0","15","30","40"][Math.min(a,3)];
}
function racketPoint(winner:number){
  rallyPoints[winner]++;tone("hit");
  const tennis=sport==="Tennis",tieBreak=tennis&&games.every(v=>v===3);
  const target=tennis?(tieBreak?7:4):11;
  if(rallyPoints[winner]>=target && rallyPoints[winner]-rallyPoints[1-winner]>=2){
    roundLog.push("Game "+(games[0]+games[1]+1)+" · "+rallyPoints.join(" – "));
    games[winner]++;scores=games.slice();rallyPoints=[0,0];openingServer=1-openingServer;
    if(games[winner]>=(tennis?4:2)){endMatch();return}
    serve(openingServer);announce("GAME · "+sideName(winner),1.3);return;
  }
  const total=rallyPoints[0]+rallyPoints[1];
  const swap=tennis?(tieBreak?Math.floor((total+1)/2):0):Math.min(...rallyPoints)>=10?total:Math.floor(total/2);
  serve((openingServer+swap)%2);
}
function startHole(){
  const hole=course();strokes=[0,0];lies=[hole.teeX,hole.teeX];lats=[hole.teeY,hole.teeY];
  finished=[false,false];turn=round%2;tee();announce("HOLE "+(round+1)+" · "+hole.name,1.3);
}
function finishHole(){
  for(let s=0;s<2;s++)scores[s]+=strokes[s];
  roundLog.push("Hole "+(round+1)+" · "+strokes.join(" – "));
  if(++round>=courses.length){endMatch(lowScoreResult("on strokes"));return}
  startHole();
}
function lowScoreResult(unit:string){return scores[0]===scores[1]?"Draw game":sideName(scores[0]<scores[1]?0:1)+" win "+unit}
function startHeat(){
  hurdles=[0,0];air=[0,0];cool=[0,0];raceFinishes=[0,0];heatElapsed=0;
  energy=energy.map(v=>Math.min(1,v+.6));athletes.forEach((p,s)=>{p.x=-46;p.y=s?6:-6});
  announce("HEAT "+(round+1)+" OF 3",1.25);
}
function finishHeat(){
  for(let s=0;s<2;s++)scores[s]=Math.round((scores[s]+raceFinishes[s])*100)/100;
  roundLog.push("Heat "+(round+1)+" · "+raceFinishes.map(t=>t.toFixed(2)+"s").join(" / "));
  if(++round===3){endMatch(lowScoreResult("on aggregate time"));return}
  startHeat();
}
function formatStatus(){
  if(fieldGame()){const t=Math.max(0,Math.ceil(clock));return (fullMatch?periodName()+" · ":"")+Math.floor(t/60)+":"+String(t%60).padStart(2,"0")}
  if(!fullMatch)return sport==="Golf"?"STROKE "+(strokes[turn]+1):sport==="Baseball"?"PITCH "+Math.min(5,1+Math.floor(attempt/2))+"/5":racket()?"FIRST TO 5":"SPRINT";
  if(sport==="Baseball")return (turn?"BOT ":"TOP ")+(1+Math.floor(halfInning/2))+" · "+outs+" OUT · "+strikes+" STR";
  if(sport==="Golf")return "HOLE "+Math.min(round+1,6)+"/6 · PAR "+course().par;
  if(sport==="Horse Racing")return "HEAT "+Math.min(round+1,3)+"/3 · "+heatElapsed.toFixed(1)+"s";
  return sport==="Tennis"?"GAMES "+games.join("–")+" · "+[tennisCounter(0),tennisCounter(1)].join(" : "):"GAME "+(1+games[0]+games[1])+" · "+rallyPoints.join(" : ");
}
