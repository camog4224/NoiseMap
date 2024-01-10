let canvas = document.getElementById("myCanvas");
const Width = canvas.width;
const Height = canvas.height;

let scaleSlider = document.getElementById("scale");

let ctx = canvas.getContext("2d");

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function clearGraph(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

function drawCirc(x,y,r,c){
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawSRect(x,y, w, h, c){
    ctx.lineWidth = 1;
    ctx.strokeStyle = c;
    ctx.strokeRect(x, y, w, h);
}
  
function drawLin(x1,y1,x2,y2,c,w){
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
  
function drawTex(x,y,text,c){
    ctx.font = "12px Georgia";
    ctx.fillStyle = "#000000";
    ctx.fillText(text, x, y);
}

class Vector{
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.length = this.mag();
    }

    rotateTo(angle){
        this.x = Math.cos(angle)*this.length;
        this.y = Math.sin(angle)*this.length;
    }

    rotateBy(angle){
        this.x = Math.cos(angle)*this.length;
        this.y = Math.sin(angle)*this.length;
    }

    add(v){
        this.x = this.x + v.x;
        this.y = this.y + v.y;
        this.length = this.mag();
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    setMag(len){
        this.x = this.x*len/this.length;
        this.y = this.y*len/this.length;
        if(this.length == 0){
            
        }
        this.length = len;
    }

    multMag(len){
        this.x = this.x*len
        this.y = this.y*len;
        this.length = this.length*len;
    }

    copy(){
        return new Vector(this.x, this.y);
    }

    normal(){
        return new Vector(this.x/this.length, this.y/this.length);
    }

}

function subV(final, initial){
    return new Vector(final.x-initial.x, final.y-initial.y);
}

function addV(i, f){
    return new Vector(i.x + f.x, i.y + f.y);
}

function dot(a, b){
    return a.x*b.x + a.y*b.y;
}

function randV(){
    let a = new Vector(Math.random()*2-1,Math.random()*2-1);
    return a.normal();
}

// canvas.addEventListener("mousemove", updateSeg);


let count = 0;

function drawNoise(){
    let start = [200,0,200]
    let end = [0,200,0];
    let image = ctx.createImageData(Width,Height); 
    for(let i = 0; i < image.width; i++){
        for(let j = 0; j < image.height; j++){
            let index = (j*image.height + i)*4;
            let val = noise(i, j);
            let a = lerpColor(start[0], start[1], start[2], end[0], end[1], end[2], val);
            let r = a[0];
            let g = a[1];
            let b = a[2];
            // let a = 255;
            image.data[index] = r;
            image.data[index+1] = g;
            image.data[index+2] = b;
            image.data[index+3] = 255;
        }
        
    }
    ctx.putImageData(image,0,0);
}

function noise(x, y){
    let index = x + y*Width;
    let z = (noiseMap[index] + 1) * .5;
    return z;
}

function interpolate(a0, a1, w) {
    if (0.0 > w) return a0;
    if (1.0 < w) return a1;
    // return (a1 - a0) * w + a0;
    return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
}

function lerpColor(r1, g1, b1, r2, g2, b2, t){
    let r = (r2 - r1)*t + r1;
    let g = (g2 - g1)*t + g1;
    let b = (b2 - b1)*t + b1;
    return [r,g,b];
}


function makeMap(w, h, focus){
    // let focus = 25;//how many pixels between vectors should be even
    vMapW = Math.floor(w/focus);
    vMapH = Math.floor(h/focus);
    vectorMap = new Array(vMapW*vMapH);
    
    // let drawL = 20;
    // let sq = Math.SQRT2*focus
    for(let i = 0; i < vMapW*vMapH; i++){
        vectorMap[i] = randV();
    }
    let map = new Array(w*h);
    for(let col = 0; col < w; col++){
        for(let row = 0; row < h; row++){
            let index = row*w + col;
            if(col >= vMapW*focus || row >= vMapH*focus){
                map[index] = 0;
                continue;
            }
            let vX = Math.floor(col/focus); // base coordinates for top left of each square
            let vY = Math.floor(row/focus);
            let headx = col;
            let heady = row;
            // let displacementVs = new Array(4);
            let dots = new Array(4);
            let tailx;
            let taily;
            for(let i = 0; i < 4; i++){
                let x = i%2;
                let y = Math.floor(i/2);
                let xV = vX + x;
                let yV = vY + y;
                let cIndex = Math.min(xV + yV*vMapW, vectorMap.length-1);
                tailx = xV*focus;
                taily = yV*focus;
                let tempDisplacement = new Vector(headx - tailx, heady - taily)
                // displacementVs[i] = tempDisplacement;
                let tempCorner = vectorMap[cIndex];
                
                dots[i] = dot(tempDisplacement.normal(), tempCorner);
                // dots[i] = dot(tempDisplacement, tempCorner);
            }
            let sx = (col%focus)/focus;
            let sy = (row%focus)/focus;
            
            let final0;
            
            inte0 = interpolate(dots[0], dots[1], sx);
            inte1 = interpolate(dots[2], dots[3], sx);
            
            final0 = interpolate(inte0, inte1, sy);
            map[index] = final0;
        }
    }
    return map;
}

setInterval(updateSeg, 1000);
let foci = scaleSlider.value*3;
let noiseMap = makeMap(Width, Height, foci);
function updateSeg(evt){
    foci = scaleSlider.value*3;
    clearGraph();
    noiseMap = makeMap(Width, Height, foci);
    drawNoise();

}
