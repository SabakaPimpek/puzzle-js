let image = document.getElementById("img");;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let scaler = 0.8;
let size = {x:0, y:0, width:0, height:0, columns:1, rows:1};
let pieces = [];
let selected_piece = null;
let time_start = null;
let time_end = null;

function main() {
    Resize();
    updateGame();
}

function setDifficulty() {
    let diff = document.getElementById("Difficulty").value;
    switch(diff) {
        case "easy":
            image.src="img/1.jpg"
            initializePieces(3,3);
            break;
        case "medium":
            image.src="img/2.png"
            initializePieces(5,7);
            break;
        case "hard":
            image.src="img/3.jpg"
            initializePieces(7,9);
            break;
        case "veryhard":
            initializePieces(10,10);
            break;
    }

}

function restart() {
    time_start = new Date().getTime();
    time_end = null;
    randomizePieces();
    document.getElementById("menuItems").style.display="none";
}

function updateTime() {
    let time_current = new Date().getTime();
    if(time_start!=null) {
        if(time_end!=null) {  
            document.getElementById("time").innerHTML = formatTime(time_end-time_start);
        }
        else {
            document.getElementById("time").innerHTML = formatTime(time_current-time_start);
        }
    }
}

function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds/1000);
    let s = Math.floor(seconds%60);
    let m = Math.floor((seconds%(60*60))/60);
    let h = Math.floor((seconds%(60*60*24))/(60*60));

    let formattedTime = h.toString().padStart(2,'0');
    formattedTime += ":";
    formattedTime += m.toString().padStart(2,'0');
    formattedTime += ":";
    formattedTime +=s.toString().padStart(2,'0');

    return formattedTime;
}

function isComplete() {
    for(let i=0; i<pieces.length; i++) {
        if(pieces[i].correct==false) {
            return false;
        }
    }
    return true;
}

function addEventListeners() {
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchmove", onTouchMove);
    canvas.addEventListener("touchend", onTouchEnd);
    window.addEventListener('resize', Resize, false);
}

function onTouchStart(e) {
    let poz = {x:e.touches[0].clientX,
    y:e.touches[0].clientY}

    onMouseDown(poz);
}

function onTouchMove(e) {
    let poz = {x:e.touches[0].clientX,
    y:e.touches[0].clientY}

    onMouseMove(poz);
}

function onTouchEnd() {
    onMouseUp();
}

function onMouseDown(e) {
    selected_piece=getPressedPiece(e);
    if(selected_piece != null) {
        const index = pieces.indexOf(selected_piece);
        if(index>-1) {
            pieces.splice(index,1);
            pieces.push(selected_piece);
        }
        selected_piece.offset = {
            x:e.x - selected_piece.x,
            y:e.y - selected_piece.y
        }
        selected_piece.correct = false;
    }
}

function onMouseMove(e) {
    if(selected_piece!=null) {
        selected_piece.x=e.x-selected_piece.offset.x;
        selected_piece.y=e.y-selected_piece.offset.y;
    }
}

function onMouseUp() {
    if(selected_piece != null)
    {
        if(selected_piece && selected_piece.isClose()) {
            selected_piece.snap();
            if(isComplete() && time_end==null) {
                time_end = new Date().getTime();   
            }
        }
    }
    selected_piece = null;
}

function getPressedPiece(poz) {
    for(let i=pieces.length-1; i>=0; i--) {
        if(poz.x>pieces[i].x && poz.x<pieces[i].x + pieces[i].width && poz.y> pieces[i].y && poz.y<pieces[i].y + pieces[i].height) {
            return pieces[i];
    }
    }
    return null;  
}

function Resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let resize=scaler*Math.min(
        window.innerWidth/image.width,
        window.innerHeight/image.height
    )
    size.width=resize*image.width;
    size.height=resize*image.height;
    size.x=window.innerWidth/2-size.width/2;
    size.y=window.innerHeight/2-size.height/2;
}

