// setup canvas
const para = document.querySelector('p');
let count = 0;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// function to generate random number

function random(min, max) {
	const num = Math.floor(Math.random() * (max - min + 1)) + min;
	return num;
}

class Shape {
	constructor(x, y, velX, velY, exists) {
		this.x = x;
		this.y = y;
		this.velX = velX;
		this.velY = velY;
		this.exists = exists;
	}
}

class Ball extends Shape {
	constructor(x, y, velX, velY, exists, color, size) {
		super(x, y, velX, velY, exists);
		this.color = color;
		this.size = size;
	}

	draw() {
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		ctx.fill();
	}

	update() {
		if ((this.x + this.size) >= width) {
			this.velX = -(this.velX);
		}
		if ((this.x - this.size) <= 0) {
			this.velX = -(this.velX);
		}
		if ((this.y + this.size) >= height) {
			this.velY = -(this.velY);
		}
		if ((this.y - this.size) <= 0) {
			this.velY = -(this.velY);
		}

		this.x += this.velX;
		this.y += this.velY;
	}

	collisionDetect() {
		for (let j = 0; j < balls.length; j++) {  //loop through all balls
			if (!(this === balls[j]) && balls[j].exists) {
				const dx = this.x - balls[j].x;
				const dy = this.y - balls[j].y;
				const distance = Math.sqrt(dx * dx + dy * dy);  //sqrt(dx^2 + dy^2)

				if (distance < this.size + balls[j].size) {
					balls[j].color = this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')';
					// balls[j].velX = -(balls[j].velX); //this bit is extra...
					// balls[j].velY = -(balls[j].velY); //make balls bounce off of each other
					// this.velX = -(this.velX);         //balls still sometimes get stuck together
					// this.velY = -(this.velY);
				}
			}
		}
	}
}

class EvilCircle extends Shape {
	constructor(x, y, exists) {
		super(x, y, exists);
		this.velX = 20;
		this.velY = 20;
		this.color = 'white';
		this.size = 10;
	}

	draw() {
		ctx.beginPath();
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 3;
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		ctx.stroke();
	}

	checkBounds() {
		if ((this.x + this.size) >= width) {
			this.x -= this.size;
		}
		if ((this.x - this.size) <= 0) {
			this.x += this.size;
		}
		if ((this.y + this.size) >= height) {
			this.y -= this.size;
		}
		if ((this.y - this.size) <= 0) {
			this.y += this.size;
		}

	}

	setControls() {
		const _this = this;
		window.onkeydown = function (e) {
			if (e.key === 'a') {
				_this.x -= _this.velX;
			} else if (e.key === 'd') {
				_this.x += _this.velX;
			} else if (e.key === 'w') {
				_this.y -= _this.velY;
			} else if (e.key === 's') {
				_this.y += _this.velY;
			}
		}
	}

	collisionDetect() {
		for (let j = 0; j < balls.length; j++) {  //loop through all balls
			if (balls[j].exists) {
				const dx = this.x - balls[j].x;
				const dy = this.y - balls[j].y;
				const distance = Math.sqrt(dx * dx + dy * dy);  //sqrt(dx^2 + dy^2)

				if (distance < this.size + balls[j].size) {
					balls[j].exists = false;
					count--;
					para.textContent = 'Ball count: ' + count;
				}
			}
		}
	}
}

let balls = [];

while (balls.length < 25) {

	let size = random(10, 20);
	let ball = new Ball(
		// Ball pos. always drawn at least one ball width away
		// from the edge, to avoid drawing errors
		random(0 + size, width - size), //x
		random(0 + size, height - size), //y
		random(-7, 7), //velX
		random(-7, 7), //velY
		true, //exists
		'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')', //color
		size
	);
	balls.push(ball);
	count++;
	para.textContent = 'Ball count: ' + count;
}

let evilCircle = new EvilCircle(
	random(10, width - 10), //x
	random(10, height - 10), //y
	true);
evilCircle.setControls();

function loop() {
	ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
	ctx.fillRect(0, 0, width, height);

	evilCircle.draw();
	evilCircle.checkBounds();
	evilCircle.collisionDetect();

	for (let i = 0; i < balls.length; i++) {
		if (balls[i].exists) {
			balls[i].draw();
			balls[i].update();
			balls[i].collisionDetect();
		}

	}

	requestAnimationFrame(loop);
}

loop();