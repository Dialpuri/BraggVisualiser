// The Structure Factor Applet
// (c) Kevin Cowtan and University of York 2014
//  For licensing information contact the author


function matrix(n,m,v) {
    var result = [];
    for ( var i=0; i<n; i++ ) {
      result[i] = [];
      for ( var j=0; j<m; j++ ) {
        result[i][j] = v;
      }
    }
    return result;
  }
  
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    console.log(evt.clientX)
    return { x: evt.clientX - rect.left,
             y: evt.clientY - rect.top };
  }
  
  function SFcanvas(a,b,gamma,maxhk) {
    // member functions
    this.draw = SFcanvas_draw;
    this.setSF = SFcanvas_setSF;
    this.reset = SFcanvas_reset;
    this.clear = SFcanvas_clear;
  
    // member variables
    this.canvas = document.getElementById('sfs');
    this.canvas.addEventListener("mousedown",SFcanvas_mousedown);
    this.mx = this.canvas.width;
    this.my = this.canvas.height;
    this.maxhk = maxhk;
    this.nhk = maxhk*2+1;
    this.s = 0.85*Math.min(this.mx,this.my)/(this.nhk*Math.max(a,b));
    this.ox = this.mx/2;
    this.oy = this.my/2;
    var d2r = Math.PI/180.0;
    this.sx = this.s*b*Math.sin(d2r*gamma);
    this.sy = -this.s*a;
    this.sxy = this.s*b*Math.cos(d2r*gamma);
    this.su = 1/this.sx;
    this.sv = 1/this.sy;
    this.suv = -this.sxy/(this.sx*this.sy);
    this.reset();
  }
  
  function SFcanvas_draw() {
    var ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.clearRect(0,0,this.mx,this.my);
    ctx.fillRect (0,0,this.mx,this.my);
    var ox = this.ox; var oy = this.oy;
    var ax = ox + (this.maxhk+1)*this.sx; var ay = oy + (this.maxhk+1)*this.sxy;
    var bx = ox                         ; var by = oy + (this.maxhk+1)*this.sy;
    // draw axes
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox,oy); ctx.lineTo(ax,ay);
    ctx.moveTo(ax,ay); ctx.lineTo(ax-(ax-ox)/20-(ay-oy)/30,ay-(ay-oy)/20+(ax-ox)/30);
    ctx.moveTo(ax,ay); ctx.lineTo(ax-(ax-ox)/20+(ay-oy)/30,ay-(ay-oy)/20-(ax-ox)/30);
    ctx.moveTo(ox,oy); ctx.lineTo(bx,by);
    ctx.moveTo(bx,by); ctx.lineTo(bx-(bx-ox)/20-(by-oy)/30,by-(by-oy)/20+(bx-ox)/30);
    ctx.moveTo(bx,by); ctx.lineTo(bx-(bx-ox)/20+(by-oy)/30,by-(by-oy)/20-(bx-ox)/30);
    ctx.stroke();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = "#000000";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText("a*",ax+5,ay+5);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'center';
    ctx.fillText("b*",bx-5,by-5);
    // draw spots
    /*
    var mxval = 0.5;
    for (var k=-this.maxhk;k<=this.maxhk;k++) {
      for (var h=-this.maxhk;h<=this.maxhk;h++) {
        mxval=Math.max(this.f[h+this.maxhk][k+this.maxhk],mxval);
      }
    }
    */
    mxval = rflcanvas.fscl;
    var pi2 = 2*Math.PI;
    for (var k=-this.maxhk;k<=this.maxhk;k++) {
      for (var h=-this.maxhk;h<=this.maxhk;h++) {
        ctx.beginPath();
        var fh = this.f[h+this.maxhk][k+this.maxhk]/mxval;
        if (fh>0.01) {
          var phih = (this.phi[h+this.maxhk][k+this.maxhk]+720)%360;
          var red=Math.round(255*Math.max(1-fh*Math.abs((phih+540)%360-180)/120,0.0));
          var grn=Math.round(255*Math.max(1-fh*Math.abs((phih-120+540)%360-180)/120,0));
          var blu=Math.round(255*Math.max(1-fh*Math.abs((phih+120+540)%360-180)/120,0));
          ctx.fillStyle = "rgb("+red+","+grn+","+blu+")";
          ctx.arc( ox+h*this.sx, oy+k*this.sy+h*this.sxy, 4, 0.0, pi2 );
        } else {
          ctx.fillStyle = "#000000";
          ctx.arc( ox+h*this.sx, oy+k*this.sy+h*this.sxy, 1, 0.0, pi2 );
        }
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.arc( ox+selh*this.sx, oy+selk*this.sy+selh*this.sxy, 6, 0.0, pi2 );
    ctx.stroke();
  }
  
  function SFcanvas_setSF(h,k,f,phi) {
    var d2r = Math.PI/180.0;
    this.f  [this.maxhk+h][this.maxhk+k] = f;
    this.phi[this.maxhk+h][this.maxhk+k] = phi;
    this.f  [this.maxhk-h][this.maxhk-k] = f;
    this.phi[this.maxhk-h][this.maxhk-k] = -phi;
  }
  
  function SFcanvas_reset() {
    this.clear();
    for (var i = 0; i < sfs.length; i++) {
      this.setSF( sfs[i][0], sfs[i][1], sfs[i][2], sfs[i][3] );
    }
  }
  
  function SFcanvas_clear() {
    this.f   = matrix(this.nhk,this.nhk,0);
    this.phi = matrix(this.nhk,this.nhk,0);
  }
  
  function SFcanvas_mousedown(event) {
    var c = getMousePos(sfcanvas.canvas,event);
    var x = c.x;
    var y = c.y;
    var h = Math.round((x-sfcanvas.ox)*sfcanvas.su);
    var k = Math.round((y-sfcanvas.oy)*sfcanvas.sv+(x-sfcanvas.ox)*sfcanvas.suv);
    selHK(h,k);
  }
  
  
  function RFLcanvas(fscl) {
    // member functions
    this.draw = RFLcanvas_draw;
  
    // member variables
    this.canvas = document.getElementById('rfl');
    this.canvas.addEventListener("mousedown",RFLcanvas_mousedown);
    this.canvas.addEventListener("mouseup",RFLcanvas_mouseup);
    this.canvas.addEventListener("mouseleave",RFLcanvas_mouseup);
    this.mx = this.canvas.width;
    this.my = this.canvas.height;
    this.ox = this.mx/2;
    this.oy = this.my/2;
    this.s = 4*this.mx/10;
    this.fscl = fscl;
    this.f = 0;
    this.phi = 0;
  }
  
  function RFLcanvas_draw() {
    var ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.clearRect(0,0,this.mx,this.my);
    ctx.fillRect (0,0,this.mx,this.my);
    var ox = this.ox; var oy = this.oy;
    var mx = ox-this.s; var my = oy+this.s;
    var ay = oy; var ax = ox+(this.s+8);
    var bx = ox; var by = oy-(this.s+8);
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx,oy); ctx.lineTo(ax,ay);
    ctx.moveTo(ax,ay); ctx.lineTo(ax-(ax-ox)/20-(ay-oy)/30,ay-(ay-oy)/20+(ax-ox)/30);
    ctx.moveTo(ax,ay); ctx.lineTo(ax-(ax-ox)/20+(ay-oy)/30,ay-(ay-oy)/20-(ax-ox)/30);
    ctx.moveTo(ox,my); ctx.lineTo(bx,by);
    ctx.moveTo(bx,by); ctx.lineTo(bx-(bx-ox)/20-(by-oy)/30,by-(by-oy)/20+(bx-ox)/30);
    ctx.moveTo(bx,by); ctx.lineTo(bx-(bx-ox)/20+(by-oy)/30,by-(by-oy)/20-(bx-ox)/30);
    ctx.stroke();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = "#000000";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText("R",ax+5,ay+5);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'center';
    ctx.fillText("I",bx-5,by-5);
    var p = this.phi*Math.PI/180;
    var x = ( this.s*this.f*Math.cos(p)/this.fscl)+ox;
    var y = (-this.s*this.f*Math.sin(p)/this.fscl)+oy;
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(ox,oy); ctx.lineTo(x,y);
    ctx.moveTo(x,y); ctx.lineTo(x-(x-ox)/15-(y-oy)/20,y-(y-oy)/15+(x-ox)/20);
    ctx.moveTo(x,y); ctx.lineTo(x-(x-ox)/15+(y-oy)/20,y-(y-oy)/15-(x-ox)/20);
    ctx.stroke();
    ctx.strokeStyle = "#888888";
    ctx.beginPath();
    ctx.arc( ox, oy, 0.4*this.s*this.f/this.fscl, 0, -p, p>0 );
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.font = '14px sans-serif';
    ctx.fillStyle = "#000000";
    ctx.fillText("|F| = "+this.f.toString(),   this.mx*1/4,this.my);
    ctx.fillText("phi = "+this.phi.toString(), this.mx*2/4,this.my);
  }
  
  function RFLcanvas_mousedown(event) {
    rflcanvas.canvas.addEventListener("mousemove",RFLcanvas_move);
    rflcanvas.canvas.addEventListener("touchmove",RFLcanvas_move);
    RFLcanvas_move(event);
  }
  
  function RFLcanvas_mouseup(event) {
    rflcanvas.canvas.removeEventListener("mousemove",RFLcanvas_move);
    rflcanvas.canvas.removeEventListener("touchmove",RFLcanvas_move);
  }
  
  function RFLcanvas_move(event) {
    var c = getMousePos(rflcanvas.canvas,event);
    var x = c.x - rflcanvas.ox;
    var y = c.y - rflcanvas.oy;
    if ( selh==0 && selk==0 ) y = 0;
    var r = Math.min(Math.sqrt(x*x+y*y)/rflcanvas.s,1.0);
    rflcanvas.f = Math.round(rflcanvas.fscl*r);
    rflcanvas.phi = Math.round(Math.atan2(-y,x)*180/Math.PI);
    rflcanvas.draw();
    mapcanvas.draw();
  }
  
  
  function MAPcanvas(a,b,gamma,pnts,lins) {
    // member functions
    this.calc = MAPcanvas_calc;
    this.draw = MAPcanvas_draw;
  
    // member variables
    this.canvas = document.getElementById('map');
    this.mx = this.canvas.width;
    this.my = this.canvas.height;
    this.ctx = this.canvas.getContext("2d");
    this.img = this.ctx.createImageData(this.mx,this.my);
    this.a=a;
    this.b=b;
    this.gamma=gamma;
    this.pnts=pnts;
    this.lins=lins;
  
    var a1=a+b*Math.abs(Math.cos(gamma*Math.PI/180));
    var dx=0.85*this.mx/a1;
    var dy=0.85*this.my/b;
    var s =Math.min(dx,dy);
  
    this.sx=s*a;
    this.sxy=s*b*Math.cos(gamma*Math.PI/180);
    this.sy=-s*b*Math.sin(gamma*Math.PI/180);
    this.su=1/this.sx;
    this.sv=1/this.sy;
    this.suv=-this.sxy/(this.sx*this.sy);
  
    this.ox=(this.mx-this.sx-this.sxy)/2;
    this.oy=(this.my-this.sy)/2;
  
    this.calc();
  }
  
  function MAPcanvas_calc() {
    var ox = this.ox; var oy=this.oy;
    var sx = this.sx; var sy=this.sy; var sxy=this.sxy;
    var su = this.su; var sv=this.sv; var suv=this.suv;
  
    // calculate map. Use coarse grid for speed
    var map = matrix(this.mx,this.my,sfcanvas.f[sfcanvas.maxhk][sfcanvas.maxhk]);
    var s = 2
    // calculate the contribution at a point - need frac coords
    for ( var h=-sfcanvas.maxhk; h<=sfcanvas.maxhk; h++ ) {
      for ( var k=-sfcanvas.maxhk; k<=sfcanvas.maxhk; k++ ) {
        if ( h > 0 || ( h == 0 && k > 0 ) ) {
          f = sfcanvas.f[h+sfcanvas.maxhk][k+sfcanvas.maxhk];
          if ( f > 0.0 ) {
            phi = sfcanvas.phi[h+sfcanvas.maxhk][k+sfcanvas.maxhk];
            for ( var y=0; y<this.my; y+=s ) {
              var v=sv*(y-oy);
              for ( var x=0; x<this.mx; x+=s ) {
                var u=suv*(y-oy)+su*(x-ox);
                map[x][y] += 2*f*Math.cos(2*Math.PI*(h*u+k*v-phi/360));
              }
            }
          }
        }
      }
    }
    // interpolate remaining points
    if ( s == 2 ) {
      for (var y=0;y<this.my;y+=2) for (var x=1;x<this.mx-1;x+=2)
        map[x][y]=(map[x-1][y]+map[x+1][y])/2;
      for (var y=1;y<this.my-1;y+=2) for (var x=0;x<this.mx-1;x++)
        map[x][y]=(map[x][y-1]+map[x][y+1])/2;
    }
  
    // draw map
    var vmax = 1.0e-6;
    for (var y=0;y<this.my;y++)
      for (var x=0;x<this.mx;x++)
        vmax = Math.max(vmax,Math.abs(map[x][y]));
    var r; var g;
    for (var y=0;y<this.my;y++) {
      for (var x=0;x<this.mx;x++) {
        var val = map[x][y]/vmax;
        if ( val >= 0 ) {
          r=255;
          g=Math.round(255*(1-val));
        } else {
          r=Math.round(255*Math.max(1+1.5*val,0));
          g=Math.round(255*Math.max(1+0.5*val,0));
        }
        var i = 4*(x+this.mx*(y));
        this.img.data[i+0]=r;
        this.img.data[i+1]=g;
        this.img.data[i+2]=g;
        this.img.data[i+3]=255;
      }
    }
  }
  
  function MAPcanvas_draw() {
    var ox = this.ox; var oy=this.oy;
    var sx = this.sx; var sy=this.sy; var sxy=this.sxy;
    var su = this.su; var sv=this.sv; var suv=this.suv;
  
    var ctx = this.ctx;
  
    // draw map
    ctx.putImageData(this.img,0,0);
  
    // draw annotations
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
  
    // draw points
    if (this.pnts)
      for (var i=0;i<this.pnts.length;i++) {
        var u=(sx*this.pnts[i][0]+sxy*this.pnts[i][1]+ox);
          var v=(sy*this.pnts[i][1]+oy);
          ctx.beginPath();
          ctx.moveTo(u-3,v); ctx.lineTo(u+3,v);
          ctx.moveTo(u,v-3); ctx.lineTo(u,v+3);
          ctx.stroke();
      }
   
    // draw lines
    if (this.lins)
      for (var i=0;i<this.lins.length;i++) {
        var u0=(sx*this.lins[i][0]+sxy*this.lins[i][1]+ox);
        var v0=(sy*this.lins[i][1]+oy);
        var u1=(sx*this.lins[i][2]+sxy*this.lins[i][3]+ox);
        var v1=(sy*this.lins[i][3]+oy);
        ctx.beginPath();
        ctx.moveTo(u0,v0); ctx.lineTo(u1,v1);
        ctx.stroke();
      }
   
    // draw cell
    ctx.strokeStyle = "#888888";
    ctx.beginPath();
    ctx.moveTo(ox,oy);
    ctx.lineTo(ox+sx,oy);
    ctx.lineTo(ox+sx+sxy,oy+sy);
    ctx.lineTo(ox+sxy,oy+sy);
    ctx.closePath();
    ctx.stroke();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = "#888888";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText("a",ox+sx,oy);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText("b",ox+sxy,oy+sy);
  
    // draw bragg indicators
    if ( selh != 0 || selk != 0 ) {
      var dx, dy;
      var qx = -selh*sxy+selk*sx;
      var qy = selh*sy;
      if (Math.abs(qx)<Math.abs(qy)) {
        dx=this.mx;
        dy=dx*qx/qy;
      } else {
        dy=-this.my;
        dx=dy*qy/qx;
      }
      // direction vector
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#00ff00";
      ctx.beginPath();
      ctx.moveTo((this.mx-dx)/2,(this.my-dy)/2);
      ctx.lineTo((this.mx+dx)/2,(this.my+dy)/2);
      ctx.stroke();
      // sine wave
      ctx.beginPath();
      ctx.moveTo(-dx,-dy);
      var wx=-dx; var wy=-dy;
      var r, x0, y0, u, v, rho, x, y;
      for (r=-0.52;r<=0.53;r+=0.01) {
        x0=r*dx; y0=r*dy;
        u=suv*y0+su*x0+0.5;
        v=sv*y0+0.5;
        rho=Math.cos(2*Math.PI*(selh*u+selk*v-rflcanvas.phi/360))
          *(rflcanvas.f/rflcanvas.fscl)/8;
        x=(x0+dy*rho)+this.mx/2;
        y=(y0-dx*rho)+this.my/2;
        ctx.lineTo(x,y);
      }
      ctx.stroke();
      // peaks
      ctx.strokeStyle = "#888888";
      var dphi = selh*(su*dx+suv*dy)+selk*(sv*dy);
      var phi0 = (-(selh*0.5+selk*0.5)+(rflcanvas.phi/360)+100)%1;
      var nphi = Math.abs(Math.round(dphi));
      var r, phi1, x0, y0;
      for (r=-nphi; r<=nphi; r++) {
        phi1 = (r+phi0)/dphi;
        x0=phi1*dx; y0=phi1*dy;
        ctx.beginPath();
        ctx.moveTo(this.mx/2+x0+dy,this.my/2+y0-dx);
        ctx.lineTo(this.mx/2+x0-dy,this.my/2+y0+dx);
        ctx.stroke();
      }
    }
  }
  
  function chgHK() {
    var h = parseInt(document.getElementById("h").value);
    var k = parseInt(document.getElementById("k").value);
    if (!isNaN(h) && !isNaN(k)) selHK(h,k);
  }
  
  function chgFp() {
    var f = parseInt(document.getElementById("f").value);
    var p = parseInt(document.getElementById("phi").value);
    if (isNaN(f)) f = 0;
    if (isNaN(phi)) phi = 0;
    if ( selh == 0 && selk == 0 ) {
      p = p%360-p%180;
      document.getElementById("phi").value = p; 
    }
    rflcanvas.f   = f;
    rflcanvas.phi = p;
    rflcanvas.draw();
  }
  
  function selHK(h,k) {
    if (Math.abs(h)>sfcanvas.maxhk||Math.abs(k)>sfcanvas.maxhk) return;
    selh = h;
    selk = k;
    document.getElementById("h").value = selh;
    document.getElementById("k").value = selk;
    document.getElementById("f").value =
      Math.round(sfcanvas.f  [selh+sfcanvas.maxhk][selk+sfcanvas.maxhk]);
    document.getElementById("phi").value =
      Math.round(sfcanvas.phi[selh+sfcanvas.maxhk][selk+sfcanvas.maxhk]);
    chgFp();
    sfcanvas.draw();
    mapcanvas.draw();
  }
  
  
  function setSF() {
    var f = rflcanvas.f;
    var p = rflcanvas.phi;
    document.getElementById("f").value  = f;
    document.getElementById("phi").value = p;
    sfcanvas.setSF(selh,selk,f,p);
    sfcanvas.draw();
    mapcanvas.calc();
    mapcanvas.draw();
  }
  
  function resetSF() {
    rflcanvas.f   = 0;
    rflcanvas.phi = 0;
    setSF();
    chgFp();
  }
  
  function reset() {
    selHK(0,0);
    sfcanvas.reset();
    sfcanvas.draw();
    mapcanvas.calc();
    mapcanvas.draw();
  }
  
  function clear() {
    selHK(0,0);
    sfcanvas.clear();
    sfcanvas.draw();
    mapcanvas.calc();
    mapcanvas.draw();
  }
  
  function keyDown(event) {
    if ( event.keyCode == 67 ) resetSF();
    if ( event.keyCode == 77 ) clear();
    if ( event.keyCode == 82 ) reset();
    if ( event.keyCode == 83 ) setSF();
  }
  
  
  function setup() {
    rflcanvas = new RFLcanvas(scale);
    sfcanvas = new SFcanvas(aaxis,baxis,gamma,hkmax);
    mapcanvas = new MAPcanvas(aaxis,baxis,gamma,points,lines);
    selHK(0,0);
    rflcanvas.draw();
    sfcanvas.draw();
    mapcanvas.draw();
    document.getElementById("h").addEventListener("change",chgHK);
    document.getElementById("k").addEventListener("change",chgHK);
    document.getElementById("f").addEventListener("change",chgFp);
    document.getElementById("phi").addEventListener("change",chgFp);
    document.getElementById("h").addEventListener("input",chgHK);
    document.getElementById("k").addEventListener("input",chgHK);
    document.getElementById("f").addEventListener("input",chgFp);
    document.getElementById("phi").addEventListener("input",chgFp);
    document.getElementById("setSF").addEventListener("mousedown",setSF);
    document.getElementById("resetSF").addEventListener("mousedown",resetSF);
    document.getElementById("clear").addEventListener("mousedown",clear);
    document.getElementById("reset").addEventListener("mousedown",reset);
    document.addEventListener("keydown",keyDown,true);
  
    var e = document.getElementsByClassName("menu");
    for (var i = 0; i < e.length; i++ ) {
      if (e[i].href==window.location.href) e[i].style.color="black";
    }
    //console.log("setup",sfcanvas.mx,sfcanvas.my);
  }
  