function updateGame() {
    ctx.clearRect(0,0,canvas.width, canvas.height)
    ctx.globalAlpha=0.5;
        ctx.drawImage(image,
        size.x, size.y,  
        size.width, size.height);
        
    ctx.globalAlpha=1;

        for(let i=0; i<pieces.length; i++)
        {
            pieces[i].draw(ctx);
        }

    updateTime();
    window.requestAnimationFrame(updateGame);
}

function initializePieces(rows, cols) {
    size.rows=rows;
    size.columns=cols;

    pieces=[];
    for(let i=0; i<size.rows; i++) {
        for(let j=0; j<size.columns; j++)
        {
            pieces.push(new Piece(i, j));
            
        }
    }

    let count = 0;
    for(let i=0; i<size.rows; i++) {
        for(let j=0; j<size.columns; j++) {
            const piece = pieces[count];

            if(i==size.rows-1) {
                piece.bottom = null;
            } else {
                const sign = (Math.random() - 0.5)<0?-1:1;
                piece.bottom = sign * (Math.random()*0.4+0.3);
            }

            if(j == size.columns-1) {
                piece.right = null;
            } else {
                const sign = (Math.random() - 0.5)<0?-1:1;
                piece.right = sign * (Math.random()*0.4+0.3);
            }

            if(j==0) {
                piece.left = null;
            } else {
                piece.left =-pieces[count - 1].right;
            }

            if(i==0) {
                piece.top = null;
            } else {
                piece.top=-pieces[count - size.columns].bottom; 
            }

            count++;
        }
    }
}

function randomizePieces() {
    for(let i=0;i<pieces.length; i++) {
        let loc={
            x:Math.random()* (canvas.width-pieces[i].width),
            y:Math.random()*(canvas.height-pieces[i].height)
        }
        pieces[i].x=loc.x;
        pieces[i].y=loc.y;
        pieces[i].correct=false;
    }
}

