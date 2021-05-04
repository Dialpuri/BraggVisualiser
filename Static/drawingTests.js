// window.onload = function() { 
//     var c = document.getElementById("myCanvas");
//     var ctx = c.getContext("2d");
//     ctx.clearRect(0,0,c.width,c.height)

//     x = 100
//     y = 100
//     mainWidth = 100
//     mainHeight = 150
//     miniWidth = 50
//     miniHeight = 50
//     coilHeight = 20
//     anodeProtusion = 40
//     ctx.beginPath()
//     ctx.strokeStyle = 'black'
//     ctx.rect(x,y,mainWidth,mainHeight)
//     ctx.stroke()

//     ctx.beginPath()
//     ctx.moveTo(x+mainWidth/4, y - anodeProtusion)
//     ctx.lineTo(x+(3*mainWidth/4), y - anodeProtusion)
//     ctx.lineTo(x+(3*mainWidth/4),y + (miniHeight / 2))
//     ctx.lineTo(x+mainWidth/4, y + (miniHeight / 2) + 50)
//     ctx.lineTo(x+mainWidth/4,y - anodeProtusion)
//     ctx.stroke()

//     ctx.beginPath()
//     ctx.moveTo(x+mainWidth/4, y + mainHeight + 20)
//     ctx.lineTo(+x+mainWidth/4, y + mainHeight - coilHeight)
//     for(var i = 0; i < miniWidth/2; i++){
//         var delta = 3
//         if( i % 2 == 0){
//             ctx.lineTo((x+mainWidth/4)+(2*i), y + mainHeight - coilHeight + delta)
//         }
//         else{
//             ctx.lineTo((x+mainWidth/4)+(2*i), y + mainHeight - coilHeight - delta)
//         }
//     }
//     ctx.lineTo(x+(3*mainWidth/4)-2, y + mainHeight + 20)
//     ctx.stroke()

//     ctx.beginPath()
//     ctx.strokeStyle = 'red'
//     ctx.rect(x+mainWidth - 2.5, y + (miniHeight / 2) ,5,50)
//     ctx.fill()

// }

window.onload = function () {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height)

    class Electron {
        constructor(x, y) {
            this.x = x
            this.y = y
        }


        draw() {
            ctx.fillText("e", this.x, this.y)
        }

        update(){ 
            if (this.x < 100) {
                this.x += 1;
                this.y += 1;
                this.draw()
            }
            else {
                this.x = 0
                this.y = 0
            }
        }
    }

    let x = Math.random() * 2
    let y = Math.random() * 3

    const electron = new Electron(x, y)

    const animate = () => {
        requestAnimationFrame(animate)

        ctx.clearRect(0, 0, c.width, c.height)
        electron.update()
    }
}


    
    // class Electron {
    //     constructor(x, y) {
    //         this.x = x
    //         this.y = y
    //     }

    //     draw() {
    //         ctx.clearRect(0, 0, c.width, c.height)
    //         ctx.beginPath()
    //         // ctx.fillText("e", this.x, this.y)
    //         ctx.arc(this.x, this.y, 8, 0, Math.PI * 2, )
    //         ctx.stroke()

    //     }

    //     update(){ 
    //         //console.log("UPDATE CALLED")
    //         if (this.x < 100) {
    //             this.x += 1;
    //             this.y += 1;
    //             this.draw()
    //         }
    //     }
    // }

    // let ex = Math.random() * 500
    // let ey = Math.random() * 200

    // const electron = new Electron(ex, ey)

    // const animate = () => {
    //     ctx.save()
    //     let requestId = requestAnimationFrame(animate)
    //     electron.update()
    //     //cancelAnimationFrame(requestId)
    //     console.log("SHOULD RESTORE")
    //     ctx.restore()
    //     console.log("RESTORE ")
    //     update()
    // }

    startX = true

    function getRandomX() {
        if (startX == true) {
            startX = false
            return (65 + (Math.random() * 40))
        }
        
    }

    var ey = 540
    var ex = 65 
    function animate(){
        if (ey == 540){
            startX = true
        }
        ex = getRandomX()
        requestAnimationFrame(animate)
        ctx.clearRect(40,400,65,200)
        ctx.beginPath()
        ctx.arc(ex,ey,2,0,Math.PI*2, false)
        ctx.stroke()
        ey -= 1
        if(ey < 460) {
            ey = 545
        } 
        draw_xray_source()
    }