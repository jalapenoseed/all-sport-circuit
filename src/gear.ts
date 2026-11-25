function drawGear(ctx:CanvasRenderingContext2D,sport:string){
 const ink="#151928", ivory="#f9edcd", shade="#aab8ae", umber="#9b5034", brown="#dc9151", yellow="#e5ed63";
 const rect=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const oval=(x:number,y:number,rx:number,ry:number,c:string)=>{for(let yy=-ry;yy<=ry;yy++){const d=Math.round(rx*Math.sqrt(1-(yy/ry)**2));rect(x-d,y+yy,d*2+1,1,c)}};
 const line=(x:number,y:number,X:number,Y:number,c:string,w=1)=>{let n=Math.max(Math.abs(X-x),Math.abs(Y-y));for(let i=0;i<=n;i++)rect(Math.round(x+(X-x)*i/n),Math.round(y+(Y-y)*i/n),w,w,c)};
 ctx.clearRect(0,0,40,34);
 if(sport==="Football"){for(let k=0;k<2;k++){ctx.save();ctx.translate(20,17);ctx.rotate(-.57);oval(0,0,15-k,8-k,k?umber:ink);if(k){rect(-9,-5,2,11,ivory);rect(8,-5,2,11,ivory);rect(-6,-4,12,3,brown);rect(-5,-1,10,1,ivory);for(let x=-4;x<6;x+=3)rect(x,-2,1,3,ivory)}ctx.restore()}}
 if(sport==="Soccer"||sport==="Baseball"||sport==="Basketball"||sport==="Tennis"){const c=sport==="Basketball"?"#f48d49":sport==="Tennis"?yellow:ivory;oval(20,17,13,13,ink);oval(20,17,12,12,c);if(sport==="Soccer"){for(const [x,y] of [[19,15],[11,21],[27,22],[12,9],[26,7],[19,27]]){oval(x,y,3,2,ink)}line(12,10,18,15,shade);line(21,17,26,21,shade)}if(sport==="Baseball"){for(const side of [-1,1])for(let y=8;y<27;y+=3){let x=20+side*Math.round(5+(y-17)**2/19);rect(x,y,3,1,"#d1585d");rect(x+1,y-1,1,3,"#d1585d")}}if(sport==="Basketball"){line(12,7,28,26,ink);line(10,23,30,10,ink);for(let i=0;i<17;i++){rect(10+i,12+Math.round(Math.sin(i/16*3.1)*7)+i/2|0,1,2,ink);rect(19+i/2|0,5+i,1,1,umber)}}if(sport==="Tennis"){for(let i=0;i<20;i++)rect(10+i,15+Math.round(Math.sin(i/5)*4),1,2,ivory)}}
 if(sport==="Golf"){line(24,4,13,27,ivory,2);line(13,26,9,25,shade,4);line(24,4,22,9,brown,3);oval(27,25,5,5,shade);oval(26,24,4,4,ivory);rect(27,25,1,1,shade)}
 if(sport==="Hockey"){line(29,3,15,24,brown,3);line(15,24,6,22,ivory,4);line(29,3,26,8,"#f1dfba",3);oval(27,26,6,3,ink);oval(27,24,6,2,"#68778b")}
 if(sport==="Ping-Pong"){line(12,27,24,15,brown,5);oval(24,13,9,9,ivory);oval(24,12,9,8,"#e8647a");oval(9,10,4,4,ivory)}
 if(sport==="Horse Racing"){line(12,28,26,8,umber,6);line(15,27,26,11,brown,5);line(23,11,31,18,brown,5);rect(21,4,3,7,brown);rect(25,3,2,10,umber);line(23,10,14,20,ink,3);rect(26,12,2,2,ink);line(28,16,30,14,ivory,2)}
}
