const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let birds=[];
let arrows=[];
let score=0;
let lives=3;
let gameRunning=false;

class Bird{
    constructor(special=false){
        this.x=-40;
        this.y=Math.random()*300+60;
        this.radius=25;
        this.speed=Math.random()*2+2;
        this.special=special;
    }
    update(){ this.x+=this.speed; }
    draw(){
        ctx.beginPath();
        ctx.fillStyle=this.special?"green":"white";
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
    }
}

class Arrow{
    constructor(x,y){
        this.x=50;
        this.y=canvas.height-120;
        this.tx=x;
        this.ty=y;
        this.speed=10;
    }
    update(){
        let dx=this.tx-this.x;
        let dy=this.ty-this.y;
        let dist=Math.sqrt(dx*dx+dy*dy);
        this.x+=dx/dist*this.speed;
        this.y+=dy/dist*this.speed;
    }
    draw(){
        ctx.fillStyle="brown";
        ctx.fillRect(this.x,this.y,15,3);
    }
}

function spawnBird(){
    birds.push(new Bird(Math.random()<0.15));
}

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    birds.forEach((bird,i)=>{
        bird.update();
        bird.draw();
        if(bird.x>canvas.width){
            birds.splice(i,1);
            loseLife();
        }
    });

    arrows.forEach((arrow,ai)=>{
        arrow.update();
        arrow.draw();

        birds.forEach((bird,bi)=>{
            let dx=arrow.x-bird.x;
            let dy=arrow.y-bird.y;
            if(Math.sqrt(dx*dx+dy*dy)<bird.radius){
                if(bird.special){
                    lives=Math.min(lives+1,3);
                }else{
                    score+=10;
                }
                birds.splice(bi,1);
                arrows.splice(ai,1);
            }
        });
    });

    document.getElementById("score").innerText="Score: "+score;
    document.getElementById("hearts").innerText="❤️".repeat(lives);

    if(gameRunning) requestAnimationFrame(update);
}

function loseLife(){
    lives--;
    if(lives<=0) endGame();
}

canvas.addEventListener("click",e=>{
    if(!gameRunning) return;
    arrows.push(new Arrow(e.clientX,e.clientY));
});

function startGame(){
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("gameContainer").classList.remove("hidden");

    score=0;
    lives=3;
    birds=[];
    arrows=[];
    gameRunning=true;

    setInterval(spawnBird,1500);
    update();
}

function endGame(){
    gameRunning=false;
    saveScore(score);
    alert("Game Over! Score: "+score);
    goHome();
}

function goHome(){
    document.getElementById("gameContainer").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
}

function saveScore(score){
    const tg=window.Telegram.WebApp;
    let user=tg.initDataUnsafe?.user;

    let name="Guest";
    let username="";

    if(user){
        name=user.first_name;
        username=user.username?"@"+user.username:"";
    }

    let scores=JSON.parse(localStorage.getItem("duckScores"))||[];

    scores.push({name,username,score});
    scores.sort((a,b)=>b.score-a.score);
    scores=scores.slice(0,10);

    localStorage.setItem("duckScores",JSON.stringify(scores));
}

function showLeaderboard(){
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("leaderboard").classList.remove("hidden");

    let scores=JSON.parse(localStorage.getItem("duckScores"))||[];
    let list=document.getElementById("scoresList");
    list.innerHTML="";

    if(scores.length===0){
        list.innerHTML="<li>No scores yet</li>";
        return;
    }

    scores.forEach((p,i)=>{
        let li=document.createElement("li");
        li.innerHTML=`#${i+1} ${p.name} ${p.username} - ${p.score}`;
        list.appendChild(li);
    });
}

function backToMenu(){
    document.getElementById("leaderboard").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
}
