type VenuePoint = { x: number; y: number };
type VenueProject = (x: number, y: number, z?: number) => VenuePoint;
type VenueVertex = [number, number, number?];

// Seeded scenery is stable between frames, including during a camera blend.
function venueNoise(a: number, b = 0): number {
  let bits = Math.imul(a + 173, 0x45d9f3b) ^ Math.imul(b + 43, 0x119de1f3);
  bits = Math.imul(bits ^ (bits >>> 16), 0x45d9f3b);
  return ((bits ^ (bits >>> 16)) >>> 0) / 4294967296;
}

const venueSkyCache = new Map<string, HTMLCanvasElement>();
function venueSky(kind: string): HTMLCanvasElement {
  const cached = venueSkyCache.get(kind);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 180;
  const g = canvas.getContext('2d')!;
  const ice = kind === 'Hockey';
  const cool = kind === 'Golf' || kind === 'Tennis' || kind === 'Horse Racing';
  const colors = ice ? ['#47467e','#70679b','#9691b4','#b8b5c7','#ded4cd'] :
    cool ? ['#286284','#48859b','#74aca9','#a9c8ae','#ead3a2'] :
    ['#685387','#9c688c','#d28289','#f4ac88','#ffd39b'];
  g.fillStyle = colors[4]; g.fillRect(0,0,800,180);
  for (let i=0;i<4;i++) {
    const y = i * 27;
    g.fillStyle = colors[i]; g.fillRect(0,y,800,28);
    for (let x=0;x<800;x+=4) {
      if (venueNoise(x,i) > .4) g.fillRect(x,y+28,2,1);
    }
  }
  // Scanline-cut disc, hand-stepped to keep a hard pixel silhouette.
  const sunX = 552, sunY = 89;
  for (let y=-28;y<=28;y++) {
    if (y>10 && (y+28)%5===0) continue;
    const half = Math.round(Math.sqrt(784-y*y));
    g.fillStyle = y<5 ? '#fff4bc' : '#ffdc92';
    g.fillRect(sunX-half,sunY+y,half*2,1);
  }
  for (let layer=0;layer<2;layer++) {
    g.fillStyle = cool ? ['#7b9c92','#537e7a'][layer] : ['#b2808e','#846f87'][layer];
    for (let x=0;x<800;x+=3) {
      const rise = 11*Math.sin(x*.022+layer) + 7*Math.sin(x*.057) + 4*Math.sin(x*.091+layer*3);
      const top = Math.round(126+layer*13-rise);
      g.fillRect(x,top,3,180-top);
    }
  }
  if (!cool) {
    let x=-5;
    for (let i=0;x<805;i++) {
      const w = 6+Math.floor(venueNoise(i,1)*13);
      const tall = Math.round(6+venueNoise(i,2)*23+Math.max(0,Math.cos(x*.035))*12);
      const y = 147-tall;
      g.fillStyle='#565770'; g.fillRect(x,y,w,tall+15);
      g.fillStyle='#71687b'; g.fillRect(x,y,3,tall);
      if (i%4===0) {g.fillRect(x+2,y-3,w-4,3);g.fillRect(x+4,y-8,1,5);}
      g.fillStyle='#dca78b';
      for (let row=2;row<tall-3;row+=5) for (let col=3;col<w-1;col+=4)
        if (venueNoise(i+row,col)>.62) g.fillRect(x+col,y+row,2,1);
      x+=w+1+Math.floor(venueNoise(i,3)*5);
    }
  }
  // Tiny wooded rim breaks up the stadium silhouette.
  for (let x=0;x<800;x+=2) {
    const y = Math.floor(153-5*venueNoise(x,13)-4*Math.sin(x*.024));
    g.fillStyle = cool ? '#3d6665' : '#4a5463'; g.fillRect(x,y,2,180-y);
  }
  venueSkyCache.set(kind,canvas);
  return canvas;
}

const venueDigits: Record<string,string> = {
  '0':'111101101101111','1':'010110010010111','2':'111001111100111',
  '3':'111001111001111','4':'101101111001001','5':'111100111001111'
};