class Piece{
    constructor(rowIndex,colIndex) {
        this.rowIndex=rowIndex;
        this.colIndex=colIndex;
        this.x = size.x + size.width*this.colIndex/size.columns;
        this.y = size.y + size.height*this.rowIndex/size.rows;
        this.width = size.width/size.columns;
        this.height = size.height/size.rows;
        this.xCorrect = this.x;
        this.yCorrect = this.y;
        this.correct=true;
    }
    draw(ctx) {
        ctx.beginPath();

        const sz = Math.min(this.width, this.height);
        const neck = 0.1*sz;
        const tabWidth = 0.2*sz;
        const tabHeight = 0.2*sz;


         //from top left
        ctx.moveTo(this.x,this.y);
         //top top right
        if(this.top) {
            ctx.lineTo(this.x+this.width*Math.abs(this.top) - neck,
            this.y);

        ctx.bezierCurveTo(
            this.x+this.width*Math.abs(this.top)-neck,
            this.y-tabHeight*Math.sign(this.top)*0.2,

            this.x + this.width*Math.abs(this.top)-tabWidth,
            this.y-tabHeight*Math.sign(this.top),

            this.x+this.width*Math.abs(this.top),
            this.y-tabHeight*Math.sign(this.top)
        );

        ctx.bezierCurveTo(
            this.x + this.width*Math.abs(this.top)+tabWidth,
            this.y-tabHeight*Math.sign(this.top),

            this.x+this.width*Math.abs(this.top)+neck,
            this.y-tabHeight*Math.sign(this.top)*0.2,


            this.x+this.width*Math.abs(this.top)+neck,
            this.y
        );

        ctx.lineTo(this.x+this.width*Math.abs(this.top)+neck,
            this.y);
        }
        ctx.lineTo(this.x + this.width, this.y);

         //to bottom right
        if(this.right) {
            ctx.lineTo(this.x+this.width, this.y + this.height*Math.abs(this.right)-neck);
            
            ctx.bezierCurveTo(
                this.x+this.width - tabHeight*Math.sign(this.right) *
                0.2,
                this.y + this.height*Math.abs(this.right)-neck,

                this.x+this.width-tabHeight*Math.sign(this.right),
                this.y+this.height*Math.abs(this.right)-tabWidth,

                this.x+this.width-tabHeight*Math.sign(this.right),
                this.y+this.height*Math.abs(this.right)

            );

            ctx.bezierCurveTo(
                
                this.x+this.width - tabHeight*Math.sign(this.right),
                this.y + this.height*Math.abs(this.right)+tabWidth,
                
                this.x+this.width-tabHeight*Math.sign(this.right)*0.2,
                this.y+this.height*Math.abs(this.right)+neck,


                this.x+this.width,
                this.y+this.height*Math.abs(this.right)+neck

            );
            
        }
        ctx.lineTo(this.x+this.width, this.y+this.height)

         // to bottom left
         if(this.bottom){
            ctx.lineTo(this.x+this.width*Math.abs(this.bottom)+neck,
            this.y+this.height);
         
            ctx.bezierCurveTo(
                this.x + this.width*Math.abs(this.bottom) + neck,
                this.y + this.height + tabHeight*Math.sign(this.bottom) *0.2,

                this.x+this.width*Math.abs(this.bottom)+tabWidth,
                this.y+this.height+tabHeight*Math.sign(this.bottom),

                this.x+this.width*Math.abs(this.bottom),
                this.y+this.height+tabHeight*Math.sign(this.bottom)
            );

            ctx.bezierCurveTo(

                this.x + this.width*Math.abs(this.bottom)-tabWidth,
                this.y + this.height+tabHeight*Math.sign(this.bottom),

                this.x + this.width*Math.abs(this.bottom) - neck,
                this.y + this.height + tabHeight*Math.sign(this.bottom) *0.2,

                this.x + this.width*Math.abs(this.bottom)-neck,
                this.y + this.height
            );

         }
         ctx.lineTo(this.x, this.y+this.height);

         //to top left
         if(this.left) {

         ctx.lineTo(this.x, this.y + this.height * Math.abs(this.left) + neck);
        
         ctx.bezierCurveTo(
            this.x + tabHeight*Math.sign(this.left)*0.2,
            this.y + this.height*Math.abs(this.left) + neck,

            this.x + tabHeight*Math.sign(this.left),
            this.y + this.height*Math.abs(this.left) + tabWidth,

            this.x + tabHeight*Math.sign(this.left),
            this.y + this.height* Math.abs(this.left)
         );

         ctx.bezierCurveTo(
             
             this.x + tabHeight*Math.sign(this.left),
             this.y + this.height*Math.abs(this.left) - tabWidth,

             this.x + tabHeight*Math.sign(this.left)*0.2,
             this.y + this.height*Math.abs(this.left) - neck,
             
            this.x,
            this.y + this.height* Math.abs(this.left) - neck
         );
        
         }
         ctx.lineTo(this.x, this.y);

         ctx.save();
         ctx.clip();

         const scaledTabHeight = 
            Math.min(image.width/size.columns,
                image.height/size.rows)*tabHeight/sz;

         ctx.drawImage(image,
            this.colIndex*image.width/size.columns - scaledTabHeight,
            this.rowIndex*image.height/size.rows - scaledTabHeight,
            image.width/size.columns + scaledTabHeight*2,
            image.height/size.rows +scaledTabHeight*2,
            this.x-tabHeight,
            this.y-tabHeight,
            this.width+tabHeight*2,
            this.height+tabHeight*2)

            ctx.restore();

        ctx.stroke();
    }
    isClose() {
        if(distance({x:this.x, y: this.y},
            {x:this.xCorrect, y:this.yCorrect}) <this.width/3) {
               return true; 
            }
            return false;
    }
    snap() {
        this.x = this.xCorrect;
        this.y = this.yCorrect;
        this.correct = true;
    }
}

function distance(p1, p2) {
    return Math.sqrt(
        (p1.x-p2.x) * (p1.x-p2.x) +
        (p1.y-p2.y) * (p1.y-p2.y)
    )
}

main();
initializePieces(3,3);
addEventListeners();