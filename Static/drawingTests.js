window.onload = function() { 
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height)

    x = 100
    y = 100
    mainWidth = 100
    mainHeight = 150
    miniWidth = 50
    miniHeight = 50
    coilHeight = 20
    anodeProtusion = 40
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.rect(x,y,mainWidth,mainHeight)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x+mainWidth/4, y - anodeProtusion)
    ctx.lineTo(x+(3*mainWidth/4), y - anodeProtusion)
    ctx.lineTo(x+(3*mainWidth/4),y + (miniHeight / 2))
    ctx.lineTo(x+mainWidth/4, y + (miniHeight / 2) + 50)
    ctx.lineTo(x+mainWidth/4,y - anodeProtusion)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x+mainWidth/4, y + mainHeight + 20)
    ctx.lineTo(+x+mainWidth/4, y + mainHeight - coilHeight)
    for(var i = 0; i < miniWidth/2; i++){
        var delta = 3
        if( i % 2 == 0){
            ctx.lineTo((x+mainWidth/4)+(2*i), y + mainHeight - coilHeight + delta)
        }
        else{
            ctx.lineTo((x+mainWidth/4)+(2*i), y + mainHeight - coilHeight - delta)
        }
    }
    ctx.lineTo(x+(3*mainWidth/4)-2, y + mainHeight + 20)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.strokeStyle = 'red'
    ctx.rect(x+mainWidth - 2.5, y + (miniHeight / 2) ,5,50)
    ctx.fill()

}