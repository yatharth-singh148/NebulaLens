import React, { useRef, useEffect, useCallback } from 'react';

// ---
// --- Configuration Variables ---
// ---
const STAR_COUNT = 800; // Number of static stars
const STAR_COLOR = 'rgba(255, 255, 255, 1)'; // Base color of static stars
const STAR_SIZE = 1; // Size of static stars in pixels
const TWINKLE_SPEED = 0.5; // How fast stars twinkle (lower is slower)

// --- MODIFIED: Speed is now in Pixels Per Second (PPS) ---
const SHOOTING_STAR_COUNT = 4; // Max number of shooting stars at any time
const SHOOTING_STAR_SPEED_PPS = 500; // Speed of shooting stars in Pixels Per Second
const SHOOTING_STAR_LENGTH = 100; // Length of shooting star trail
const SHOOTING_STAR_SPAWN_RATE = 0.005; // Chance per frame to spawn a star (0.005 = 0.5%)
const FADE_DURATION_MS = 1500; // Trail fades over 1.5 seconds
// ---

export default function StarryBackground() {
  const canvasRef = useRef(null);
  const staticStars = useRef([]);
  const shootingStars = useRef([]);
  const animationFrameId = useRef(null);
  const lastTime = useRef(0);

  // Memoize the draw function to prevent unnecessary re-creations
  const draw = useCallback((ctx, canvasWidth, canvasHeight, time) => {
    // Calculate delta time (time since last frame) in milliseconds
    const deltaTime = time - lastTime.current;
    lastTime.current = time;

    // ---
    // --- MODIFIED: Convert deltaTime from MS to Seconds for calculations
    // ---
    const deltaTimeInSeconds = deltaTime / 1000;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear canvas each frame

    // ---
    // --- 1. Draw Twinkling Static Stars (This logic was already correct) ---
    // ---
    staticStars.current.forEach(star => {
      const twinkle = Math.sin(star.twinkleOffset + time * (star.twinkleSpeed * TWINKLE_SPEED / 1000));
      const opacity = star.baseOpacity + twinkle * 0.3; // Adjust 0.3 to make twinkle more/less intense
      
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, opacity))})`;
      ctx.fillRect(star.x, star.y, STAR_SIZE, STAR_SIZE);
    });

    // ---
    // --- 2. Draw Shooting Stars (Using deltaTime) ---
    // ---
    shootingStars.current.forEach((sStar, index) => {
      // Draw the main body (head) of the shooting star
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Brighter head
      ctx.fillRect(sStar.x, sStar.y, STAR_SIZE * 2, STAR_SIZE * 2);

      // Draw the trail
      ctx.beginPath();
      ctx.moveTo(sStar.x + STAR_SIZE, sStar.y + STAR_SIZE); // Center of the head
      ctx.lineTo(sStar.x + STAR_SIZE - sStar.dx * SHOOTING_STAR_LENGTH, sStar.y + STAR_SIZE - sStar.dy * SHOOTING_STAR_LENGTH);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * (1 - sStar.progress)})`; // Fade trail
      ctx.lineWidth = STAR_SIZE * 1.5;
      ctx.stroke();

      // ---
      // --- MODIFIED: Update position based on deltaTime
      // ---
      const distanceThisFrame = SHOOTING_STAR_SPEED_PPS * deltaTimeInSeconds;
      sStar.x += sStar.dx * distanceThisFrame;
      sStar.y += sStar.dy * distanceThisFrame;
      
      // ---
      // --- MODIFIED: Update fade progress based on deltaTime
      // ---
      sStar.progress = Math.min(1, sStar.progress + (deltaTime / FADE_DURATION_MS));

      // Remove shooting star if it's far off-screen
      if (sStar.x < -500 || sStar.x > canvasWidth + 500 || sStar.y < -500 || sStar.y > canvasHeight + 500) {
        shootingStars.current.splice(index, 1);
      }
    });

    // ---
    // --- 3. Add a new shooting star ---
    // ---
    if (shootingStars.current.length < SHOOTING_STAR_COUNT && Math.random() < SHOOTING_STAR_SPAWN_RATE) { 
      let startX, startY, dx, dy;
      
      dx = 0.5 + Math.random() * 0.5;
      dy = 0.5 + Math.random() * 0.5;

      if (Math.random() < 0.5) {
        startX = Math.random() * canvasWidth;
        startY = 0;
      } else {
        startX = 0;
        startY = Math.random() * canvasHeight;
      }
      
      const magnitude = Math.sqrt(dx * dx + dy * dy);
      dx /= magnitude;
      dy /= magnitude;

      shootingStars.current.push({
        x: startX,
        y: startY,
        dx: dx,
        dy: dy,
        progress: 0, 
      });
    }

    // Request next frame
    animationFrameId.current = requestAnimationFrame((newTime) => draw(ctx, canvasWidth, canvasHeight, newTime));
  }, []); // Empty dependency array means 'draw' is created once

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // ---
      // --- Star Initialization (Now includes twinkle properties) ---
      // ---
      staticStars.current = Array.from({ length: STAR_COUNT }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseOpacity: 0.2 + Math.random() * 0.6, // Random base opacity (0.2 to 0.8)
        twinkleSpeed: 0.5 + Math.random() * 0.5, // Random speed multiplier
        twinkleOffset: Math.random() * Math.PI * 2, // Random start point in the sine wave
      }));
      
      // Immediately draw after resize to avoid blank screen
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      lastTime.current = performance.now();
      draw(ctx, canvas.width, canvas.height, lastTime.current); 
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial size and star generation

    // Start the animation loop
    animationFrameId.current = requestAnimationFrame((time) => draw(ctx, canvas.width, canvas.height, time));

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none" // Fixed position, behind content, not interactive
      style={{ backgroundColor: '#000000' }} // Ensures a black background
    ></canvas>
  );
}