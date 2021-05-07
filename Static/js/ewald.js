window.onload = function() {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var thetaSlider = document.getElementById('theta');
    var dSlider = document.getElementById('d');
    var wavelengthSlider = document.getElementById('wavelength')

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


    width = canvas.width;
    height = canvas.height;

    const WAVELENGTH_FACTOR = 300
    const CENTER_POINT = {x: width/2, y:height/2} 

    var theta = 22;
    var d = 35;
    var wavelength = 4; 
    var inverseWavelength = (1/wavelength) * WAVELENGTH_FACTOR
    var radians;

    thetaSlider.oninput = function () {
        theta = parseFloat(this.value)
        document.getElementById('thetaValue').innerHTML = (String(this.value + " °"))
        update()
    }

    dSlider.oninput = function () {
        d = parseFloat(this.value)
        document.getElementById('dValue').innerHTML = (String(this.value + " Å"))
        update()
    }
    
    wavelengthSlider.oninput = function() {
        wavelength = parseFloat(this.value)
        document.getElementById('wavelengthValue').innerHTML = (String(this.value + " nm"))
        update()
    }

    function update() {
        ctx.clearRect(0,0,width,height)
        radians = theta * (Math.PI / 180) 
        draw_circle()
        draw_horizontal_lines()
        draw_angled_lines()

    }

    function draw_circle(){ 
        ctx.beginPath()
        ctx.arc(CENTER_POINT.x, CENTER_POINT.y, inverseWavelength, 0, Math.PI * 2)
        ctx.stroke()
    }

    function draw_horizontal_lines(){ 
    
        var left_edge = CENTER_POINT.x - inverseWavelength
        var right_edge = CENTER_POINT.x + inverseWavelengths

        ctx.beginPath()
        ctx.moveTo(left_edge, CENTER_POINT.y)
        ctx.lineTo(right_edge, CENTER_POINT.y)
        ctx.stroke()
    }

    function draw_angled_lines() { 

        var deltaX = inverseWavelength * Math.sin(2*radians)
        var deltaY = inverseWavelength * Math.cos(2*radians)

        ctx.beginPath()
        ctx.moveTo(CENTER_POINT.x,CENTER_POINT.y)
        ctx.lineTo(CENTER_POINT.x + deltaX, CENTER_POINT.y - deltaY)
        ctx.stroke()
    }
}