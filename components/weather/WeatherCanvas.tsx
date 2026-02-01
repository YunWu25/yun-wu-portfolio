import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useWeather } from './WeatherContext';
import RainEffect from './RainEffect';
import SnowEffect from './SnowEffect';
import SunEffect from './SunEffect';
import WindEffect from './WindEffect';
import FogEffect from './FogEffect';
import { WeatherDebug3D } from './WeatherDebug';

interface WeatherEffectsProps {
  debug?: boolean;
}

// Component that renders the appropriate weather effect
const WeatherEffects: React.FC<WeatherEffectsProps> = ({ debug = false }) => {
  const { weather } = useWeather();

  if (!weather.enabled || weather.type === 'clear') {
    return null;
  }

  return (
    <>
      {weather.type === 'rain' && <RainEffect />}
      {weather.type === 'snow' && <SnowEffect />}
      {weather.type === 'sunny' && <SunEffect />}
      {weather.type === 'windy' && <WindEffect />}
      {weather.type === 'foggy' && <FogEffect />}
      {debug && <WeatherDebug3D />}
    </>
  );
};

interface WeatherCanvasProps {
  debug?: boolean;
}

const WeatherCanvas: React.FC<WeatherCanvasProps> = ({ debug = false }) => {
  const { weather } = useWeather();

  // Don't render canvas if weather is disabled or clear
  if (!weather.enabled || weather.type === 'clear') {
    return null;
  }

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 10, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        events={() => ({ enabled: false, priority: 0 })}
      >
        <Suspense fallback={null}>
          <WeatherEffects debug={debug} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default WeatherCanvas;
