
// Advanced RGB particle field + parallax lines + hover burst
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let w=canvas.width=innerWidth, h=canvas.height=innerHeight;
window.addEventListener('resize',()=>{w=canvas.width=innerWidth;h=canvas.height=innerHeight;init();});

let particles = [];
let lines = [];
let mouse = {x:-9999,y:-9999,down:false};

function rand(min,max){ return Math.random()*(max-min)+min; }

function init(){
  particles = [];
  lines = [];
  for(let i=0;i<220;i++){
    particles.push({x:rand(0,w), y:rand(0,h), r:rand(0.7,3), vx:rand(-0.6,0.6), vy:rand(-0.6,0.6), hue:rand(0,360), alpha:rand(0.15,0.9)});
  }
  for(let i=0;i<12;i++){
    lines.push({x:rand(0,w), y:rand(0,h), vx:rand(-0.2,0.2), vy:rand(-0.2,0.2), hue:rand(0,360), len:rand(200,600)});
  }
}
init();

// mouse interactions (burst on hover)
document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('mouseenter',(e)=>{ burst(e.clientX,e.clientY); });
});

window.addEventListener('mousemove',(e)=>{ mouse.x=e.clientX; mouse.y=e.clientY });
window.addEventListener('mouseout',()=>{ mouse.x=-9999; mouse.y=-9999; });

function burst(x,y){
  for(let i=0;i<30;i++){
    particles.push({x:x + rand(-10,10), y:y + rand(-10,10), r:rand(1,4), vx:rand(-4,4), vy:rand(-4,4), hue:rand(0,360), alpha:1, life:60});
  }
}

function draw(){
  ctx.clearRect(0,0,w,h);
  // background fade
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0,0,w,h);

  // parallax lines
  for(let ln of lines){
    ln.x += (mouse.x - w/2)*0.0008 + ln.vx;
    ln.y += (mouse.y - h/2)*0.0008 + ln.vy;
    ctx.beginPath();
    let g = ctx.createLinearGradient(ln.x, ln.y, ln.x+ln.len, ln.y+ln.len/6);
    g.addColorStop(0, `hsla(${ln.hue},100%,60%,0.06)`);
    g.addColorStop(1, `hsla(${(ln.hue+120)%360},100%,60%,0.02)`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.5;
    ctx.moveTo(ln.x, ln.y);
    ctx.lineTo(ln.x+ln.len, ln.y+ln.len/6);
    ctx.stroke();
  }

  // particles
  for(let i = particles.length-1; i>=0; i--){
    let p = particles[i];
    // physics
    p.x += p.vx + (mouse.x - w/2)*0.0006;
    p.y += p.vy + (mouse.y - h/2)*0.0006;
    p.alpha = Math.max(0.05, p.alpha - (p.life?0.02:0.0002));
    // draw
    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 90%, 55%, ${p.alpha})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
    // life handling
    if(p.life !== undefined){
      p.life--;
      if(p.life<=0) particles.splice(i,1);
    }
    // keep in bounds
    if(p.x < -50) p.x = w+50;
    if(p.x > w+50) p.x = -50;
    if(p.y < -50) p.y = h+50;
    if(p.y > h+50) p.y = -50;
  }

  // subtle connections between near particles
  for(let a=0;a<particles.length;a+=8){
    for(let b=a+1;b<particles.length && b<a+6;b++){
      let pa = particles[a], pb = particles[b];
      let dx = pa.x-pb.x, dy = pa.y-pb.y;
      let d = Math.sqrt(dx*dx+dy*dy);
      if(d<160){
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${pa.hue},90%,60%,${(160-d)/160*0.06})`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(pa.x,pa.y);
        ctx.lineTo(pb.x,pb.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}
draw();