let venueBanner: HTMLCanvasElement | undefined;
function venueSignTexture(): HTMLCanvasElement {
  if (venueBanner) return venueBanner;
  const board=document.createElement('canvas');
  board.width=132; board.height=18;
  const g=board.getContext('2d')!;
  g.fillStyle='#273344'; g.fillRect(0,0,132,18);
  g.fillStyle='#70beb1'; g.fillRect(0,0,132,1);
  g.fillStyle='#c7758a'; g.fillRect(0,16,132,2);
  for(let i=0;i<3;i++){
    g.fillStyle=i%2===0?'#5fbea9':'#f0d09a';
    g.beginPath();g.moveTo(3+i*4,12);g.lineTo(7+i*4,5);g.lineTo(10+i*4,5);g.lineTo(6+i*4,12);g.fill();
  }
  g.fillStyle='#f5e9c9';g.font='bold 11px monospace';
  g.fillText('ALL SPORT CIRCUIT',20,13);
  venueBanner=board;
  return board;
}

function drawVenue(ctx: CanvasRenderingContext2D, project: VenueProject, sport: string, time: number): void {
  const width = ctx.canvas.width, height = ctx.canvas.height;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.lineJoin = 'bevel';
  ctx.lineCap = 'butt';
  const outdoor = ['Golf','Horse Racing','Baseball'].includes(sport);
  const turf = ['Football','Soccer','Golf','Baseball','Horse Racing'].includes(sport);

  function polygon(points: VenueVertex[], color: string) {
    if (points.length < 3) return;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i=0;i<points.length;i++) {
      const [x,y,z=0]=points[i];
      const p=project(x,y,z);
      if (!Number.isFinite(p.x+p.y)) return;
      if (i===0) ctx.moveTo(Math.round(p.x),Math.round(p.y));
      else ctx.lineTo(Math.round(p.x),Math.round(p.y));
    }
    ctx.closePath(); ctx.fill();
  }
  function quad(x1:number,y1:number,x2:number,y2:number,color:string,z=0) {
    polygon([[x1,y1,z],[x2,y1,z],[x2,y2,z],[x1,y2,z]],color);
  }
  function stroke(points:VenueVertex[],color:string,lineWidth=1) {
    ctx.strokeStyle=color; ctx.lineWidth=lineWidth; ctx.beginPath();
    points.forEach(([x,y,z=0],i)=>{
      const p=project(x,y,z);
      if (i===0) ctx.moveTo(Math.round(p.x)+.5,Math.round(p.y)+.5);
      else ctx.lineTo(Math.round(p.x)+.5,Math.round(p.y)+.5);
    });
    ctx.stroke();
  }
  function frame(x1:number,y1:number,x2:number,y2:number,color:string,lineWidth=1) {
    stroke([[x1,y1],[x2,y1],[x2,y2],[x1,y2],[x1,y1]],color,lineWidth);
  }
  function arc(x:number,y:number,rx:number,ry:number,from:number,to:number,color:string,filled=false) {
    const n=Math.max(10,Math.ceil((to-from)*5));
    const points:VenueVertex[]=[];
    for(let i=0;i<=n;i++) {
      const a=from+(to-from)*i/n;
      points.push([x+Math.cos(a)*rx,y+Math.sin(a)*ry]);
    }
    if (filled) polygon(points,color); else stroke(points,color);
  }
  function disc(x:number,y:number,rx:number,ry:number,color:string) {
    arc(x,y,rx,ry,0,Math.PI*2,color,true);
  }
  function smallBox(x:number,y:number,w:number,d:number,h:number,top:string,front:string,side:string,z=0) {
    polygon([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],front);
    polygon([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],side);
    quad(x,y,x+w,y+d,top,z+h);
  }

  const sky = venueSky(sport);
  const far = project(0,-68,0);
  const horizon = Math.max(32,Math.min(height*.61,far.y-2));
  const skyScale = Math.max(width/736,(horizon+4)/168);
  const skyX = Math.round((width-800*skyScale)*.5);
  const skyY = Math.round(horizon-156*skyScale);
  ctx.fillStyle='#526b65'; ctx.fillRect(0,0,width,height);
  ctx.fillStyle= sport==='Hockey'?'#47467e':(sport==='Golf'||sport==='Horse Racing'||sport==='Tennis')?'#286284':'#685387';
  ctx.fillRect(0,0,width,Math.max(0,skyY)+1);
  ctx.drawImage(sky,skyX,skyY,Math.ceil(800*skyScale),Math.ceil(180*skyScale));

  // Clouds use repeatable, stacked rectangular puffs instead of alpha gradients.
  for (let i=0;i<9;i++) {
    const x=Math.floor((venueNoise(i,17)*(width+130)+time*(1.6+i%3))%(width+130))-65;
    const y=Math.floor(horizon*(.08+venueNoise(i,19)*.39));
    const length=10+Math.floor(venueNoise(i,22)*28);
    ctx.fillStyle=outdoor?'#c9d5bd':'#f8c4a6';
    ctx.fillRect(x,y,length,2); ctx.fillRect(x+3,y-2,length-8,2);
    ctx.fillStyle=outdoor?'#eef0cc':'#ffe2b8';
    ctx.fillRect(x+7,y-4,Math.max(5,length/3|0),2);
    ctx.fillRect(x+length+4,y+1,7,1);
  }
  // A broad grassy apron extends beyond the playfield through every camera angle.
  quad(-220,-85,220,165,outdoor?'#497b58':'#46655c');
  for (let i=0;i<64;i++) {
    const x=-140+venueNoise(i,4)*280, y=-83+venueNoise(i,5)*167;
    if (Math.abs(x)<54 && Math.abs(y)<34) continue;
    quad(x,y,x+2+venueNoise(i,6)*6,y+.4,outdoor?'#63875b':'#597967');
  }

  function tree(x:number,y:number,h:number,seed:number) {
    const foot=project(x,y,0), crown=project(x,y,h);
    const screenH=Math.min(72,Math.max(3,Math.hypot(foot.x-crown.x,foot.y-crown.y)));
    const sw=Math.max(4,screenH*.61)|0, sx=Math.round(crown.x), sy=Math.round(crown.y);
    ctx.fillStyle='#504d48'; ctx.fillRect(Math.round(foot.x)-1,sy+Math.round(screenH*.48),3,Math.ceil(screenH*.52));
    const shades=outdoor?['#305950','#497457','#668c5e']:['#375354','#4c6960','#68806b'];
    const lean=Math.round((venueNoise(seed,85)-.5)*sw*.29);
    ctx.fillStyle=shades[0];
    ctx.fillRect(sx-sw/2|0,sy+screenH*.17|0,sw,Math.max(3,screenH*.38|0));
    ctx.fillRect(sx-sw*.36|0,sy+screenH*.08|0,sw*.77|0,screenH*.54|0);
    ctx.fillStyle=shades[1]; ctx.fillRect(sx-sw*.48|0,sy+screenH*.15|0,sw*.66|0,Math.max(2,screenH*.27|0));
    ctx.fillRect(sx-sw*.27+lean|0,sy,sw*.55|0,Math.max(2,screenH*.34|0));
    ctx.fillStyle=shades[2]; ctx.fillRect(sx-sw*.29+lean|0,sy,Math.max(2,sw*.32|0),2);
    ctx.fillRect(sx-sw*.45|0,sy+screenH*.15|0,Math.max(2,sw*.27|0),2);
  }
  for(let i=0;i<25;i++) {
    const x=-110+i*9+venueNoise(i,7)*6, y=-57-venueNoise(i,8)*16;
    tree(x,y,6+venueNoise(i,9)*7,i);
  }

  function flood(x:number,y:number) {
    const z=17;
    stroke([[x,y],[x,y,z]],'#354454',2);
    stroke([[x-.45,y],[x-.45,y,z]],'#a8ada2');
    stroke([[x,y,z-4],[x-1.9,y,z-1],[x+1.9,y,z-1],[x,y,z-4]],'#647189');
    polygon([[x-3.1,y,z-1.2],[x+3.1,y,z-1.2],[x+3.1,y,z+1.2],[x-3.1,y,z+1.2]],'#43475c');
    for(let j=0;j<4;j++) for(let row=0;row<2;row++) {
      const p=project(x-2.25+j*1.5,y,z-.65+row*1.1);
      ctx.fillStyle=row===0?'#ffdf9c':'#fff5c7';
      ctx.fillRect(Math.round(p.x)-1,Math.round(p.y),3,1);
    }
  }
  if (sport!=='Golf') {flood(-48,-46); flood(45,-46);}
  if (sport!=='Golf') {
    const x=-11,y=-45;
    stroke([[x+3,y,1],[x+3,y,9]],'#485665',2);
    stroke([[x+19,y,1],[x+19,y,9]],'#485665',2);
    const a=project(x,y,11.5), b=project(x+22,y,11.5), c=project(x,y,8.1);
    ctx.save();
    ctx.transform((b.x-a.x)/132,(b.y-a.y)/132,(c.x-a.x)/18,(c.y-a.y)/18,Math.round(a.x),Math.round(a.y));
    ctx.drawImage(venueSignTexture(),0,0);
    ctx.restore();
  }

  const fans=['#f8bb8a','#e29a77','#b9c5bd','#efc956','#cc6672','#5c93ac','#e2ddd3','#838bb7','#ca805c'];
  function bleachers(x:number,y:number,w:number,roof:boolean) {
    for(let row=4;row>=0;row--) {
      const yy=y-row*1.05, z=.7+row*.78;
      smallBox(x,yy,w,1.1,z,'#758285','#435a65','#566870');
      for(let seat=1;seat<w/.95-1;seat++) {
        if (venueNoise(seat+row*91,Math.round(x)+200)<.18) continue;
        const xx=x+seat*.95;
        const p=project(xx,yy+.32,z+.6+venueNoise(row,seat)*.3);
        const size = Math.max(1,Math.min(4,Math.round(Math.abs(project(xx+1,yy,z).x-p.x)*.72)));
        const px=Math.round(p.x), py=Math.round(p.y);
        ctx.fillStyle=fans[Math.floor(venueNoise(seat+row*17,Math.round(x)+250)*fans.length)];
        ctx.fillRect(px,py,size,size);
        if (size>=2) {ctx.fillStyle=seat%3===0?'#986d5c':'#e2ac80';ctx.fillRect(px,py-1,1,1);}
      }
    }
    const panelColors=['#397c77','#9a526c','#507879','#ad8656'];
    for (let i=0;i<4;i++) {
      const xx=x+i*w/4;
      polygon([[xx,y+1.15,.14],[xx+w/4-.3,y+1.15,.14],[xx+w/4-.3,y+1.15,1.65],[xx,y+1.15,1.65]],panelColors[i]);
      for(let k=0;k<3;k++) stroke([[xx+1+k*1.1,y+1.18,.45],[xx+1.5+k*1.1,y+1.18,1.3]],'#e1c79c');
    }
    if (!roof) return;
    for(const xx of [x+.4,x+w-.4]) {
      stroke([[xx,y-4.2,4.2],[xx,y-4.2,8.8],[xx,y-1.6,8.35]],'#4d5768',2);
    }
    polygon([[x-.7,y-5.6,9.1],[x+w+.7,y-5.6,9.1],[x+w+.7,y-1.7,8.35],[x-.7,y-1.7,8.35]],'#9ba8a4');
    stroke([[x-.7,y-1.7,8.35],[x+w+.7,y-1.7,8.35]],'#536276',2);
  }
  if (sport!=='Golf') {
    for (let i=0;i<4;i++) bleachers(-49+i*25,-36,22.5,i===0||i===3);
  } else {
    for (let i=0;i<13;i++) tree(-74+i*12,-32-venueNoise(i,18)*11,6+venueNoise(i,23)*5,i+76);
  }

  const grassA = sport==='Baseball'?'#50844f':'#438658';
  const grassB = sport==='Baseball'?'#5c9055':'#50905b';
  const chalk = '#e6e6be';
  if (turf) {
    quad(-53,-31.2,53,31.2,'#376b48');
    for (let i=0;i<10;i++) quad(-50+i*10,-29,-40+i*10,29,i%2===0?grassA:grassB);
    for(let i=0;i<175;i++) {
      const x=venueNoise(i,31)*99-49.5, y=venueNoise(i,32)*56-28;
      const p=project(x,y);
      ctx.fillStyle=i%2===0?'#70a064':'#3c7b51';
      ctx.fillRect(Math.round(p.x),Math.round(p.y),i%5===0?2:1,1);
    }
  }

  function goal(side:number,hockey=false) {
    const x=49*side, y=7.5, depth=(hockey?2.3:3.6)*side, high=hockey?2.7:4.8;
    const tint=hockey?'#b54b5b':'#eee6cc';
    polygon([[x+depth,-y],[x+depth,y],[x+depth,y,high*.7],[x+depth,-y,high*.7]],hockey?'#9db9c2':'#82a38a');
    for(let k=0;k<=10;k++) {
      const yy=-y+2*y*k/10;
      stroke([[x+depth,yy,.2],[x+depth,yy,high*.7],[x,yy,high]],'#bfc8ad');
    }
    for(let k=1;k<4;k++) stroke([[x+depth,-y,high*k*.16],[x+depth,y,high*k*.16]],'#d6d6b7');
    stroke([[x,-y],[x,-y,high],[x,y,high],[x,y]],tint,2);
    stroke([[x,y,high],[x+depth,y,high*.7],[x+depth,y],[x,y]],tint);
  }

  if (sport==='Soccer') {
    frame(-49,-28,49,28,chalk); stroke([[0,-28],[0,28]],chalk);
    arc(0,0,7.2,7.2,0,Math.PI*2,chalk); disc(0,0,.45,.45,chalk);
    for (const s of [-1,1]) {
      frame(49*s,-16,34*s,16,chalk); frame(49*s,-8.4,43*s,8.4,chalk);
      arc(39*s,0,7,7,s===1?2.36:-.78,s===1?3.92:.78,chalk);
      disc(39*s,0,.4,.4,chalk); goal(s);
      for (const yy of [-28,28]) {
        stroke([[49*s,yy],[49*s,yy,2.3]],'#e5d6a5');
        polygon([[49*s,yy,2.3],[49*s-s*1.7,yy,2],[49*s,yy,1.5]],'#f0a05f');
      }
    }
  }
  if (sport==='Football') {
    quad(-50,-29,-42,29,'#326c70'); quad(42,-29,50,29,'#945a57');
    for(const s of [-1,1])for(let i=0;i<9;i++){
      const yy=-28+i*6.2;
      polygon([[s*43,yy],[s*49,yy+2.7],[s*49,yy+4],[s*43,yy+1.3]],s<0?'#4c8381':'#a76c63');
    }
    frame(-50,-29,50,29,chalk);
    for(let i=-5;i<=5;i++) {
      const x=i*8.4;
      stroke([[x,-28],[x,28]],chalk);
      if(i!==5)for(let j=1;j<=4;j++) for(const y of [-9,9])
        stroke([[x+j*1.68,y-.6],[x+j*1.68,y+.6]],chalk);
      if(Math.abs(i)>=5)continue;
      const label=String((5-Math.abs(i))*10);
      for(const s of [-1,1]) for(let d=0;d<2;d++){
        const bits=venueDigits[label[d]];
        for(let row=0;row<5;row++) for(let col=0;col<3;col++) if(bits[row*3+col]==='1'){
          const xx=x+s*((d*4+col)-3.5)*.52, yy=s*(20+row*.55);
          quad(xx,yy,xx+s*.51,yy+s*.54,'#d7dcab');
        }
      }
    }
    for(const s of [-1,1]) {
      const x=50*s;
      stroke([[x,0],[x,0,3.5],[x-s*1.7,0,4.5]],'#e5b956',2);
      stroke([[x-s*1.7,-4.3,10],[x-s*1.7,-4.3,4.5],[x-s*1.7,4.3,4.5],[x-s*1.7,4.3,10]],'#ffe394',2);
    }
  }
  if (sport==='Baseball') {
    const home=-42;
    const diamond:VenueVertex[]=[[home,0],[-23,-17],[-4,0],[-23,17]];
    disc(-20,0,25,19,'#bc875d'); polygon(diamond,'#6a975d');
    stroke(diamond.concat([diamond[0]]),'#d7ab7a',3);
    stroke([[12,-29],[home,0],[12,29]],'#eee1ba');
    disc(-21,0,3.7,2.9,'#bd8a60'); quad(-21.7,-.6,-20.8,.6,'#eadcb7');
    for(const [x,y] of diamond) polygon([[x-1,y],[x,y-.95],[x+1,y],[x,y+.95]],'#f4e8ca');
    for(const y of [-2.5,1])frame(-43,y,-40,y+1.5,'#ded5b3');
    const wall:VenueVertex[]=[[12,-29],[34,-25],[46,-13],[49,0],[46,13],[34,25],[12,29]];
    for(let i=0;i<wall.length-1;i++){
      const [x,y]=wall[i], [a,b]=wall[i+1];
      polygon([[x,y],[a,b],[a,b,2.4],[x,y,2.4]],'#285f5c');
      stroke([[x,y,2.5],[a,b,2.5]],'#d2ae62',2);
    }
    for(const y of [-29,29]) stroke([[12,y],[12,y,8]],'#f5ce63',2);
  }
  if (sport==='Golf') {
    quad(-51,-30,51,30,'#47794c');
    const fairway:VenueVertex[]=[];
    for(let i=0;i<=24;i++) {
      const x=-50+i*4.15;
      fairway.push([x,Math.sin(x*.065)*4-9-Math.sin(i*.44)*2]);
    }
    for(let i=24;i>=0;i--) {
      const x=-50+i*4.15;
      fairway.push([x,Math.sin(x*.065)*4+9+Math.cos(i*.46)*2]);
    }
    polygon(fairway,'#6fa05e');
    const cup=course();disc(cup.x,cup.y,9,6.6,'#91b86e'); disc(25,-10.7,6.9,3.3,'#ba9b66');
    disc(25.5,-10.3,6.4,2.8,'#e7cc8c');disc(-1,14,10.6,4,'#367678');
    disc(-1,14.2,9.5,3,'#599497');
    for(let i=0;i<12;i++) {
      const x=-8+venueNoise(i,43)*14, yy=12.5+venueNoise(i,44)*2;
      stroke([[x,yy],[x+1,yy]],'#8fb6a5');
    }
    quad(cup.teeX-2,cup.teeY-2,cup.teeX+3,cup.teeY+2,'#86af65');disc(cup.x,cup.y,.77,.48,'#344e41');
    stroke([[cup.x,cup.y],[cup.x,cup.y,5]],'#f4e1b3',2);
    polygon([[cup.x,cup.y,5],[cup.x+3.7,cup.y,4.4],[cup.x,cup.y,3.4]],'#e57363');
  }
  if (sport==='Basketball') {
    quad(-51,-30,51,30,'#894f49'); quad(-49,-28,49,28,'#c8885f');
    const planks=['#dca774','#d4a06f','#d6a373','#deac78'];
    for(let i=0;i<20;i++) {
      const y=-28+i*2.8;
      quad(-49,y,49,y+2.65,planks[i%4]);
      for(let j=0;j<4;j++){
        const x=-49+(i%3)*6+j*24;
        stroke([[x,y],[x,y+2.6]],'#bd895f');
      }
    }
    frame(-49,-28,49,28,'#f4dfb6');stroke([[0,-28],[0,28]],'#f1deb8');
    disc(0,0,6,6,'#95695b');arc(0,0,6,6,0,Math.PI*2,'#fae6bf');
    for(const s of [-1,1]){
      const x=46*s;
      quad(49*s,-6,32*s,6,s<0?'#578384':'#ad655c');frame(49*s,-6,32*s,6,'#f5e4c0');
      arc(32*s,0,5.9,5.9,0,Math.PI*2,'#fae8c6');
      arc(48*s,0,23,23,s===1?Math.PI/2:-Math.PI/2,s===1?Math.PI*1.5:Math.PI/2,'#f5dfb7');
      stroke([[51*s,0],[51*s,0,5.2],[x,0,5.2]],'#556473',2);
      polygon([[x,-3.4,4.8],[x,3.4,4.8],[x,3.4,8.3],[x,-3.4,8.3]],'#dde2d4');
      stroke([[x,-1.3,5.3],[x,-1.3,6.8],[x,1.3,6.8],[x,1.3,5.3]],'#ae655a');
      const hoop:VenueVertex[]=[];
      for(let i=0;i<=12;i++)hoop.push([x-s*1.15+Math.cos(i*Math.PI/6)*1.3,Math.sin(i*Math.PI/6)*1.3,5.2]);
      for(let i=0;i<12;i+=2)stroke([hoop[i],[x-s*1.15+(hoop[i][0]-x+s*1.15)*.65,hoop[i][1]*.65,3.8]],'#f4eacb');
      stroke(hoop,'#df6e44',2);
    }
  }
  if (sport==='Hockey') {
    quad(-52,-30.5,52,30.5,'#788c9b');quad(-50,-29,50,29,'#c9e0de');
    for(let i=0;i<100;i++) {
      const x=venueNoise(i,52)*95-48,y=venueNoise(i,53)*55-27;
      stroke([[x,y],[x+1.4,y+.22]],i%3?'#dce9e1':'#bdd3d2');
    }
    stroke([[0,-29],[0,29]],'#c8767e',2);
    for(const s of [-1,1]){
      stroke([[s*16,-29],[s*16,29]],'#7293b7',2);
      stroke([[s*43,-29],[s*43,29]],'#c4787e');
      for(const y of [-15,15]){
        arc(s*31,y,6,6,0,Math.PI*2,'#ca8786');disc(s*31,y,.65,.65,'#bb7077');
      }
      goal(s,true);
    }
    arc(0,0,7,7,0,Math.PI*2,'#809fba');
    polygon([[-50,-29],[50,-29],[50,-29,2.1],[-50,-29,2.1]],'#e7dfc8');
    stroke([[-50,-29,2.2],[50,-29,2.2]],'#bd6974',2);
    for(let x=-50;x<=50;x+=5)stroke([[x,-29,2.1],[x,-29,4.3]],'#a8c0c0');
  }
  if (sport==='Tennis'||sport==='Ping-Pong') {
    const table=sport==='Ping-Pong';
    quad(-52,-30,52,30,table?'#6b6078':'#738e69');
    quad(-49,-28,49,28,table?'#3f8091':'#4e858a');
    frame(-49,-28,49,28,'#e6e5c7',2);
    if(table) {
      stroke([[-49,0],[49,0]],'#d3e4d4');
      polygon([[-49,28],[49,28],[49,28,-1.45],[-49,28,-1.45]],'#45576a');
    } else {
      frame(-49,-21.5,49,21.5,'#e4e6cb');frame(-26,-21.5,26,21.5,'#e4e6cb');
      stroke([[-26,0],[26,0]],'#e4e6cb');
    }
    const zh=table?2.8:3.4;
    for(let i=-29;i<=29;i+=1.5)stroke([[0,i],[0,i,zh]],'#566c71');
    for(let h=.3;h<zh;h+=.8)stroke([[0,-29,h],[0,29,h]],'#738b88');
    stroke([[0,-29,zh],[0,0,zh-.3],[0,29,zh]],'#f0ebd4',2);
    for(const s of [-1,1])stroke([[0,29*s],[0,29*s,zh+.3]],'#dedac1',2);
  }
  if (sport==='Horse Racing') {
    quad(-51,-19,51,19,'#b3835f');
    for(let i=0;i<6;i++)quad(-51,-18+i*6,51,-12+i*6,i%2?'#bb8b62':'#b68560');
    for(let i=0;i<220;i++){
      const p=project(venueNoise(i,62)*100-50,venueNoise(i,63)*36-18);
      ctx.fillStyle=i%2?'#c59c72':'#aa7957';ctx.fillRect(Math.round(p.x),Math.round(p.y),2,1);
    }
    for(const s of [-1,1]) {
      const y=19*s;
      for(let x=-50;x<=50;x+=5)stroke([[x,y],[x,y,1.75]],'#e9d8b5');
      stroke([[-51,y,1.45],[51,y,1.45]],'#fff0cb',2);
    }
    for(let i=0;i<18;i++)for(let j=0;j<2;j++)quad(47.1+j*.95,-18+i*2,48.05+j*.95,-16+i*2,(i+j)%2?'#3e404d':'#f4e3b9');
  }
  ctx.restore();
}
