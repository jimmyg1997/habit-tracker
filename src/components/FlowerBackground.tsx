import { useEffect, useRef } from 'react';

type FlowerType = 'sunflower' | 'poppy' | 'peony' | 'hibiscus' | 'magnolia';

interface Flower {
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  baseX: number;
  baseY: number;
  pulsePhase: number;
  bloomPhase: number; // Phase for blooming animation (0 = closed bud, 1 = fully open)
  type: FlowerType; // Type of flower
}

export default function FlowerBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flowersRef = useRef<Flower[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initFlowers();
    };

    const initFlowers = () => {
      const flowers: Flower[] = [];
      // Create 2-3 big flowers
      const flowerCount = 3;
      
      const flowerTypes: FlowerType[] = ['sunflower', 'poppy', 'peony', 'hibiscus', 'magnolia'];
      const colorRanges: Record<FlowerType, { hue: number; hueRange: number; sat: number; satRange: number; light: number; lightRange: number }> = {
        sunflower: { hue: 45, hueRange: 15, sat: 75, satRange: 15, light: 70, lightRange: 15 }, // Bright yellow/orange
        poppy: { hue: 5, hueRange: 30, sat: 80, satRange: 15, light: 60, lightRange: 15 }, // Red/orange
        peony: { hue: 330, hueRange: 40, sat: 70, satRange: 20, light: 70, lightRange: 20 }, // Pink/rose
        hibiscus: { hue: 350, hueRange: 50, sat: 75, satRange: 20, light: 65, lightRange: 20 }, // Pink/red/coral
        magnolia: { hue: 320, hueRange: 30, sat: 50, satRange: 20, light: 85, lightRange: 10 }, // Light pink/white
      };
      
      for (let i = 0; i < flowerCount; i++) {
        const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
        const colorRange = colorRanges[type];
        flowers.push({
          x: (canvas.width / (flowerCount + 1)) * (i + 1) + (Math.random() - 0.5) * 200,
          y: canvas.height * 0.7 + (Math.random() - 0.5) * 200, // Position lower on screen (near bottom)
          size: 120 + Math.random() * 100, // Much bigger flowers (120-220px)
          rotation: Math.random() * Math.PI * 2,
          color: `hsl(${colorRange.hue + (Math.random() - 0.5) * colorRange.hueRange}, ${colorRange.sat + (Math.random() - 0.5) * colorRange.satRange}%, ${colorRange.light + (Math.random() - 0.5) * colorRange.lightRange}%)`,
          baseX: 0,
          baseY: 0,
          pulsePhase: Math.random() * Math.PI * 2,
          bloomPhase: Math.random() * Math.PI * 2, // Random starting phase for blooming
          type: type,
        });
      }
      
      flowers.forEach((flower) => {
        flower.baseX = flower.x;
        flower.baseY = flower.y;
      });
      
      flowersRef.current = flowers;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;

    const drawFlower = (x: number, y: number, size: number, rotation: number, color: string, pulse: number = 1, bloom: number = 0, type: FlowerType = 'sunflower') => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      const currentSize = size * pulse;
      
      // Professional easing function for natural blooming
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const bloomEase = easeInOutQuad(bloom);
      
      // Draw stem first (grows from bottom upward)
      const stemHeight = currentSize * (0.4 + bloomEase * 0.6); // Stem grows as flower blooms
      const stemWidth = currentSize * 0.025;
      
      // Professional stem with subtle curve
      ctx.save();
      ctx.strokeStyle = '#2F4F2F';
      ctx.lineWidth = stemWidth * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(0, stemHeight);
      // Slight curve for natural look
      const curveX = Math.sin(rotation) * stemWidth * 2;
      ctx.quadraticCurveTo(curveX, stemHeight * 0.5, 0, 0);
      ctx.stroke();
      
      // Add stem gradient fill
      const stemGradient = ctx.createLinearGradient(0, 0, 0, stemHeight);
      stemGradient.addColorStop(0, '#4A7C4A'); // Lighter green at top
      stemGradient.addColorStop(0.5, '#3A6B3A');
      stemGradient.addColorStop(1, '#2F4F2F'); // Darker green at bottom
      ctx.strokeStyle = stemGradient;
      ctx.lineWidth = stemWidth * 1.5;
      ctx.stroke();
      ctx.restore();
      
      // Draw flower at top of stem (blooms upward)
      ctx.translate(0, -stemHeight * 0.1); // Slight offset for natural look
      
      switch (type) {
        case 'sunflower':
          drawSunflower(ctx, currentSize, color, bloomEase);
          break;
        case 'poppy':
          drawPoppy(ctx, currentSize, color, bloomEase);
          break;
        case 'peony':
          drawPeony(ctx, currentSize, color, bloomEase);
          break;
        case 'hibiscus':
          drawHibiscus(ctx, currentSize, color, bloomEase);
          break;
        case 'magnolia':
          drawMagnolia(ctx, currentSize, color, bloomEase);
          break;
      }
      
      ctx.restore();
    };

    // Professional petal drawing function with realistic curves
    const drawPetal = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      length: number,
      angle: number,
      color: string,
      bloom: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Create realistic petal shape with bezier curves
      const petalCurve = bloom * 0.3; // Curvature increases as it blooms
      const tipX = 0;
      const tipY = -length;
      const baseY = 0;
      
      // Professional gradient for petal
      const gradient = ctx.createLinearGradient(0, baseY, 0, tipY);
      gradient.addColorStop(0, color.replace('%)', '%, 0.9)')); // Base slightly transparent
      gradient.addColorStop(0.3, color);
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, color.replace('%)', '%, 0.4)')); // Tip more transparent
      
      ctx.beginPath();
      // Draw petal with bezier curve for natural shape
      ctx.moveTo(0, baseY);
      ctx.bezierCurveTo(
        -width * 0.6, -length * 0.3,
        -width * 0.8, -length * 0.7,
        tipX - width * 0.3, tipY
      );
      ctx.bezierCurveTo(
        tipX, tipY - length * 0.1,
        tipX + width * 0.3, tipY,
        tipX + width * 0.8, -length * 0.7
      );
      ctx.bezierCurveTo(
        tipX + width * 0.6, -length * 0.3,
        0, baseY,
        0, baseY
      );
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add subtle highlight
      ctx.globalCompositeOperation = 'overlay';
      const highlightGradient = ctx.createLinearGradient(0, baseY, 0, tipY);
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      highlightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.fill();
      
      ctx.restore();
    };

    const drawSunflower = (ctx: CanvasRenderingContext2D, size: number, color: string, bloom: number) => {
      // Sunflower: many long petals around large center
      const petals = 20;
      const baseY = size * 0.15;
      const petalLength = size * (0.2 + bloom * 0.5);
      const petalWidth = size * (0.04 + bloom * 0.12);
      const petalDistance = size * (0.12 + bloom * 0.35);
      
      for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 * i) / petals;
        const petalRotation = angle + (1 - bloom) * 0.4;
        const petalX = Math.cos(angle) * petalDistance;
        const petalY = baseY - size * bloom * 0.1;
        
        drawPetal(ctx, petalX, petalY, petalWidth, petalLength, petalRotation, color, bloom);
      }
      
      // Large dark brown center with texture
      const centerY = baseY - size * bloom * 0.2;
      const centerSize = size * (0.12 + bloom * 0.28);
      
      // Outer ring
      const outerGradient = ctx.createRadialGradient(0, centerY, 0, 0, centerY, centerSize);
      outerGradient.addColorStop(0, bloom < 0.3 ? '#90EE90' : '#8B4513');
      outerGradient.addColorStop(0.7, bloom < 0.3 ? '#5F9F5F' : '#654321');
      outerGradient.addColorStop(1, bloom < 0.3 ? '#3A5F3A' : '#4A2C1A');
      ctx.beginPath();
      ctx.arc(0, centerY, centerSize, 0, Math.PI * 2);
      ctx.fillStyle = outerGradient;
      ctx.fill();
      
      // Inner texture dots
      if (bloom > 0.3) {
        ctx.fillStyle = '#654321';
        for (let i = 0; i < 8; i++) {
          const dotAngle = (Math.PI * 2 * i) / 8;
          const dotX = Math.cos(dotAngle) * centerSize * 0.5;
          const dotY = centerY + Math.sin(dotAngle) * centerSize * 0.5;
          ctx.beginPath();
          ctx.arc(dotX, dotY, centerSize * 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawPoppy = (ctx: CanvasRenderingContext2D, size: number, color: string, bloom: number) => {
      // Poppy: 4-6 large, delicate, ruffled petals
      const petals = 4 + Math.floor(bloom * 2);
      const baseY = size * 0.15;
      const petalLength = size * (0.25 + bloom * 0.55);
      const petalWidth = size * (0.15 + bloom * 0.3);
      const petalDistance = size * (0.1 + bloom * 0.4);
      
      for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 * i) / petals;
        const petalRotation = angle + (1 - bloom) * 0.5;
        const petalX = Math.cos(angle) * petalDistance;
        const petalY = baseY - size * bloom * 0.15;
        
        // Poppy petals are more ruffled
        ctx.save();
        ctx.translate(petalX, petalY);
        ctx.rotate(petalRotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, -petalLength * 0.3, petalLength);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(0.8, color.replace('%)', '%, 0.6)'));
        gradient.addColorStop(1, color.replace('%)', '%, 0.2)'));
        
        // Ruffled petal shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let j = 0; j <= 20; j++) {
          const t = j / 20;
          const y = -petalLength * t;
          const x = Math.sin(t * Math.PI * 3) * petalWidth * 0.3 * (1 - t) + 
                    Math.sin(t * Math.PI) * petalWidth * (1 - t * 0.5);
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(0, -petalLength);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      }
      
      // Dark center with stamen
      const centerY = baseY - size * bloom * 0.25;
      const centerSize = size * (0.08 + bloom * 0.16);
      const centerGradient = ctx.createRadialGradient(0, centerY, 0, 0, centerY, centerSize);
      centerGradient.addColorStop(0, bloom < 0.3 ? '#2F4F2F' : '#000000');
      centerGradient.addColorStop(0.6, bloom < 0.3 ? '#1C3A1C' : '#1a1a1a');
      centerGradient.addColorStop(1, bloom < 0.3 ? '#0F1F0F' : '#0a0a0a');
      ctx.beginPath();
      ctx.arc(0, centerY, centerSize, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();
    };

    const drawPeony = (ctx: CanvasRenderingContext2D, size: number, color: string, bloom: number) => {
      // Peony: many layered, ruffled petals with depth
      const baseY = size * 0.15;
      const layers = 3;
      
      for (let layer = 0; layer < layers; layer++) {
        const layerBloom = Math.max(0, (bloom - layer * 0.12) / (1 - layer * 0.12));
        if (layerBloom <= 0) continue;
        
        const layerSize = size * (0.5 + layer * 0.15);
        const petals = 6 + layer * 2;
        const petalLength = layerSize * (0.2 + layerBloom * 0.45);
        const petalWidth = layerSize * (0.12 + layerBloom * 0.25);
        const petalDistance = layerSize * (0.12 + layerBloom * 0.35);
        const layerY = baseY - size * bloom * 0.1 - layer * size * 0.05;
        
        for (let i = 0; i < petals; i++) {
          const angle = (Math.PI * 2 * i) / petals + layer * 0.25;
          const petalRotation = angle + (1 - layerBloom) * 0.5;
          const petalX = Math.cos(angle) * petalDistance;
          const petalY = layerY;
          
          drawPetal(ctx, petalX, petalY, petalWidth, petalLength, petalRotation, color, layerBloom);
        }
      }
      
      // Peony center with depth
      const centerY = baseY - size * bloom * 0.25;
      const centerSize = size * (0.1 + bloom * 0.2);
      const centerGradient = ctx.createRadialGradient(0, centerY, 0, 0, centerY, centerSize);
      centerGradient.addColorStop(0, bloom < 0.3 ? '#2F4F2F' : '#FFD700');
      centerGradient.addColorStop(0.5, bloom < 0.3 ? '#1C3A1C' : '#FFA500');
      centerGradient.addColorStop(1, bloom < 0.3 ? '#0F1F0F' : '#FF8C00');
      ctx.beginPath();
      ctx.arc(0, centerY, centerSize, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();
    };

    const drawHibiscus = (ctx: CanvasRenderingContext2D, size: number, color: string, bloom: number) => {
      // Hibiscus: 5 large, trumpet-like overlapping petals
      const baseY = size * 0.15;
      const petals = 5;
      const petalLength = size * (0.3 + bloom * 0.6);
      const petalWidth = size * (0.18 + bloom * 0.28);
      const petalDistance = size * (0.12 + bloom * 0.4);
      
      for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 * i) / petals;
        const petalRotation = angle + (1 - bloom) * 0.4;
        const petalX = Math.cos(angle) * petalDistance;
        const petalY = baseY - size * bloom * 0.12;
        
        // Hibiscus petals are wider and more trumpet-shaped
        ctx.save();
        ctx.translate(petalX, petalY);
        ctx.rotate(petalRotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, -petalLength * 0.4, petalLength);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(0.7, color.replace('%)', '%, 0.7)'));
        gradient.addColorStop(1, color.replace('%)', '%, 0.3)'));
        
        // Trumpet-shaped petal
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-petalWidth * 0.5, -petalLength * 0.2, -petalWidth * 0.7, -petalLength * 0.6, -petalWidth * 0.4, -petalLength);
        ctx.bezierCurveTo(0, -petalLength * 1.1, petalWidth * 0.4, -petalLength, petalWidth * 0.7, -petalLength * 0.6);
        ctx.bezierCurveTo(petalWidth * 0.5, -petalLength * 0.2, 0, 0, 0, 0);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      }
      
      // Long stamen in center
      const centerY = baseY - size * bloom * 0.2;
      const stamenLength = size * (0.1 + bloom * 0.25);
      const stamenGradient = ctx.createLinearGradient(0, centerY - stamenLength, 0, centerY + stamenLength);
      stamenGradient.addColorStop(0, '#FFD700');
      stamenGradient.addColorStop(0.5, '#FFA500');
      stamenGradient.addColorStop(1, '#FF8C00');
      ctx.beginPath();
      ctx.ellipse(0, centerY, size * 0.025, stamenLength, 0, 0, Math.PI * 2);
      ctx.fillStyle = stamenGradient;
      ctx.fill();
      
      // Center dot
      const centerSize = size * (0.06 + bloom * 0.12);
      ctx.beginPath();
      ctx.arc(0, centerY, centerSize, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
    };

    const drawMagnolia = (ctx: CanvasRenderingContext2D, size: number, color: string, bloom: number) => {
      // Magnolia: 6-9 large, elegant, teardrop-shaped petals
      const baseY = size * 0.15;
      const petals = 6 + Math.floor(bloom * 3);
      const petalLength = size * (0.28 + bloom * 0.55);
      const petalWidth = size * (0.16 + bloom * 0.3);
      const petalDistance = size * (0.1 + bloom * 0.4);
      
      for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 * i) / petals;
        const petalRotation = angle + (1 - bloom) * 0.4;
        const petalX = Math.cos(angle) * petalDistance;
        const petalY = baseY - size * bloom * 0.15;
        
        // Magnolia petals are elegant and teardrop-shaped
        ctx.save();
        ctx.translate(petalX, petalY);
        ctx.rotate(petalRotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, -petalLength * 0.3, petalLength);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(0.8, color.replace('%)', '%, 0.5)'));
        gradient.addColorStop(1, color.replace('%)', '%, 0.2)'));
        
        // Teardrop petal shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-petalWidth * 0.4, -petalLength * 0.2, -petalWidth * 0.5, -petalLength * 0.6, 0, -petalLength);
        ctx.bezierCurveTo(petalWidth * 0.5, -petalLength * 0.6, petalWidth * 0.4, -petalLength * 0.2, 0, 0);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      }
      
      // Magnolia center
      const centerY = baseY - size * bloom * 0.25;
      const centerSize = size * (0.08 + bloom * 0.16);
      const centerGradient = ctx.createRadialGradient(0, centerY, 0, 0, centerY, centerSize);
      centerGradient.addColorStop(0, bloom < 0.3 ? '#2F4F2F' : '#FFD700');
      centerGradient.addColorStop(0.6, bloom < 0.3 ? '#1C3A1C' : '#90EE90');
      centerGradient.addColorStop(1, bloom < 0.3 ? '#0F1F0F' : '#7CCD7C');
      ctx.beginPath();
      ctx.arc(0, centerY, centerSize, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();
    };

    const animate = () => {
      time += 0.002; // Slow but noticeable time increment
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const flowers = flowersRef.current;
      
      flowers.forEach((flower, index) => {
        // Gentle floating - slow but visible movement
        const floatX = Math.sin(time * 0.1 + index * 2) * 15; // Slow but noticeable horizontal movement
        const floatY = Math.cos(time * 0.12 + index * 2) * 12; // Slow but noticeable vertical movement
        
        // Simple slow floating movement - no mouse interaction
        flower.x += (flower.baseX + floatX - flower.x) * 0.02; // Smooth but visible movement
        flower.y += (flower.baseY + floatY - flower.y) * 0.02; // Smooth but visible movement
        
        // Update base position for continuous floating
        flower.baseX += floatX * 0.01; // Slow base movement
        flower.baseY += floatY * 0.01; // Slow base movement
        
        // Wrap around edges
        if (flower.x < -150) flower.x = canvas.width + 150;
        if (flower.x > canvas.width + 150) flower.x = -150;
        if (flower.y < -150) flower.y = canvas.height + 150;
        if (flower.y > canvas.height + 150) flower.y = -150;
        
        // Update base positions when wrapping
        if (Math.abs(flower.x - flower.baseX) > canvas.width) {
          flower.baseX = flower.x;
        }
        if (Math.abs(flower.y - flower.baseY) > canvas.height) {
          flower.baseY = flower.y;
        }
        
        // Rotation - slow but visible
        flower.rotation += 0.001; // Slow but noticeable rotation
        
        // Pulsing effect - slow but visible
        flower.pulsePhase += 0.01; // Slow but noticeable pulse
        const pulse = 1 + Math.sin(flower.pulsePhase) * 0.05; // Subtle but visible pulse
        
        // Blooming animation - faster cycle (bud → open → bud)
        flower.bloomPhase += 0.008; // Faster blooming cycle (takes ~13 minutes for full cycle)
        const bloom = (Math.sin(flower.bloomPhase) + 1) / 2; // 0 to 1, cycles (0 = closed bud, 1 = fully open)
        
        // Draw flower with subtle shadow
        ctx.save();
        ctx.shadowColor = flower.color.replace('%)', '%, 0.2)');
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        drawFlower(flower.x, flower.y, flower.size, flower.rotation, flower.color, pulse, bloom, flower.type);
        ctx.restore();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-12"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
