// DEPRECATED 
window.onload = function () {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var thetaSlider = document.getElementById('theta');
    var dSlider = document.getElementById('d');

    var d = 50;
    var theta = 30;

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

    //CONSTANTS
    let lineLength = 200;
    var crystalLength = 400;
    let braggPlanes = 2;
    let endCoordX = width/2;
    let endCoordY = height/2;
    let xRaySpacing = 75;
    
    //Variables
    var reflectionPoint = [500,350];

    update()

    thetaSlider.oninput = function(){
        oldtheta = theta
        theta = parseInt(this.value)
        //if (theta % 5 != 0){
        //    theta = oldtheta 
        //}
        update()
    }

    dSlider.oninput = function(){
        d = parseInt(this.value)
        update()
    }

    function update(){
        ctx.clearRect(0, 0, c.width, c.height);
        draw_crystal(parseInt(d))
        startCoords = calculateInitialLine(theta)
        x = xCalc(d, theta)
        draw_line(theta, startCoords[0], startCoords[1], xRaySpacing)
        draw_dashed(theta,d, x, xRaySpacing)
        draw_dashed_reflection(theta,startCoords[0],d, x, xRaySpacing)
        check_bragg(theta,d)
    }

    draw_line()

    function input_change() {
        var sliderValue = document.getElementById('angle').value
        draw_line(sliderValue);
        check_bragg(sliderValue)
    }

    function calculateInitialLine(value){

        radians = value * (Math.PI/180)

        adjacent = lineLength * Math.cos(radians)
        opposite = lineLength * Math.sin(radians)
        return [opposite,adjacent]
    }

    function xCalc(d, theta){
        //returns coordinates of the end point of the line
        d = parseInt(d)
        rTheta = theta * (Math.PI/180)
        x = d/Math.tan(rTheta)
        
        return x
    }

    function draw_line(value, opposite, adjacent, xRaySpacing){
                
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.setLineDash([0,0])

        xPos = reflectionPoint[0]
        ctx.strokeStyle = 'orange';

        ctx.moveTo(xPos,endCoordY);
        ctx.lineTo(xPos-adjacent,endCoordY-opposite);

        // ctx.moveTo(xPos-xRaySpacing,endCoordY);
        // ctx.lineTo(xPos-adjacent-xRaySpacing,endCoordY-opposite);
        ctx.stroke()

        ctx.strokeStyle = 'purple';
        ctx.beginPath();

        ctx.moveTo(xPos,endCoordY);
        ctx.lineTo(xPos+adjacent,endCoordY-opposite);
        ctx.stroke()

        sinWave(xPos,endCoordY, theta, lineLength)
        ctx.strokeStyle = 'orange';

        sinWave(xPos-adjacent,endCoordY-opposite, -theta , lineLength)
        //sinWave(xPos-adjacent-xRaySpacing,endCoordY-opposite, -theta , lineLength)



    }

    function draw_dashed(value,d, xShift){
        ctx.lineWidth = 2;
     
        ctx.beginPath();
        ctx.strokeStyle='orange'
        ctx.setLineDash([1,4])
        
        xPos = reflectionPoint[0]

        //ctx.moveTo(xPos,endCoordY)
       // ctx.lineTo(xPos + xShift, endCoordY + d)

        ctx.moveTo(xPos,endCoordY+d)
        ctx.lineTo(xPos - xShift - adjacent, endCoordY - opposite)

        ctx.stroke();
        ctx.setLineDash([0,0])

        //reflectedSinWave(xPos+xShift,endCoordY + d, 180-theta, opposite + d)
        reflectedSinWave(xPos,endCoordY + d, 180-theta, opposite + d)
        //reflectedSinWave(xPos- xRaySpacing,endCoordY, -theta, Math.sqrt(d**2 + xShift**2))
    }

    function draw_dashed_reflection(value,opposite,d,xShift){
        ctx.lineWidth = 2;
      
        radians = value * (Math.PI/180)
        y = (opposite+d)/Math.tan(radians)
       
        ctx.beginPath();
        ctx.strokeStyle='purple'
        ctx.setLineDash([1,4])

        xPos = reflectionPoint[0]

        //ctx.moveTo(xPos+xShift,endCoordY+d);
        //ctx.lineTo(xPos+y+xShift,endCoordY-opposite);
        
        ctx.moveTo(xPos,endCoordY+d);
        ctx.lineTo(xPos+y,endCoordY-opposite);
    
        ctx.stroke();

        ctx.setLineDash([0,0])

        //negativeSinWave(xPos+xShift,endCoordY+d, theta, opposite + d)
        negativeSinWave(xPos,endCoordY+d, theta, opposite + d)
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

    function reflectedSinWave(startX,startY,angle, lineEndHeight){

        var width = lineLength 
        var height = ctx.canvas.height;
        var scale = 20;

        ctx.beginPath();
        ctx.lineWidth = 1;

        radians = theta * (Math.PI/180)

        hypot = (lineEndHeight/Math.sin(radians))

        var x = 0;
        var y = 0;
        var amplitude = 10;
        var frequency = 4;

        var theta_90 = 90 - theta


        for(x = 0; x < hypot; x++){
            y = startY + amplitude * Math.sin(x/frequency)
            
            r = rotate(startX,startY, startX + x, y,angle)

            // if (r[1] > endCoordY + d){
            //     r[1] = endCoordY + d
            // }
            
            ctx.lineTo(r[0],r[1])
        }
        ctx.stroke();
    }

    function negativeSinWave(startX,startY,angle, lineEndHeight){

        ctx.beginPath();
        ctx.lineWidth = 1;

        radians = theta * (Math.PI/180)

        hypot = (lineEndHeight/Math.sin(radians))

        var x = 0;
        var y = 0;
        var amplitude = 10;
        var frequency = 4;
       

        for(x = 0; x < hypot; x++){
            y = startY + amplitude * - Math.sin(x/frequency)
            r = rotate(startX,startY, startX + x, y,angle)
            ctx.lineTo(r[0],r[1])
        }
        ctx.stroke();
    }

    function draw_crystal(d) {
        ctx.clearRect(0, 0, c.width, c.height);

        ctx.lineWidth = 2;
        offset = 50
        ctx.strokeStyle = 'black';
        indent = 200
        numberOfAtoms = (crystalLength / offset) + 1
        
        for(i = 0; i < numberOfAtoms; i++){
            for(j = 0; j < braggPlanes;j++){
                ctx.beginPath();
                ctx.setLineDash([0,0])
                ctx.arc(endCoordX-(crystalLength/2)+(i*offset),endCoordY+(d*j),2,0,2*Math.PI)
                ctx.stroke()
                ctx.beginPath()
                ctx.setLineDash([0,0])

                ctx.moveTo(endCoordX - crystalLength/2,endCoordY+(d*j))
                ctx.lineTo(endCoordX + crystalLength/2,endCoordY+(d*j))
                // ctx.moveTo(endCoordX-crystalLength/2,endCoordY+d)
                // ctx.lineTo(endCoordX+crystalLength/2,endCoordY+d)
                ctx.stroke()
            }
        }
        
        
        
        

    }

    function check_bragg(value,d){
        wavelength = 15
        n = 1

        d = d / 5

        radians = value * (Math.PI/180)
        console.log("Theta:", value)
        console.log("Radians:",Math.sin(radians),Math.sin(radians).toFixed(2))
        console.log("Bragg:",wavelength/(2*d),(wavelength/(2*d)).toFixed(2))

        if ((Math.sin(radians).toFixed(2)) == (wavelength/(2*d)).toFixed(2)){
            console.log("YES")
        }
        
        //console.log(n*wavelength)
        // if (Math.round(2*d*Math.sin(radians)) == Math.round(n*wavelength)){
        //     console.log("SATISFIED")
        // }
        // else {
        //     //console.log("NO")
        // }

    }
}