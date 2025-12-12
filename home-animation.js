/**
 * Square Tipping Physics - Scroll Speed Based
 * Scroll speed pushes UP, gravity always pulls DOWN
 * No scroll = gravity wins = square mode (□)
 * 
 * Works with multiple elements:
 * - #return-to-home (project page)
 * - .square (landing page)
 */

(function() {
    'use strict';

    // Try to find the element - check multiple selectors
    let targetElement = null;
    
    // Try different selectors in order
    const selectors = [
        '#return-to-home',           // Project page
        '.square',                   // Landing page
        '#logo-square',              // Alternative
        '.rotating-square'           // Alternative
    ];
    
    for (let selector of selectors) {
        targetElement = document.querySelector(selector);
        if (targetElement) {
            console.log(`✅ Found element: ${selector}`);
            break;
        }
    }
    
    if (!targetElement) {
        console.warn('⚠️ No rotating element found. Tried:', selectors.join(', '));
        return;
    }
    
    // Use the found element
    const returnToHome = targetElement;

    // ========================================
    // 🎛️ EASY ADJUSTMENT SETTINGS
    // ========================================
    
    const SETTINGS = {
        // Push UP force (how much scroll speed pushes toward diamond ◇)
        // Higher = easier to reach diamond with slower scrolling
        scrollForceMultiplier: 0.5,     // Default: 2.5 (try 1.0-5.0)
        
        // Gravity DOWN pull (pulls back to square □)
        // Uses Earth's gravity: 9.8 m/s²
        gravityMultiplier: 0.4,         // Default: 0.8 (try 0.5-1.5)
        
        // Scroll velocity decay (how quickly scroll force fades)
        scrollDecay: 0.4,              // Default: 0.85 (lower = fades faster)
        
        // Friction (overall damping)
        friction: 0.75                  // Default: 0.92 (lower = stops faster)
    };
    
    // Earth's gravitational acceleration (m/s²)
    const EARTH_GRAVITY = 1.8;
    
    // ========================================
    // Physics State
    // ========================================
    
    let currentRotation = 0;            // Current angle in degrees
    let angularVelocity = 0;            // Rotation speed
    let scrollVelocity = 0;             // Current scroll speed
    let lastScrollY = 0;
    let lastScrollTime = Date.now();
    
    // Setup
    returnToHome.style.transformOrigin = 'center center';
    returnToHome.style.willChange = 'transform';

    /**
     * Handle scroll - captures scroll velocity
     */
    window.addEventListener('scroll', function() {
        const scrollY = window.pageYOffset;
        const currentTime = Date.now();
        
        const scrollDelta = scrollY - lastScrollY;
        const timeDelta = currentTime - lastScrollTime;
        
        // Calculate scroll velocity (pixels per millisecond)
        if (timeDelta > 0) {
            const instantVelocity = scrollDelta / timeDelta;
            scrollVelocity = instantVelocity * SETTINGS.scrollForceMultiplier;
        }
        
        lastScrollY = scrollY;
        lastScrollTime = currentTime;
        
    }, { passive: true });

    /**
     * Physics simulation
     */
    function simulate() {
        // Normalize rotation to 0-360 range
        let normalizedRotation = ((currentRotation % 360) + 360) % 360;
        
        // Find position within current 90° quadrant (0° = square, 45° = diamond)
        const quadrantPosition = normalizedRotation % 90;
        
        // === SNAP TO GROUND (prevents wiggling) ===
        // If we're very close to a square position and moving slowly, SNAP to it
        const distanceFromSquare = quadrantPosition < 45 
            ? quadrantPosition           // Distance from 0°
            : 90 - quadrantPosition;     // Distance from 90°
        
        const isNearSquare = distanceFromSquare < 3;  // Within 3° of square
        const isMovingSlowly = Math.abs(angularVelocity) < 0.5;
        
        if (isNearSquare && isMovingSlowly && Math.abs(scrollVelocity) < 0.1) {
            // SNAP to nearest square position (thud on ground!)
            const nearestSquare = Math.round(currentRotation / 90) * 90;
            currentRotation = nearestSquare;
            angularVelocity = 0;
            scrollVelocity = 0;
            return; // Skip rest of physics - it's locked on ground
        }
        
        // === PUSH FORCE (from scrolling) ===
        // Scroll velocity pushes the square UP toward diamond (45°)
        const pushForce = scrollVelocity;
        angularVelocity += pushForce;
        
        // Decay scroll velocity (it fades when you stop scrolling)
        scrollVelocity *= SETTINGS.scrollDecay;
        
        // === GRAVITY FORCE (always pulling DOWN) ===
        // Gravity always pulls toward the nearest square position (0°, 90°, 180°, 270°)
        // The further from square, the stronger the pull
        
        // Gravity is proportional to how far from square we are
        // At 45° (diamond), gravity is maximum
        const gravityStrength = (distanceFromSquare / 45); // 0 to 1
        
        // Direction: pull toward nearest square position
        const gravityDirection = quadrantPosition < 45 ? -1 : 1;
        
        // Apply Earth's gravity
        const gravityForce = EARTH_GRAVITY * SETTINGS.gravityMultiplier * gravityStrength * gravityDirection;
        angularVelocity += gravityForce;
        
        // === APPLY PHYSICS ===
        // Apply friction
        angularVelocity *= SETTINGS.friction;
        
        // Update rotation
        currentRotation += angularVelocity;
    }

    /**
     * Animation loop
     */
    function animate() {
        simulate();
        
        // Apply rotation
        returnToHome.style.transform = `rotate(${currentRotation}deg)`;
        
        requestAnimationFrame(animate);
    }

    // Start
    setTimeout(animate, 100);
    
    console.log('✅ Scroll-speed gravity rotation active');
    console.log(`⚙️ Settings:
    - Scroll force: ${SETTINGS.scrollForceMultiplier}
    - Gravity: ${SETTINGS.gravityMultiplier} × ${EARTH_GRAVITY} m/s²
    - Scroll decay: ${SETTINGS.scrollDecay}
    - Friction: ${SETTINGS.friction}
    `);

    // ========================================
    // 🎮 DEBUG CONTROLS (use in console)
    // ========================================
    
    window.squarePhysics = {
        // Get current state
        get rotation() { return currentRotation; },
        get velocity() { return angularVelocity; },
        get scrollVel() { return scrollVelocity; },
        
        // Adjust settings on the fly
        setScrollForce(value) {
            SETTINGS.scrollForceMultiplier = value;
            console.log(`📜 Scroll force multiplier: ${value}`);
        },
        
        setGravity(value) {
            SETTINGS.gravityMultiplier = value;
            console.log(`⬇️ Gravity: ${value} × ${EARTH_GRAVITY} = ${(value * EARTH_GRAVITY).toFixed(2)} m/s²`);
        },
        
        setScrollDecay(value) {
            SETTINGS.scrollDecay = value;
            console.log(`⏱️ Scroll decay: ${value}`);
        },
        
        setFriction(value) {
            SETTINGS.friction = value;
            console.log(`🌬️ Friction: ${value}`);
        },
        
        // Manual controls
        push(amount) {
            scrollVelocity += amount;
            console.log(`💨 Pushed: ${amount}`);
        },
        
        reset() {
            currentRotation = 0;
            angularVelocity = 0;
            scrollVelocity = 0;
            console.log('🔄 Reset');
        },
        
        settings: SETTINGS,
        
        help() {
            console.log(`
🎮 Scroll-Speed Physics Controls:

ADJUST FORCES:
squarePhysics.setScrollForce(3)    - Scroll push strength (default: 2.5)
squarePhysics.setGravity(1.0)      - Gravity pull strength (default: 0.8)
squarePhysics.setScrollDecay(0.9)  - How fast scroll fades (default: 0.85)
squarePhysics.setFriction(0.95)    - Overall friction (default: 0.92)

MANUAL:
squarePhysics.push(5)              - Simulate scroll push
squarePhysics.reset()              - Reset to square

STATE:
squarePhysics.rotation             - Current angle
squarePhysics.velocity             - Angular velocity
squarePhysics.scrollVel            - Scroll velocity

HOW IT WORKS:
- Scroll fast = pushes UP toward diamond ◇
- Stop scrolling = gravity pulls DOWN to square □
- Slow scroll = pushes a bit, then falls back

Current Settings:
- Scroll force: ${SETTINGS.scrollForceMultiplier}x
- Gravity: ${SETTINGS.gravityMultiplier} × ${EARTH_GRAVITY} = ${(SETTINGS.gravityMultiplier * EARTH_GRAVITY).toFixed(2)} m/s²
- Scroll decay: ${SETTINGS.scrollDecay}
- Friction: ${SETTINGS.friction}
            `);
        }
    };
    
    console.log('💡 Type squarePhysics.help() for controls');
    console.log('📜 Scroll down to push the square toward diamond!');

})();