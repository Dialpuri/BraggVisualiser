//© Jordan Dialpuri 2021

window.onload = function () {
    //Initialise links to the HTML file
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var thetaSlider = document.getElementById('theta');
    var dSlider = document.getElementById('d');
    var wavelengthSlider = document.getElementById('wavelength')

    var ce = document.getElementById("ewald");
    var ctxe = ce.getContext("2d");


    //FOR DEBUGGING ONLY 
    function getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        console.log("x: " + x + " y: " + y)
    }

    const canvas = document.querySelector('canvas')
    canvas.addEventListener('mousedown', function (e) {
        getCursorPosition(canvas, e)
    })

    //Initialise key variables first
    width = canvas.width;
    height = canvas.height;
    ewidth = ce.width;
    eheight = ce.height;

    //CONSTANTS
    const CENTER_POINT = { x: width / 2, y: height / 2 }
    const EW_CENTER_POINT = { x: ewidth / 2, y: eheight / 2 }
    const CRYSTAL_LENGTH = 400;
    const BRAGG_PLANES = 3;
    const REFLECTION_POINT = [CENTER_POINT.x - 300, CENTER_POINT.y + 100]; // Change this to change the position of the diagram

    //Constants for the apperance of the X-ray source.
    const XRAY_SOURCE = { 
        xPos: 50, 
        yPos: REFLECTION_POINT[1] + 15,
        width: 100,
        height: 150
    }
    const XRAY_SOURCE_X = (XRAY_SOURCE.xPos + XRAY_SOURCE.width)
    const SECOND_XRAY_Y = REFLECTION_POINT[1] + (0.25 * XRAY_SOURCE.height)
    const XRAY_SOURCE_OUTER_WIDTH = 100
    const XRAY_SOURCE_OUTER_HEIGHT = 150
    const XRAY_SOURCE_INNER_WIDTH = 50
    const XRAY_SOURCE_INNER_HEIGHT = 50
    const XRAY_COIL_HEIGHT = 20
    const XRAY_ANODE_PROTRUSION = 40
    
    //Constants for the apperance of the diffraction pattern.
    const DIFF_PATTERN = {
        x: width - 600,
        y: XRAY_SOURCE.yPos - 400,
        width: 500,
        height: 600
    }

    //Other constants
    const ATOM_SPACING = 40
    const WAVELENGTH_FACTOR = 500
    const D_FACTOR = 500

    //VARIABLES
    var re = new RegExp('/^\d+\.?\d*$/');
    var bottomXrayCrystalCrossX;
    var radians, radians_90;
    var d = 5;
    var inverseD = (1/5) * D_FACTOR;
    var theta = 30;
    var wavelength = 3;
    var isBraggSatisfied = false;
    var correctPos = [];
    var passthroughCoords;
    var refractedCoords;
    var inverseWavelength = 1/3 * WAVELENGTH_FACTOR;
    var gradient;

    //Animate the electron coming from the coil.
    var ey = XRAY_SOURCE.yPos - 45 + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT
    var ex = 80

    function animate() {
        requestAnimationFrame(animate)
        ctx.clearRect(70, 300, 65, 500)
        ctx.beginPath()
        ctx.font = "12px Verdana";
        ctx.fillText("e⁻", ex, ey)
        ctx.stroke()
        ey -= 2
        var anodeY = ((-1 * ex) + 80) + y + (XRAY_SOURCE_OUTER_HEIGHT / 2) - 5
        if (ey < anodeY) {
            ey = XRAY_SOURCE.yPos - 45 + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT
            ex = 80 + (Math.random() * 20)
        }
        draw_xray_source()
    }

    //Bounding boxes for the appearance of tooltips, a rectangle surrounding the area. 
    boundingBoxes = [{
            name: "X-ray source",
            description: "Generates X-ray source",
            x: XRAY_SOURCE.xPos - 2,
            y: XRAY_SOURCE.yPos - 45,
            width: XRAY_SOURCE_OUTER_WIDTH,
            height: XRAY_SOURCE_OUTER_HEIGHT
        },
        {
            name: "Diffraction Pattern",
            description: "What is shown on the detector",
            x: DIFF_PATTERN.x,
            y: XRAY_SOURCE.yPos - 400,
            width: 500,
            height: 600
        },
    ]

    //Safe trial of the animation and update (animate can carry on and lag browser).
    try {
        update()
        animate()
    } catch (err) {
        console.log(err)
    }

    //----HTML SLIDER INPUTS----
    thetaSlider.oninput = function () {
        theta = parseFloat(this.value)
        document.getElementById('thetaValueText').value = (String(theta.toFixed(2) + " °"))
        update()
    }
  

    thetaValueText.onchange = function( ){

        theta = parseFloat(this.value)
        if (re.test(this.value)){
            document.getElementById('thetaValueText').style.color = 'white'
            console.log("allowed")
        }
        else {
            console.log("Not allowed")
            document.getElementById('thetaValueText').style.color = 'red';
        }
        console.log(theta)
    }

    dSlider.oninput = function () {
        d = parseFloat(this.value)
        inverseD = (1 / d) * D_FACTOR
        document.getElementById('dValue').innerHTML = (String(d.toFixed(2) + " Å"))
        update()
    }

    wavelengthSlider.oninput = function () {
        wavelength = parseFloat(this.value)
        inverseWavelength = (1 / wavelength) * WAVELENGTH_FACTOR
        document.getElementById('wavelengthValue').innerHTML = (String(this.value + " nm"))
        update()
    }

    //Update and redraw all the parts of the canvas, called everytime a slider changes.
    function update() {
        //Update and redraw all the parts of the canvas.
        ctx.clearRect(0, 0, c.width, c.height);
        ctxe.clearRect(0, 0, ce.width, ce.height);

        radians = degToRad(theta)
        radians_90 = degToRad(90 - theta) 
        draw_crystal()
        draw_xray_source()
        drawIncidentRays()
        drawRefractedRays()
        draw_xray_passthrough()
        draw_detector()
        draw_s()
        check_bragg(d)
        draw_circle()
        draw_labels()
        draw_horizontal_lines()
        draw_angled_lines()
        draw_d_line()

        if (isBraggSatisfied == true) {
            draw_correct_diffraction_spot()
        }
    }
    //Draw the X-ray source box.
    function draw_xray_source() {
        x = XRAY_SOURCE.xPos - 2
        y = XRAY_SOURCE.yPos - 45

        ctx.lineWidth = 1.5;

        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.rect(x, y, XRAY_SOURCE_OUTER_WIDTH, XRAY_SOURCE_OUTER_HEIGHT)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y - XRAY_ANODE_PROTRUSION)
        ctx.lineTo(x + (3 * XRAY_SOURCE_OUTER_WIDTH / 4), y - XRAY_ANODE_PROTRUSION)
        ctx.lineTo(x + (3 * XRAY_SOURCE_OUTER_WIDTH / 4), y + (XRAY_SOURCE_INNER_HEIGHT / 2))
        ctx.lineTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y + (XRAY_SOURCE_INNER_HEIGHT / 2) + 50)
        ctx.lineTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y - XRAY_ANODE_PROTRUSION)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineWidth = 3;

        ctx.moveTo(x + (3 * XRAY_SOURCE_OUTER_WIDTH / 4), y + (XRAY_SOURCE_INNER_HEIGHT / 2) - 2)
        ctx.lineTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y + (XRAY_SOURCE_INNER_HEIGHT / 2) + 48)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineWidth = 1.5;

        ctx.moveTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y + XRAY_SOURCE_OUTER_HEIGHT + 20)
        ctx.lineTo(+x + XRAY_SOURCE_OUTER_WIDTH / 4, y + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT)
        for (var i = 0; i < XRAY_SOURCE_INNER_WIDTH / 2; i++) {
            var delta = 3
            if (i % 2 == 0) {
                ctx.lineTo((x + XRAY_SOURCE_OUTER_WIDTH / 4) + (2 * i), y + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT + delta)
            } else {
                ctx.lineTo((x + XRAY_SOURCE_OUTER_WIDTH / 4) + (2 * i), y + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT - delta)
            }
        }
        ctx.lineTo(x + (3 * XRAY_SOURCE_OUTER_WIDTH / 4) - 2, y + XRAY_SOURCE_OUTER_HEIGHT + 20)
        ctx.stroke()

        ctx.beginPath()
        ctx.strokeStyle = 'red'
        ctx.rect(x + XRAY_SOURCE_OUTER_WIDTH - 2, y + (XRAY_SOURCE_INNER_HEIGHT / 2), 4, 50)
        ctx.fill()
    }

    //Draw the indident rays coming from the X-ray source.
    function drawIncidentRays() {
        var topXRayLength = REFLECTION_POINT[0] - XRAY_SOURCE_X //Calculate the length of the top incident X-ray, because it is at 0 degrees no pythag needed.
        var bottomXRayLength = bottomXrayCrystalCrossX - XRAY_SOURCE_X //Calculate the length of the bottom incident X-ray, because it is at 0 degrees no pythag needed.
        //Configure appearance of the lines
        ctx.lineWidth = 2;
        ctx.setLineDash([0, 0])
        ctx.strokeStyle = 'red'

        //Draw the incident x-ray solid line
        ctx.beginPath()
        ctx.moveTo(XRAY_SOURCE_X, REFLECTION_POINT[1])
        ctx.lineTo(REFLECTION_POINT[0], REFLECTION_POINT[1])

        ctx.moveTo(XRAY_SOURCE_X, SECOND_XRAY_Y)
        ctx.lineTo(bottomXrayCrystalCrossX, SECOND_XRAY_Y)
        ctx.stroke()

        //Draw the incident x-ray waves
        sinWave(XRAY_SOURCE_X, REFLECTION_POINT[1], 0, topXRayLength, 1)
        sinWave(XRAY_SOURCE_X, SECOND_XRAY_Y, 0, bottomXRayLength, 1)

    }

    function drawRefractedRays() {

        var topXRayLength = REFLECTION_POINT[0] - XRAY_SOURCE_X //Calculate the length of the top incident X-ray, because it is at 0 degrees no pythag needed.
        var bottomXRayLength = bottomXrayCrystalCrossX - XRAY_SOURCE_X //Calculate the length of the bottom incident X-ray, because it is at 0 degrees no pythag needed.

        //Displacement of the incident X-ray with equal length to the incident rays.
        var topYDisplacement = topXRayLength * Math.sin(2 * radians)
        var bottomYDisplacement = bottomXRayLength * Math.sin(2 * radians)
        var topXDisplacment = topXRayLength * Math.cos(2 * radians)
        var bottomXDisplacement = bottomXRayLength * Math.cos(2 * radians)

        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.strokeStyle = 'green'

        ctx.moveTo(REFLECTION_POINT[0], REFLECTION_POINT[1])
        ctx.lineTo(REFLECTION_POINT[0] + topXDisplacment, REFLECTION_POINT[1] - topYDisplacement)

        ctx.moveTo(bottomXrayCrystalCrossX, SECOND_XRAY_Y)
        ctx.lineTo(bottomXrayCrystalCrossX + bottomXDisplacement, SECOND_XRAY_Y - bottomYDisplacement)
        ctx.stroke()

        //Dictionary of end of the bottom refracted ray for use with the s vector arrow.
        refractedCoords = {
            x: bottomXrayCrystalCrossX + bottomXDisplacement,
            y: SECOND_XRAY_Y - bottomYDisplacement
        }

        sinWave(REFLECTION_POINT[0], REFLECTION_POINT[1], 2 * theta, topXRayLength, -1)
        sinWave(bottomXrayCrystalCrossX, SECOND_XRAY_Y, 2 * theta, bottomXRayLength, -1)
    }

    //Draw the x-ray that goes through the crytal.
    function draw_xray_passthrough() {

        ctx.setLineDash([5, 4])
        ctx.strokeStyle = 'red'
        var bottomXRayLength = bottomXrayCrystalCrossX - XRAY_SOURCE_X //Calculate the length of the bottom incident X-ray, because it is at 0 degrees no pythag needed.

        ctx.beginPath()
        ctx.moveTo(bottomXrayCrystalCrossX, SECOND_XRAY_Y)
        ctx.lineTo(bottomXrayCrystalCrossX + bottomXRayLength, SECOND_XRAY_Y)

        //Dictionary of end of the passthrough ray for use with the s vector arrow.
        passthroughCoords = {
            x: bottomXrayCrystalCrossX + bottomXRayLength,
            y: SECOND_XRAY_Y
        }

        ctx.stroke()
    }

    //Draw the detector with diffraction spots. 
    function draw_detector() {
        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.setLineDash([0, 0])
        ctx.rect(DIFF_PATTERN.x, DIFF_PATTERN.y, DIFF_PATTERN.width, DIFF_PATTERN.height)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(DIFF_PATTERN.x + (DIFF_PATTERN.width / 2), SECOND_XRAY_Y, 3, 0, 2 * Math.PI)
        ctx.fill()

        deltaPos = {
            x: passthroughCoords.x - refractedCoords.x,
            y: passthroughCoords.y - refractedCoords.y
        }

        ctx.beginPath()
        ctx.arc(DIFF_PATTERN.x + (DIFF_PATTERN.width / 2) - deltaPos.x, SECOND_XRAY_Y - deltaPos.y, 3, 0, 2 * Math.PI)

        //Arrow between origin spot and diffracted spot
        //canvas_arrow(ctx,DETECTOR_POSITION + (DETECTOR_WIDTH/2) - 2, SECOND_XRAY_Y - 2 , DETECTOR_POSITION + (DETECTOR_WIDTH/2) - deltaPos.x + 5, SECOND_XRAY_Y - deltaPos.y + 5)
        
        ctx.stroke()

        ctx.font = "bold 16px Verdana"
        ctx.fillText("Diffraction Pattern", DIFF_PATTERN.x + (0.5 * DIFF_PATTERN.width) - 90, 50)
        
    }

    //Calculate the rotation of the sin waves that are required
    function rotate(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }

    //Draw sin waves from a starting coordinate with length lineLength and with positive or negative sign.
    function sinWave(startX, startY, angle, lineLength, amplitudeSign) {
        ctx.beginPath();
        ctx.lineWidth = 1;

        var amplitude = 10;
        var frequency = wavelength;

        for (var x = 0; x < lineLength; x++) {
            var y = startY + amplitude * amplitudeSign * Math.sin(x / frequency)
            r = rotate(startX, startY, startX + x, y, angle)
            ctx.lineTo(r[0], r[1])
        }
        ctx.stroke();
    }

    //Draw the s arrow from the end of the passthrough x-ray to the bottom incident ray.
    function draw_s() {
        ctx.beginPath()
        canvas_arrow(ctx, passthroughCoords.x - 2, passthroughCoords.y - 2, refractedCoords.x + 2, refractedCoords.y + 2)
        ctx.stroke()
    }

    //Draw arrow template.
    function canvas_arrow(context, fromx, fromy, tox, toy) {
        var headlen = 10; // length of head in pixels
        var dx = tox - fromx;
        var dy = toy - fromy;
        var angle = Math.atan2(dy, dx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    }

    //Draw the crystal with distance d and rotation theta. 
    function draw_crystal() {
        //Set style of line
        ctx.setLineDash([0, 0])
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        indent = 200

        //Calculate number of atoms using formula
        numberOfAtoms = (CRYSTAL_LENGTH / ATOM_SPACING) + 1

        //Loop through all bragg planes
        for (var i = 0; i < BRAGG_PLANES; i++) {
            //Calculate the x and y points for that theta reflection
            var x = Math.sin(radians_90) * (CRYSTAL_LENGTH / 2)
            var y = Math.cos(radians_90) * (CRYSTAL_LENGTH / 2)

            //Calculate the distance between the layers in x and y form (not at an angle)
            var dx = (d * 8) * Math.cos(radians_90)
            var dy = (d * 8) * Math.sin(radians_90)

            //Calculat the positions of the arcs which denote atoms
            var arcx = ATOM_SPACING * Math.cos(radians_90)
            var arcy = ATOM_SPACING * Math.sin(radians_90)

            //Loop through all the atoms that should be drawn

            for (var j = 0; j < numberOfAtoms; j++) {
                ctx.beginPath()
                ctx.arc(
                    REFLECTION_POINT[0] - x + (i * dx) + (j * arcy),
                    REFLECTION_POINT[1] + y + (i * dy) - (j * arcx),
                    2, 0, 2 * Math.PI
                ) // Calculate the position of the arcs by starting from the bottom left then incrementing x and y up per the offset and d length. Honestly don't fully understand it but hey it works.
                ctx.stroke()
            }
            ctx.beginPath()

            //Positions of starting and end x and y for the lines  for use in gradient calcualtion and drawing
            ax = REFLECTION_POINT[0] + x + (i * dx)
            bx = REFLECTION_POINT[1] - y + (i * dy)
            cx = REFLECTION_POINT[0] - x + (i * dx)
            dx = REFLECTION_POINT[1] + y + (i * dy)

            //Draw the crystal lines
            ctx.moveTo(ax, bx)
            ctx.lineTo(cx, dx)

            //If on the second plane (not the surface)
            if (i == 1) {
                //Calculate the gradient and then set the x position of where the bottom X-ray beam crosses that line.
                gradient = (dx - bx) / (ax - cx)
                bottomXrayCrystalCrossX = calculateGradient(ax, bx, SECOND_XRAY_Y, gradient)
            }
            ctx.stroke()
        }
    }
    
    //Checks if the bragg equation has been satisified. sin(theta) = wavelength/2d.
    function check_bragg(d) {
        n = 1
        factor = 1
        // console.log("Theta:", theta)
        // console.log("Radians:", Math.sin(factor * radians), Math.sin(factor * radians).toFixed(3))
        // console.log("Bragg:", wavelength / (2 * d), (wavelength / (2 * d)).toFixed(3))

        document.getElementById('2dsintheta').innerHTML = parseFloat(2 * d * (Math.sin(factor * radians))).toPrecision(4)
        document.getElementById('nlambda').innerHTML = parseFloat(n * wavelength).toPrecision(4)
        document.getElementById("sidebar").style.background="black";

        if ((Math.sin(factor * radians).toFixed(3)) == (wavelength / (2 * d)).toFixed(3)) {
            isBraggSatisfied = true
            correctPos.push({ x: DIFF_PATTERN.x + (DIFF_PATTERN.width / 2) - deltaPos.x, y: SECOND_XRAY_Y - deltaPos.y })
            document.getElementById("sidebar").style.background="green";
        }
    }

    //Draws the diffraction spot that satisifies the bragg equation.
    function draw_correct_diffraction_spot() {
        console.log("CALLED")
        for(i = 0; i < correctPos.length; i++) {
            ctx.beginPath()
            ctx.arc(correctPos[i].x, correctPos[i].y, 3, 0, 2 * Math.PI)
            ctx.fill()
        }
    }

    //EWALD CANVAS DRAW FUNCTIONS

    //Draw the circle with 1/wavelength radius
    function draw_circle() {
        ctxe.beginPath()
        ctxe.arc(EW_CENTER_POINT.x, EW_CENTER_POINT.y, inverseWavelength, 0, Math.PI * 2)
        ctxe.stroke()
    }

    //Draw all the labels around the circle
    function draw_labels() { 
        //Calculate some of the mid and endpoints of lines to get rough positions for the labels
        var bottomThetaX = ((inverseWavelength/6) + 6) * Math.cos(degToRad(0.5 * theta))
        var bottomThetaY = ((inverseWavelength/6) + 6) *  Math.sin(degToRad(0.5 * theta))
        var topThetaX = ((inverseWavelength/6) + 8) * Math.cos(degToRad(1.5 * theta))
        var topThetaY = ((inverseWavelength/6) + 8) *  Math.sin(degToRad(1.5 * theta))
        var dX = (inverseD/2) * Math.cos(radians_90)
        var dY = (inverseD/2) * Math.sin(radians_90)

        ctxe.beginPath()
        ctxe.font = "12px Verdana" //Can change font here
        ctxe.fillText("A", EW_CENTER_POINT.x, EW_CENTER_POINT.y + 15)
        ctxe.fillText("O", EW_CENTER_POINT.x + inverseWavelength + 10, EW_CENTER_POINT.y + 6)
        ctxe.fillText("1/λ", EW_CENTER_POINT.x - (inverseWavelength/2) - 5, EW_CENTER_POINT.y + 15)
        canvas_arrow(ctxe,EW_CENTER_POINT.x - (inverseWavelength/2) - 5, EW_CENTER_POINT.y + 9, EW_CENTER_POINT.x - inverseWavelength + 5, EW_CENTER_POINT.y + 9)
        canvas_arrow(ctxe,EW_CENTER_POINT.x - (inverseWavelength/2) + 15, EW_CENTER_POINT.y + 9, EW_CENTER_POINT.x - 5, EW_CENTER_POINT.y + 9)
        ctxe.fillText("θ", EW_CENTER_POINT.x + bottomThetaX, EW_CENTER_POINT.y - bottomThetaY + 5)
        ctxe.fillText("θ", EW_CENTER_POINT.x + topThetaX, EW_CENTER_POINT.y - topThetaY )
        ctxe.fillText("d*ₕₖₗ", EW_CENTER_POINT.x + inverseWavelength - dX - 30, EW_CENTER_POINT.y - dY)
        ctxe.stroke()
    }

    //Draw the line that spans the diameter (2/wavelength).
    function draw_horizontal_lines() {
        //Calculate x coord of the left and right edge (y is constant)
        var left_edge = EW_CENTER_POINT.x - inverseWavelength
        var right_edge = EW_CENTER_POINT.x + inverseWavelength

        ctxe.beginPath()
        ctxe.moveTo(left_edge, EW_CENTER_POINT.y)
        ctxe.lineTo(right_edge, EW_CENTER_POINT.y)
        ctxe.stroke()
    }

    //Draw the line of angle 2theta aswell as the arcs that show where the angle theta is.
    function draw_angled_lines() {
        var deltaX = inverseWavelength * Math.cos(2 * radians)
        var deltaY = inverseWavelength * Math.sin(2 * radians)

        var halfDeltaX = (inverseWavelength/2) * Math.cos(radians)
        var halfDeltaY = (inverseWavelength/2) * Math.sin(radians)

        //Draw line with 2theta
        ctxe.beginPath()
        ctxe.moveTo(EW_CENTER_POINT.x, EW_CENTER_POINT.y)
        ctxe.lineTo(EW_CENTER_POINT.x + deltaX, EW_CENTER_POINT.y - deltaY)
        ctxe.stroke()

        //Draw dashed middle line (with theta angle)
        ctxe.beginPath()
        ctxe.setLineDash([2,4])
        ctxe.moveTo(EW_CENTER_POINT.x, EW_CENTER_POINT.y)
        ctxe.lineTo(EW_CENTER_POINT.x + halfDeltaX, EW_CENTER_POINT.y - halfDeltaY)
        ctxe.stroke()

        //Draw the arcs
        ctxe.beginPath()
        ctxe.setLineDash([0,0])
        ctxe.arc(EW_CENTER_POINT.x,EW_CENTER_POINT.y, inverseWavelength/6, degToRad(0) , degToRad(360-(theta)),true)
        ctxe.stroke()
        ctxe.beginPath()
        ctxe.arc(EW_CENTER_POINT.x,EW_CENTER_POINT.y, (inverseWavelength/6) + 5, degToRad(360-(theta)) , degToRad(360-(2*theta)),true)
        ctxe.stroke()
    }

    //Draw the line d which has 1/d length
    function draw_d_line() {
        //Calculate x and y endpoints and starting position
        var right_edge = EW_CENTER_POINT.x + inverseWavelength
        var deltaX = inverseD * Math.cos(radians_90)
        var deltaY = inverseD * Math.sin(radians_90)

        ctxe.beginPath()
        ctxe.moveTo(right_edge, EW_CENTER_POINT.y)
        ctxe.lineTo(right_edge - deltaX, EW_CENTER_POINT.y - deltaY)
        ctxe.stroke()
    }

    //OTHER FUNCTIONS (UTILITIES)

    //Function to convert degrees to radians -> returns radians 
    function degToRad(value) { 
        return value * (Math.PI/180)
    }

    //Calcluate the gradient of the x-ray crystal to determine where the bottom incident x-ray should reflect from. 
    function calculateGradient(x1, y1, y, m) {
        x = ((-y + y1) / m) + x1
        return x
    }

    //Gets correct XY coordinates for use in tooltips with CSS.
    function getXY(canvas, event) {
        var rect = canvas.getBoundingClientRect(); // absolute position of canvas
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
    }

    //Event listener for mouse movements which checks array of boundingBoxes to get which tooltip to show if any. 
    canvas.addEventListener('mousemove', function (e) {
        ctx.clearRect(0, 0, 500, 75)
        document.getElementById('information').innerHTML = ""
        var pos = getXY(canvas, e)
        boundingBoxes.forEach(function (d) {
            if ((pos.x < (d.x + d.width)) && ((pos.x > d.x))) {
                if ((pos.y < (d.y + d.height)) && ((pos.y > d.y))) {
                    // document.getElementById('information').innerHTML = (d.name + " " + d.description)
                }
            }
        })
    })
}