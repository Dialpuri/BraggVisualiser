window.onload = function () {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var thetaSlider = document.getElementById('theta');
    var dSlider = document.getElementById('d');

    function getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        console.log("x: " + x + " y: " + y)
    }
    
    const canvas = document.querySelector('canvas')
    canvas.addEventListener('mousedown', function(e) {
        getCursorPosition(canvas, e)
    })

    width = canvas.width;
    height = canvas.height;
    gradient = 0
    
    //CONSTANTS
    let crystalLength = 400;
    let braggPlanes = 3;
    let centralX = width/2;
    let centralY = height/2;
    let reflectionPoint = [centralX-150,centralY+100]; // Change this to change the position of the diagram
    let xRaySource = [20,reflectionPoint[1], 100, 150] // xPos, yPos, width, height
    let xRaySourceInitialX = (xRaySource[0]+xRaySource[2])
    let initalXRayLength = 500
    let detectorPos = width - 300

    //VARIABLES
    var secondx; 
    var radians;
    var d = 50;
    var theta = 7;
    var dy;
    update()

    thetaSlider.oninput = function(){
        oldtheta = theta
        theta = parseInt(this.value)
        update()
    }

    dSlider.oninput = function(){
        d = parseInt(this.value)
        update()
    }

    function update(){
        ctx.clearRect(0, 0, c.width, c.height);
        radians = theta * (Math.PI/180)
        draw_crystal(parseInt(d),theta)
        draw_xray_source()
        draw_initial_xray()
        draw_initial_reflected_xray()
        draw_xray_passthrough()
        output()
        // check_bragg(theta,d)
    }

    function draw_xray_source(){
        ctx.beginPath()
        ctx.strokeStyle = 'red'
        ctx.rect(xRaySource[0],(xRaySource[1]-(xRaySource[3]/2)),xRaySource[2],xRaySource[3])
        ctx.stroke()
    }

    function draw_initial_xray(){   
        
        ctx.lineWidth = 2;
        ctx.setLineDash([0,0])
        
        ctx.beginPath()
        ctx.moveTo(xRaySourceInitialX, reflectionPoint[1] )
        ctx.lineTo(reflectionPoint[0], reflectionPoint[1] )
        
        ctx.moveTo(xRaySourceInitialX, reflectionPoint[1] + (0.25 * xRaySource[3]))
        ctx.lineTo(secondx, reflectionPoint[1] + (0.25 * xRaySource[3]))
        ctx.stroke()
        
        sinWave(xRaySourceInitialX, reflectionPoint[1] , 0, reflectionPoint[0]- xRaySource[0] - xRaySource[2])
        sinWave(xRaySourceInitialX, reflectionPoint[1] + (0.25 * xRaySource[3]), 0, secondx - xRaySource[0] - xRaySource[2])

    }

    function draw_initial_reflected_xray(){

        var y = (detectorPos - reflectionPoint[0]) * Math.tan(2*radians)
        dy = (detectorPos - secondx) * Math.tan( 2 * radians)

        var secondXRayY = reflectionPoint[1] + (0.25 * xRaySource[3])
        var topXRayLength = Math.sqrt((detectorPos - reflectionPoint[0])**2 + y**2)
        var bottomXRayLength = Math.sqrt((detectorPos- secondx)**2 + dy**2)
        ctx.lineWidth = 2;
     
        ctx.beginPath();
        ctx.strokeStyle='orange'

        ctx.moveTo(reflectionPoint[0],reflectionPoint[1])
        ctx.lineTo(detectorPos,reflectionPoint[1]-y)

        ctx.moveTo(secondx, secondXRayY)
        ctx.lineTo(detectorPos, secondXRayY - dy)
        ctx.stroke()
        
        negativeSinWave(reflectionPoint[0],reflectionPoint[1],2*theta,topXRayLength)
        negativeSinWave(secondx,secondXRayY,2*theta,bottomXRayLength)
    }

    function draw_xray_passthrough(){
        
        var x = initalXRayLength * Math.cos(2*radians)
        var dx = reflectionPoint[0] + x - secondx

        var secondXRayY = reflectionPoint[1] + (0.25 * xRaySource[3])

        ctx.setLineDash([5,4])
        ctx.strokeStyle='red'

        ctx.beginPath()
        ctx.moveTo(secondx, secondXRayY)
        ctx.lineTo(canvas.width - 300, secondXRayY)
        ctx.stroke()
    }

    function output() { 
        var secondXRayY = reflectionPoint[1] + (0.25 * xRaySource[3])
        var y = initalXRayLength * Math.sin(2*radians)
        
        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.setLineDash([0,0])
        ctx.rect(canvas.width - 250, xRaySource[1]-400, 200, 600)
        ctx.rect(canvas.width - 300, xRaySource[1]-400, 0, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(canvas.width - 150, secondXRayY, 2, 0,2*Math.PI)
        ctx.stroke()

        var averageY = (secondXRayY - dy + reflectionPoint[1]-y)/2

        ctx.beginPath()
        ctx.arc(canvas.width - 150, averageY, 2, 0,2*Math.PI)
        ctx.stroke()
        
    }

    function rotate(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }

    function sinWave(startX,startY,angle, lineLength){

        var width = lineLength 
        var height = ctx.canvas.height;
        var scale = 20;

        ctx.beginPath();
        ctx.lineWidth = 1;
        
        var x = 0;
        var y = 0;
        var amplitude = 10;
        var frequency = 4;
       

        for(x = 0; x < width; x++){
            y = startY + amplitude * Math.sin(x/frequency)
            r = rotate(startX,startY, startX + x, y,angle)
            ctx.lineTo(r[0],r[1])
        }
        ctx.stroke();
    }

    function negativeSinWave(startX,startY,angle, lineEndHeight){

        ctx.beginPath();
        ctx.lineWidth = 1;
        var x = 0;
        var y = 0;
        var amplitude = 10;
        var frequency = 4;
       

        for(x = 0; x < lineEndHeight; x++){
            y = startY + amplitude * - Math.sin(x/frequency)
            r = rotate(startX,startY, startX + x, y,angle)
            ctx.lineTo(r[0],r[1])
        }
        ctx.stroke();
    }

    function draw_crystal(d,theta) {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.setLineDash([0,0])

        ctx.lineWidth = 2;
        offset = 40
        ctx.strokeStyle = 'black';
        indent = 200
        numberOfAtoms = (crystalLength / offset) + 1
        
        theta_r = (90-theta) * (Math.PI/180)


        for(var i = 0; i < braggPlanes; i++){
                var x = Math.sin(theta_r) * (crystalLength/2)
                var y = Math.cos(theta_r) * (crystalLength/2)
                var dx = d * Math.cos(theta_r)
                var dy = d * Math.sin(theta_r)
                var arcx = offset * Math.cos(theta_r)
                var arcy = offset * Math.sin(theta_r)

            for(var j = 0; j < numberOfAtoms; j++){               
                ctx.beginPath()
                ctx.arc(
                    reflectionPoint[0] - x + (i*dx) + (j*arcy),
                    reflectionPoint[1] + y + (i*dy) - (j*arcx),
                    2,0,2*Math.PI
                ) // Calculate the position of the arcs by starting from the bottom left then incrementing x and y up per the offset and d length. Honestly don't fully understand it but hey it works.
                ctx.stroke()
            }
                    ctx.beginPath()
                    
                    ax = reflectionPoint[0]+x+(i*dx)
                    bx = reflectionPoint[1]-y+(i*dy)
                    cx = reflectionPoint[0]-x+(i*dx)
                    dx = reflectionPoint[1]+y+(i*dy)
                    
                    ctx.moveTo(ax, bx)
                    ctx.lineTo(cx, dx)
                    if (i == 1) {
                        gradient = (dx - bx) / (ax - cx)
            
                        secondx = calc(ax,bx,reflectionPoint[1]+ (0.25 * xRaySource[3]), gradient)
                    }
                    ctx.stroke()
        }
    }

    function check_bragg(value,d){
        wavelength = 15
        n = 1

        d = d / 5
        var radians = theta * (Math.PI/180)

        console.log("Theta:", value)
        console.log("Radians:",Math.sin(radians),Math.sin(radians).toFixed(2))
        console.log("Bragg:",wavelength/(2*d),(wavelength/(2*d)).toFixed(2))

        if ((Math.sin(radians).toFixed(2)) == (wavelength/(2*d)).toFixed(2)){
            console.log("YES")
        }
    }

    function calc(x1, y1, y,m){
        x = ((-y+y1)/m) + x1
        return x
    }
}