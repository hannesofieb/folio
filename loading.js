setTimeout(() => {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}, 10000); // 10 seconds



// Animation of square
let sideLength = 100; // Length of the square's side
let angle = 0; // Current rotation angle
let x, y; // Position of the square's center
let pivotX, pivotY; // Current pivot point (the corner touching the ground)
let rolling = true; // Automatically start rolling
let rollSpeed = 1; // Speed of rolling
let gravity = 1; // Gravity effect on the square's roll

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('loading'); // Attach canvas to loading div
  rectMode(CENTER);
  angleMode(DEGREES);
  noStroke();

  // Initial square position (centered horizontally on the ground)
  x = width / 2.5;
  y = height /2; // Just above the bottom of the canvas

  // Initial pivot point (bottom-left corner of the square)
  pivotX = x - sideLength / 2;
  pivotY = y + sideLength / 2;
}
function draw() {
    clear(); // Clear the canvas to make the background transparent
  
    // Get CSS variable value
    let cssColour = getComputedStyle(document.documentElement).getPropertyValue('--pink').trim();
  
    if (rolling) {
      // Rolling logic
      angle += rollSpeed; // Rotate the square
      if (angle >= 45) {
        // When reaching diamond shape, accelerate with gravity
        rollSpeed += gravity;
      }
      if (angle >= 90) {
        // Finish one full rotation
        angle = 0; // Reset the angle
        rollSpeed = 1; // Reset roll speed
  
        // Update the center position to the next resting position
        x += sideLength; // Move forward by one square length
  
        // Update the pivot point for the next roll
        pivotX = x - sideLength / 2;
        pivotY = y + sideLength / 2;
  
        // Automatically continue rolling
        rolling = true;
      }
    }
  
    // Draw the square
    push();
    translate(pivotX, pivotY); // Move to the pivot point
    rotate(angle); // Rotate around the pivot
    fill(cssColour);
    rect(-sideLength / 2, -sideLength / 2, sideLength, sideLength);
    pop();
  }
  
  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }

