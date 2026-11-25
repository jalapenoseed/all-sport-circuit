/* Original cartridge-cover illustrations. Scanline fills keep diagonal edges on
   the same pixel grid as the game at every display scale. */
function drawPoster(ctx: CanvasRenderingContext2D, sport: string): void {
  const ink = '#18203b', plum = '#52244c', pink = '#ba4770', rose = '#ee7085';
  const deep = '#085352', jade = '#14877a', teal = '#44c6aa', mint = '#9ce7be';
  const skin = '#c77555', light = '#f3b77a', pale = '#ffe5ac';
  const white = '#f5e5bf', silver = '#b6bda6', clay = '#b37242';
  const poly = (color: string, points: number[]) => {
    ctx.fillStyle = color;
    const ys = points.filter((_, i) => i % 2 === 1);
    for (let y = Math.min(...ys); y < Math.max(...ys); y++) {
      const cuts: number[] = [];
      for (let i = 0; i < points.length; i += 2) {
        const j = (i + 2) % points.length;
        const y0 = points[i + 1], y1 = points[j + 1], sy = y + .5;
        if ((y0 <= sy && sy < y1) || (y1 <= sy && sy < y0))
          cuts.push(points[i] + (sy - y0) * (points[j] - points[i]) / (y1 - y0));
      }
      cuts.sort((a, b) => a - b);
      for (let i = 0; i + 1 < cuts.length; i += 2) {
        const x = Math.round(cuts[i]);
        ctx.fillRect(x, y, Math.round(cuts[i + 1]) - x, 1);
      }
    }
  };
  const rect = (c: string, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = c; ctx.fillRect(x,y,w,h);
  };
  const rod = (c: string, x: number,y: number,u: number,v: number,w: number) => {
    const count = Math.max(Math.abs(u-x),Math.abs(v-y),1);
    for(let i=0;i<=count;i++) rect(c,Math.round(x+(u-x)*i/count),Math.round(y+(v-y)*i/count),w,w);
  };
  const oval = (c:string,x:number,y:number,rx:number,ry:number) => {
    for (let dy=-ry;dy<=ry;dy++) {
      const dx=Math.floor(rx*Math.sqrt(1-dy*dy/(ry*ry)));
      rect(c,x-dx,y+dy,dx*2+1,1);
    }
  };
  const arm = (sx:number,sy:number,ex:number,ey:number,hx:number,hy:number) => {
    rod(ink,sx-5,sy-5,ex-5,ey-5,12); rod(ink,ex-5,ey-5,hx-3,hy-3,9);
    rod(skin,sx-3,sy-3,ex-4,ey-3,8); rod(skin,ex-3,ey-3,hx-2,hy-2,6);
    rod(light,sx-4,sy-3,ex-3,ey-3,3); rod(light,ex-3,ey-3,hx-2,hy-2,2);
    rect(light,hx-3,hy-3,7,6); rect(pale,hx-2,hy-3,4,2);
  };
  const football = () => {
    // Distant leg folds behind the lead thigh.
    poly(ink,[55,67,78,73,74,88,57,99,42,99,22,118,12,117,7,111,13,103,29,90,52,84]);
    poly(plum,[55,70,73,75,67,88,53,96,39,96,22,113,16,111,30,92,53,86]);
    poly(pink,[47,87,59,80,66,80,58,91,40,96,29,104,28,100]);
    poly(silver,[26,95,34,98,22,112,14,110]);
    poly(white,[25,96,29,98,20,106,16,107]);
    poly(deep,[12,104,20,107,19,114,11,114,8,111]);
    rect(teal,11,108,5,2);
    // Lead leg, high cuff and a chunky striped cleat.
    poly(ink,[62,67,87,66,91,72,105,82,108,89,104,96,92,111,100,116,100,120,92,123,72,121,69,117,78,103,86,91,62,88,52,78]);
    poly(plum,[62,71,85,70,94,79,103,85,105,91,93,103,82,102,88,92,66,87,57,81]);
    poly(silver,[65,73,83,70,96,80,100,86,94,89,68,83,60,78]);
    poly(white,[64,74,79,71,91,78,91,81,76,79,71,81,63,78]);
    poly(pink,[94,84,102,85,104,90,96,98,89,95]);
    poly(silver,[88,93,96,98,85,113,77,111]);
    poly(white,[88,96,92,98,81,109,78,109]);
    poly(jade,[77,111,85,112,91,116,98,117,98,120,74,119]);
    rect(mint,84,116,7,2); rect(plum,79,121,3,2); rect(plum,91,122,3,2);
    // Outside arm and open stiff-arm glove.
    poly(ink,[87,33,102,31,110,38,116,49,123,49,133,39,138,37,139,39,136,44,142,40,144,42,140,47,146,45,147,48,141,54,143,55,137,60,125,66,114,68,105,62,92,53]);
    poly(plum,[96,34,104,36,114,48,118,55,126,52,135,44,139,46,139,52,133,59,122,64,115,65,105,59,95,48]);
    poly(skin,[102,39,110,46,115,55,120,57,129,51,134,54,128,60,118,63,111,60,101,53]);
    poly(light,[102,39,108,42,116,54,112,55,106,49,100,46]);
    poly(white,[126,50,132,45,136,41,137,42,134,47,139,44,141,43,139,47,134,52,139,50,141,49,138,54,131,58]);
    poly(teal,[126,52,131,57,127,60,121,57]);
    // Oversized pads and twisted striped jersey.
    poly(ink,[52,33,63,26,81,25,90,27,104,29,110,37,110,44,101,51,95,52,92,65,86,73,72,76,54,73,43,66,40,53,40,42]);
    poly(deep,[52,35,65,28,80,28,88,31,101,31,107,37,108,43,99,49,93,49,90,63,84,70,71,73,54,69,46,64,43,48]);
    poly(jade,[51,36,63,30,80,29,89,34,98,32,104,35,105,40,98,45,87,45,87,55,79,65,60,65,54,62,47,49]);
    poly(teal,[49,37,62,31,70,30,64,35,59,37,57,45,50,47,44,43]);
    poly(mint,[49,36,60,31,62,32,55,35,51,39,47,39]);
    poly(teal,[87,32,98,32,104,35,104,38,96,37,88,40]);
    poly(white,[96,43,106,37,107,40,98,46]);
    poly(pink,[61,68,79,69,91,61,88,67,81,72,69,74,55,70]);
    poly(white,[67,40,76,37,81,39,81,43,78,49,74,56,68,58,71,51,75,43,68,46]);
    poly(white,[82,39,87,37,90,38,85,51,80,53,84,43,81,44]);
    poly(mint,[68,40,75,38,78,39,68,43]);
    // Foreshortened carrying arm cradles a pointed football.
    poly(ink,[46,40,57,40,63,45,64,51,59,57,53,61,62,64,65,69,62,75,53,78,44,76,32,68,29,62,30,55,37,45]);
    poly(deep,[44,43,54,42,60,46,61,50,54,55,45,58,34,53]);
    poly(teal,[41,46,50,43,55,44,50,47,45,52,36,53]);
    poly(white,[34,53,41,53,53,48,54,51,43,56,33,56]);
    poly(pink,[33,57,44,56,51,53,54,58,48,62,53,67,59,67,62,71,56,75,49,74,37,68,32,64]);
    poly(skin,[33,57,42,57,47,55,49,58,42,62,43,66,51,71,48,72,36,66,32,62]);
    poly(light,[34,58,42,58,39,61,36,62,33,61]);
    poly(ink,[49,57,55,50,69,47,81,49,82,55,75,63,65,68,53,68,49,65]);
    poly(clay,[51,59,57,53,68,50,78,50,78,55,72,61,63,65,55,65,51,63]);
    poly('#e7a64b',[53,58,59,53,69,51,76,51,73,54,64,54,57,59]);
    poly('#87493c',[55,62,64,62,76,55,72,61,63,65,56,65]);
    rod(pale,59,57,70,53,1); rect(white,61,55,2,4); rect(white,65,53,2,4); rect(white,69,52,2,3);
    poly(white,[49,62,55,63,60,60,62,61,58,64,64,62,65,64,59,68,62,68,60,71,55,72,47,68]);
    poly(silver,[47,66,54,69,60,68,60,71,54,73,47,69]);
    // Helmet panels, curved racing stripe, ear cup, face and facemask.
    poly(ink,[72,30,69,24,68,17,71,10,79,5,92,4,101,7,107,13,110,20,108,25,105,26,106,36,102,40,95,41,89,37,81,39]);
    poly(plum,[74,26,82,21,101,18,106,22,102,27,103,34,99,38,94,37,89,31,84,34,79,36]);
    poly(skin,[87,23,99,20,104,22,101,26,103,30,99,31,98,36,93,34,90,29,85,29]);
    rect(light,97,26,4,3); rect(pale,99,28,4,2); rect(ink,95,24,5,2);
    poly(silver,[71,22,70,17,74,11,81,7,92,6,100,9,105,14,108,19,105,22,92,22,88,27,87,32,80,34,75,31]);
    poly(white,[71,21,72,15,78,10,85,7,95,8,103,12,106,17,96,17,86,20,81,25,75,25]);
    poly(pale,[73,18,78,12,83,10,90,9,89,11,82,13,78,18]);
    poly(jade,[81,7,87,6,94,8,101,12,104,17,99,18,96,13,89,9]);
    poly(teal,[86,7,92,7,99,11,102,15,100,15,96,11]);
    poly(ink,[77,22,82,18,88,19,89,24,86,30,80,31,76,28]);
    poly(white,[78,23,82,20,86,21,86,25,83,29,79,28]);
    rect(deep,81,23,3,4);
    rod(ink,87,25,98,31,2); rod(silver,87,24,99,30,1);
    rod(ink,99,30,108,27,2); rod(silver,99,30,108,27,1);
    rod(ink,108,24,108,34,2); rod(silver,108,24,108,34,1);
    rod(ink,97,36,107,34,2); rod(white,97,36,107,34,1);
  };
  const runnerLeg = (hx:number,hy:number,kx:number,ky:number,fx:number,fy:number,near:boolean) => {
    const shade=near?light:skin;
    rod(ink,hx-6,hy-6,kx-5,ky-4,12); rod(ink,kx-4,ky-4,fx-3,fy-3,9);
    rod(near?silver:plum,hx-5,hy-5,kx-4,ky-3,9); rod(shade,kx-3,ky-3,fx-2,fy-2,6);
    rod(near?white:pink,fx-2,fy-3,fx+6,fy,7); rect(ink,fx-3,fy+4,18,3);
  };
  const athlete = () => {
    const bat=sport==='Baseball',golf=sport==='Golf',hoops=sport==='Basketball';
    const soccer=sport==='Soccer', ice=sport==='Hockey', pong=sport==='Ping-Pong';
    const racket=sport==='Tennis'||pong;
    const jersey=hoops?'#ec783a':ice?'#7baacf':racket?'#c94c79':bat?'#d7d4bb':jade;
    const highlight=hoops?'#ffcd65':ice?'#d8eee3':racket?'#fe9caa':bat?white:teal;
    runnerLeg(65,74,soccer?49:46,soccer?80:98,soccer?24:31,soccer?67:113,false);
    runnerLeg(71,73,soccer?82:87,soccer?96:92,soccer?76:95,soccer?115:112,true);
    if(ice) { rod(silver,29,123,48,123,2);rod(silver,91,122,111,122,2); }
    if(hoops)arm(62,43,51,29,57,14);
    else if(soccer)arm(62,44,46,46,30,36);
    else arm(63,42,49,55,bat||golf?84:40,bat||golf?47:65);
    // Angular inks branch from the body silhouette into fabric folds.
    poly(ink,[55,41,66,31,79,30,90,35,93,47,85,54,79,70,83,77,70,85,52,79,54,67,48,55]);
    poly(plum,[57,43,67,34,77,34,88,38,89,46,80,51,76,69,79,75,68,80,55,76,58,65,52,54]);
    poly(jersey,[57,42,66,34,74,33,84,37,88,40,84,48,77,51,73,66,58,69,55,56,52,52]);
    poly(highlight,[54,44,65,36,70,35,66,39,61,41,57,48,54,50]);
    poly(highlight,[59,59,63,62,64,67,60,66]);
    poly(white,[57,69,73,66,77,64,75,68,60,72]);
    poly(deep,[54,73,67,75,76,70,80,77,71,83,62,79,53,79]);
    poly(teal,[55,73,64,75,61,77,55,76]);
    poly(ink,[68,34,70,28,68,22,69,16,74,11,84,11,90,15,91,23,94,26,91,28,90,32,86,35,80,34,77,39]);
    poly(skin,[71,29,77,25,88,19,89,24,92,26,89,27,87,32,82,32,76,36,71,34]);
    poly(light,[79,22,87,19,88,24,91,25,88,27,86,30,82,30,80,27]);
    poly(plum,[69,24,68,19,72,14,78,11,85,12,88,15,86,18,79,20,77,26,74,24,72,27]);
    rect(ink,85,22,3,1);
    if(bat||golf||racket||ice){
      poly(ink,[68,23,67,18,70,12,77,9,86,10,90,14,90,16,99,17,98,20,87,20,77,21,73,25]);
      poly(ice?silver:jersey,[69,20,70,15,74,12,81,11,87,13,89,17,81,17,74,21]);
      poly(highlight,[71,17,74,13,81,12,82,13,76,15,73,18]);
      rect(ice?white:deep,85,17,12,2);
    } else {
      poly(hoops?white:teal,[69,20,73,17,80,16,87,16,89,18,79,19,71,22]);
    }
    if(soccer) {
      arm(84,43,103,53,118,45); oval(ink,24,78,11,11);oval(white,24,77,10,10);
      poly(deep,[21,75,25,72,29,75,27,80,22,80]);rect(ink,16,78,3,5);rect(ink,29,69,2,3);rect(ink,24,84,4,3);
    } else if(hoops) {
      arm(83,42,93,27,101,17);oval(ink,106,11,11,10);oval('#e68a36',106,10,10,9);
      rod(clay,98,6,114,15,1);rod(ink,100,16,112,4,1);rect(light,100,5,4,2);
    } else if(bat||golf) {
      rod(ink,80,46,42,10,bat?5:3);rod(bat?'#dca667':silver,80,46,42,10,bat?3:1);
      if(bat){rod(clay,43,11,59,26,5);rod(pale,43,11,57,24,2);}
      else {rect(ink,40,8,12,5);rect(silver,41,8,9,2);oval(white,115,105,3,3);}
      arm(84,43,97,54,82,47);
    } else if(ice) {
      rod(ink,64,42,119,91,4);rod(silver,64,42,119,91,2);
      poly(ink,[118,90,127,90,138,83,139,88,127,97,118,96]);arm(85,43,99,55,91,64);
      oval(ink,137,100,6,2);
    } else {
      arm(84,43,100,51,113,39);rod(ink,111,39,121,29,4);rod(pale,112,39,121,29,2);
      oval(ink,128,22,pong?9:13,pong?10:15);oval(pong?rose:mint,128,22,pong?7:11,pong?8:13);
      if(!pong){oval(deep,128,22,9,11);for(let x=-6;x<=6;x+=3)rod(silver,128+x,15,128+x,29,1);for(let y=-6;y<=6;y+=3)rod(silver,120,22+y,136,22+y,1);}
      oval(pong?white:'#f4ee71',143,12,3,3);
    }
  };
  const horse = () => {
    // Galloping legs and lifted tail behind the chest and saddle.
    for(const [x,y,kx,ky,fx,fy] of [[49,78,34,93,17,104],[53,80,60,96,46,114],[88,79,105,90,119,75],[90,78,98,101,81,110]]) {
      rod(ink,x-3,y-3,kx-2,ky-2,7);rod(ink,kx-2,ky-2,fx,fy,5);
      rod(clay,x-2,y-2,kx-1,ky-1,4);rod(skin,kx-1,ky-1,fx,fy,2);rect(plum,fx-1,fy,6,4);
    }
    poly(plum,[43,65,33,59,25,59,15,63,6,60,10,68,21,71,9,74,25,74,38,68]);
    poly(ink,[36,68,44,61,62,59,78,60,88,51,103,42,110,34,113,43,122,39,120,46,136,58,135,65,128,69,119,65,109,62,98,78,88,87,70,88,60,84,47,85,38,80]);
    poly(clay,[39,70,47,64,64,62,80,62,92,52,109,45,111,40,113,47,120,45,121,50,133,59,132,65,126,66,117,61,106,59,98,72,86,83,70,85,59,80,47,82,40,78]);
    poly(light,[43,68,51,64,64,63,69,65,53,66,45,72]);poly(skin,[91,55,106,47,110,47,102,52,95,62,89,65]);
    poly(plum,[81,60,87,53,99,45,110,42,106,48,97,52,94,58,88,59,84,64]);
    rect(ink,118,52,4,2);rect(pale,119,52,1,1);rect(ink,130,60,3,2);
    rod(deep,118,48,128,65,2);rod(ink,126,64,93,64,1);rod(ink,93,64,82,50,1);
    poly(deep,[58,60,77,58,84,63,77,73,58,74,54,68]);poly(teal,[58,62,73,60,79,63,73,69,58,70]);
    poly(ink,[54,58,61,43,75,31,86,33,89,41,80,49,70,54,79,59,79,65,68,73,66,77,57,76,58,71,67,62,55,63]);
    poly(white,[57,57,65,49,73,53,76,60,74,65,65,70,61,69,69,61,57,60]);
    poly(jade,[61,47,69,37,77,33,84,35,85,41,76,48,68,53,61,53]);
    poly(mint,[64,44,73,35,78,35,73,40,67,44]);
    arm(81,39,85,48,95,50);
    oval(ink,87,28,8,9);oval(light,88,29,6,7);
    poly(pink,[78,28,78,23,82,18,89,18,94,22,95,25,100,26,99,28,87,27,81,30]);
    rect(rose,82,21,6,3);rect(ink,91,29,3,2);
  };
  ctx.save();
  ctx.clearRect(0,0,152,126);
  if(sport==='Football')football(); else if(sport==='Horse Racing')horse(); else athlete();
  ctx.restore();
}
