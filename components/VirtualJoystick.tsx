import React, { useRef, useState } from 'react';

// Outer ring size (w-24) and white knob size (w-10), in px. The knob can
// travel from the centre of the ring to the edge of the ring minus its own
// radius, so maxTravel is how far from centre the knob's middle may go.
const BASE_SIZE = 96;
const KNOB_SIZE = 40;
const MAX_TRAVEL = (BASE_SIZE - KNOB_SIZE) / 2;

// Fraction of MAX_TRAVEL the knob must pass before it counts as a push.
// Stops small thumb wobbles from walking the cat around or jumping.
const DEAD_ZONE = 0.25;

type JoystickDirection = -1 | 0 | 1;

interface VirtualJoystickProps {
  label: string;
  onDirectionChange: (direction: JoystickDirection) => void;
  onJump: () => void;
}

// On-screen joystick for the cat game. Pushing left or right moves the cat,
// and pushing up jumps. A jump fires once per push: holding the knob up
// doesn't keep jumping, you have to let go and push up again. Pointer
// capture keeps the drag alive even when the finger slides off the ring.
const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ label, onDirectionChange, onJump }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const pushingUp = useRef(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const updateFromPointer = (clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    const scale = distance > MAX_TRAVEL ? MAX_TRAVEL / distance : 1;
    const x = dx * scale;
    const y = dy * scale;
    setKnob({ x, y });

    const normalizedX = x / MAX_TRAVEL;
    let direction: JoystickDirection = 0;
    if (normalizedX <= -DEAD_ZONE) direction = -1;
    else if (normalizedX >= DEAD_ZONE) direction = 1;
    onDirectionChange(direction);

    // Screen y grows downward, so pushing up means a negative y.
    const isPushingUp = y / MAX_TRAVEL <= -DEAD_ZONE;
    if (isPushingUp && !pushingUp.current) onJump();
    pushingUp.current = isPushingUp;
  };

  const release = () => {
    activePointer.current = null;
    pushingUp.current = false;
    setKnob({ x: 0, y: 0 });
    onDirectionChange(0);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    activePointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== e.pointerId) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== e.pointerId) return;
    release();
  };

  return (
    <div
      ref={baseRef}
      role="group"
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={release}
      className="relative shrink-0 rounded-full bg-[#3d405b]/60 border-2 border-[#81b29a] shadow-md select-none"
      style={{ width: BASE_SIZE, height: BASE_SIZE, touchAction: 'none' }}
    >
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 rounded-full bg-white/90 shadow-lg pointer-events-none"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        }}
      />
    </div>
  );
};

export default VirtualJoystick;
