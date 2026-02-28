const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let birds = [];
let arrows = [];
let score = 0;
let lives = 3;
let gameRunning = false;

class Bird {
    constructor(colorDuck = false) {
        this.x = -50;
        this.y = Math.random() * 300 + 50;
        this.radius = 25;
        this.speed = Math.random() * 2 + 2;
        this.colorDuck = colorDuck;
    }

    update() {
        this.x += this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.colorDuck ? "orange" : "white";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Arrow {
    constructor(x, y) {
        this.x = 50;
        this.y = canvas.height - 100;
        this.targetX = x;
        this.targetY = y;
        this.speed = 10;
    }

    update() {
        let dx = this.targetX - this.x;
        let dy = this.targetY - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, 15, 3);
    }
}

function spawnBird() {
    let special = Math.random() < 0.1;
    birds.push(new Bird(special));
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    birds.forEach((bird, index) => {
        bird.update();
        bird.draw();

        if (bird.x > canvas.width) {
            birds.splice(index, 1);
            loseLife();
        }
    });

    arrows.forEach((arrow, aIndex) => {
        arrow.update();
        arrow.draw();

        birds.forEach((bird, bIndex) => {
            let dx = arrow.x - bird.x;
            let dy = arrow.y - bird.y;
            if (Math.sqrt(dx * dx + dy * dy) < bird.radius) {
                if (bird.colorDuck) {
                    lives = Math.min(lives + 1, 3);
                } else {
                    score += 10;
                }
                birds.splice(bIndex, 1);
                arrows.splice(aIndex, 1);
            }
        });
    });

    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("hearts").innerText = "❤️".repeat(lives);

    if (gameRunning) requestAnimationFrame(update);
}

function loseLife() {
    lives--;
    if (lives <= 0) {
        endGame();
    }
}

canvas.addEventListener("click", (e) => {
    if (!gameRunning) return;
    arrows.push(new Arrow(e.clientX, e.clientY));
});

function startGame() {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("gameContainer").classList.remove("hidden");

    score = 0;
    lives = 3;
    birds = [];
    arrows = [];
    gameRunning = true;

    setInterval(spawnBird, 1500);
    update();
}

function endGame() {
    gameRunning = false;
    saveScore(score);
    alert("Game Over! Score: " + score);
    goHome();
}

function goHome() {
    document.getElementById("gameContainer").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
}

function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem("duckScores")) || [];
    scores.push(score);
    scores.sort((a,b) => b-a);
    scores = scores.slice(0,5);
    localStorage.setItem("duckScores", JSON.stringify(scores));
}

function showLeaderboard() {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("leaderboard").classList.remove("hidden");

    let scores = JSON.parse(localStorage.getItem("duckScores")) || [];
    let list = document.getElementById("scoresList");
    list.innerHTML = "";

    scores.forEach(s => {
        let li = document.createElement("li");
        li.innerText = s;
        list.appendChild(li);
    });
}

function backToMenu() {
    document.getElementById("leaderboard").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    }
