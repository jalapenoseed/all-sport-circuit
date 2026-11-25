import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
import {createContext, runInContext} from "node:vm";

const source = ["match", "championship"].map(file =>
  stripTypeScriptTypes(readFileSync(new URL("../src/"+file+".ts",import.meta.url),"utf8"))
).join("\n");
function scenario(script){
  const context=createContext({tone(){},recordResult(){},showResult(){},showArena(){}});
  runInContext(source,context);
  return runInContext(script,context);
}
test("A double clears second and third and moves the runner on first to third",()=>{
  assert.equal(scenario(`bases=[true,true,true];hitBases(2);JSON.stringify([scores[0],bases])`),
    '[2,[false,true,true]]');
});
test("A third strike records one out, then the third out changes sides",()=>{
  assert.equal(scenario(`sport="Baseball";beginMatch();outs=2;strikes=2;calledStrike();nextPitch();
    JSON.stringify([turn,halfInning,outs,strikes,bases])`),'[1,1,0,0,[false,false,false]]');
});
test("Tied baseball advances to extras and a walk-off ends it",()=>{
  assert.equal(scenario(`sport="Baseball";beginMatch();halfInning=5;turn=1;outs=3;nextPitch();
    const extra=active&&halfInning===6;halfInning=7;turn=1;scores=[4,5];nextPitch();extra&&!active`),true);
});
test("A tennis deuce requires two consecutive points",()=>{
  assert.equal(scenario(`sport="Tennis";beginMatch();rallyPoints=[3,3];racketPoint(0);
    const advantage=tennisCounter(0)==="AD"&&games[0]===0;racketPoint(0);advantage&&games[0]===1`),true);
});
test("The short-set tiebreak cannot finish 7 to 6",()=>{
  assert.equal(scenario(`sport="Tennis";beginMatch();games=[3,3];rallyPoints=[6,6];racketPoint(1);
    const stillPlaying=active;racketPoint(1);stillPlaying&&!active&&scores[1]===4`),true);
});
test("Ping-pong is win by two, best of three",()=>{
  assert.equal(scenario(`sport="Ping-Pong";beginMatch();games=[1,1];rallyPoints=[10,10];racketPoint(0);
    const stillPlaying=active;racketPoint(0);stillPlaying&&!active&&scores[0]===2`),true);
});
test("Golf and racing select the lower aggregate",()=>{
  assert.equal(scenario(`sport="Golf";beginMatch();round=5;scores=[14,13];strokes=[2,4];finishHole();
    const golf=result;sport="Horse Racing";beginMatch();round=2;scores=[23,22];raceFinishes=[10,12];finishHeat();
    golf+" / "+result`),"Comets win on strokes / Comets win on aggregate time");
});
test("A tied regulation match enters overtime; the quick format ends immediately",()=>{
  assert.equal(scenario(`sport="Hockey";beginMatch();period=3;nextPeriod();const overtime=period===4&&clock===45&&active;
    fullMatch=false;beginMatch();nextPeriod();overtime&&!active`),true);
});
