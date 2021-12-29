const collisionCanvas = document.getElementById('collisionCanvas')
const collisionCtx = collisionCanvas.getContext('2d')

collisionCanvas.width = window.innerWidth
collisionCanvas.height = window.innerHeight

//####################

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let timeToNextRaven = 0
let ravenInterval = 500
let lastTime = 0

let gameOver = false
let score = 0
ctx.font = '50px Impact'

let ravens = []

class Raven 
{
    constructor()
    {
        this.spriteWidth = 271
        this.spriteHeight = 194
        this.sizeModifier = Math.random() * 0.6 + 0.4
        this.width = this.spriteWidth * this.sizeModifier
        this.height = this.spriteHeight * this.sizeModifier
        this.x = canvas.width
        this.y = Math.random() * canvas.height - this.height
        this.directionX = Math.random() * 5 + 3
        this.directionY = Math.random() * 5 - 2.5
        this.markedForDeletion = false
        this.image = new Image()
        this.image.src = "raven.png"
        this.frame = 0
        this.maxFrame = 4
        this.timeSinceFlap = 0
        this.flapInterval = Math.random() * 50 + 50
        this.randomColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = `rgb(${this.randomColor[0]},${this.randomColor[1]},${this.randomColor[2]})`
    }

    update(deltaTime)
    {
        if (this.y < 0 || this.y > canvas.height - this.height)
        {
            this.directionY = -this.directionY
        }
        this.x -= this.directionX
        this.y += this.directionY
        if(this.x < 0 - this.width)
            this.markedForDeletion = true
        this.timeSinceFlap += deltaTime

        if(this.timeSinceFlap > this.flapInterval)
        {
            if(this.frame > this.maxFrame)
                this.frame = 0
            else this.frame++
            this.timeSinceFlap = 0
        }

        if(this.x < 0 - this.width)
            gameOver = true
        
    }

    draw()
    {
        collisionCtx.fillStyle = this.color
        collisionCtx.fillRect(this.x, this.y, this.width, this.height)
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x,this.y, this.width, this.height)
    }
}

let explosions = []

class Explosion{
    constructor(x, y, size)
    {
        this.image = new Image()
        this.image.src = 'boom.png'
        this.spriteWidth = 200
        this.spriteHeight = 179
        this.size = size
        this.x = x
        this.y = y
        this.frame = 0
        this.sound = new Audio()
        this.sound.src = 'bomb.wav'
        this.timeSinceLastFrame = 0
        this.frameInterval = 200
        this.markedForDeletion = false
    }

    update(deltaTime)
    {
        if(this.frame === 0)
        {
            this.sound.play()
        }
        this.timeSinceLastFrame += deltaTime
        if(this.timeSinceLastFrame > this.frameInterval)
        {
            this.timeSinceLastFrame = 0
            this.frame++
            if(this.frame > 5)
            {
                this.markedForDeletion = true
            }
        }
    }

    draw()
    {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight, this.x, this.y - this.size * 0.25, this.size, this.size)
    }
}

function drawScore()
{
    ctx.fillStyle = 'black'
    ctx.fillText(`Score: ${score}`, 50, 75)
    ctx.fillStyle = 'white'
    ctx.fillText(`Score: ${score}`, 55, 80)
}

function drawGameOver()
{
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText(`Game Over! Score: ${score}`, canvas.width * 0.5, canvas.height * 0.5)
    ctx.fillStyle = 'white'
    ctx.fillText(`Game Over! Score: ${score}`, canvas.width * 0.5 + 5, canvas.height * 0.5 + 5)
}

function animate(timestamp)
{
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let deltaTime = timestamp - lastTime
    lastTime = timestamp
    timeToNextRaven += deltaTime

    if(timeToNextRaven > ravenInterval)
    {
        ravens.push(new Raven())
        timeToNextRaven = 0
        ravens.sort(function(a,b)
        {
            return a.width - b.width
        })
    }
    drawScore();
    [...ravens, ...explosions].forEach(raven => raven.update(deltaTime));
    [...ravens, ...explosions].forEach(raven => raven.draw());
    ravens = ravens.filter(raven => !raven.markedForDeletion)
    explosions = explosions.filter(explosion => !explosion.markedForDeletion)
    if(!gameOver) requestAnimationFrame(animate)
    else drawGameOver()
}

animate(0)

window.addEventListener('click', e =>
{
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1,1)
    const pc = detectPixelColor.data
    ravens.forEach(raven => 
        {
            if(raven.randomColor[0] === pc[0] &&
                raven.randomColor[1] === pc[1] &&
                raven.randomColor[2] === pc[2])
                {
                    raven.markedForDeletion = true
                    score++
                    explosions.push(new Explosion(raven.x, raven.y, raven.width))
                }
        })
})