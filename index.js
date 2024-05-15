const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gravity = 0.5

class Player {
    constructor() {
        this.speed = 5
        this.position = { x: 100, y: 100 }
        this.velocity = { x: 0, y: 0 }
        this.width = 66
        this.height = 100
        this.image = standright
        this.frames = 0
        this.sprites = {
            stand: {
                right: standright,
                left: standleft,
                cropWidth: 177,
                width: 66
            },
            run: {
                right: sright,
                left: sleft,
                cropWidth: 341,
                width: 127.85
            }
        }

        this.currentSprite = this.sprites.stand.right
        this.currentCropWidth = 177
        this.currentCounter = 0
    }

    draw() {
        c.drawImage(
            this.currentSprite,
            this.currentCropWidth * this.frames,
            0,
            this.currentCropWidth,
            400,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
    }

    update() {
        this.currentCounter++
        if (this.currentCounter === 2) {
            this.currentCounter = 0
            this.frames++
        }

        if (this.frames > 59 && (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left)) {
            this.frames = 0
        } else if (this.frames > 29 && (this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left)) {
            this.frames = 0
        }

        this.draw()
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        }
    }
}

class Platform {
    constructor({ x, y, image }) {
        this.position = { x, y }
        this.image = image
        this.width = image.width
        this.height = image.height
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

class GenericObject {
    constructor({ x, y, image }) {
        this.position = { x, y }
        this.image = image
        this.width = image.width
        this.height = image.height
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

let sleft = new Image()
sleft.src = './img/spriteRunLeft.png'
let sright = new Image()
sright.src = './img/spriteRunRight.png'
let standleft = new Image()
standleft.src = './img/spriteStandLeft.png'
let standright = new Image()
standright.src = './img/spriteStandRight.png'

let image = new Image()
image.src = './img/platform.png'
let image1 = new Image()
image1.src = './img/background.png'
let image2 = new Image()
image2.src = './img/hills.png'

let player = new Player()
let platforms = []
let genericObject = []
let currentKey
const keys = {
    right: { pressed: false },
    left: { pressed: false }
}
let scrollOffset = 0

function init() {
    image = new Image()
    image.src = './img/platform.png'
    image1 = new Image()
    image1.src = './img/background.png'
    image2 = new Image()
    image2.src = './img/hills.png'
    player = new Player()
    image3 = new Image()
    image3.src = './img/platformSmallTall.png'

    platforms = [
        new Platform({ x: -1, y: 470, image: image }),
        new Platform({ x: image.width - 3, y: 470, image: image }),
        new Platform({ x: image.width * 2 + 100, y: 470, image: image }),
        new Platform({ x: image.width * 3 + 400, y: 470, image: image }),
        new Platform({ x: image.width * 4 + 800, y: 470, image: image }),
        new Platform({ x: image.width * 5 + 1200, y: 370, image: image3 })
    ]
    genericObject = [
        new GenericObject({ x: -1, y: -1, image: image1 }),
        new GenericObject({ x: -1, y: -1, image: image2 })
    ]
    scrollOffset = 0
}

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'white'
    c.fillRect(0, 0, canvas.width, canvas.height)
    genericObject.forEach(obj => obj.draw())
    platforms.forEach(platform => platform.draw())
    player.update()

    handlePlayerMovement()

    platforms.forEach(platform => {
        if (
            player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            platform.position.x + platform.width >= player.position.x
        ) {
            player.velocity.y = 0
        }
    })

    handleSpriteSwitch()

    if (scrollOffset > image.width * 5 + 800) {
        console.log('you win')
    }

    if (player.position.y > canvas.height) {
        init()
    }
}

function handlePlayerMovement() {
    player.velocity.x = 0

    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = player.speed
    } else if ((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
        player.velocity.x = -player.speed
    }

    handleScrolling()
}

function handleScrolling() {
    if (keys.right.pressed) {
        scrollOffset += player.speed
        scrollBackground(-player.speed)
    } else if (keys.left.pressed && scrollOffset > 0) {
        scrollOffset -= player.speed
        scrollBackground(player.speed)
    }
}

function scrollBackground(speed) {
    platforms.forEach(platform => platform.position.x += speed)
    genericObject.forEach(obj => obj.position.x += speed * 0.66)
}

function handleSpriteSwitch() {
    if (keys.right.pressed && currentKey === 'right' && player.currentSprite !== player.sprites.run.right) {
        switchSprite(player.sprites.run.right, player.sprites.run.cropWidth, player.sprites.run.width)
    } else if (keys.left.pressed && currentKey === 'left' && player.currentSprite !== player.sprites.run.left) {
        switchSprite(player.sprites.run.left, player.sprites.run.cropWidth, player.sprites.run.width)
    } else if (!keys.left.pressed && currentKey === 'left' && player.currentSprite !== player.sprites.stand.left) {
        switchSprite(player.sprites.stand.left, player.sprites.stand.cropWidth, player.sprites.stand.width)
    } else if (!keys.right.pressed && currentKey === 'right' && player.currentSprite !== player.sprites.stand.right) {
        switchSprite(player.sprites.stand.right, player.sprites.stand.cropWidth, player.sprites.stand.width)
    }
}

function switchSprite(sprite, cropWidth, width) {
    player.frames = 1
    player.currentSprite = sprite
    player.currentCropWidth = cropWidth
    player.width = width
}

animate()

window.addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 65:
            keys.left.pressed = true
            currentKey = 'left'
            break
        case 68:
            keys.right.pressed = true
            currentKey = 'right'
            break
        case 87:
            player.velocity.y -= 15
            break
    }
})

window.addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65:
            keys.left.pressed = false
            break
        case 68:
            keys.right.pressed = false
            break
        case 87:
            break
    }
})
