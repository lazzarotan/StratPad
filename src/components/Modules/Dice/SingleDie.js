import { memo } from "react";
import Die3DCanvas from "./Die3DCanvas";
import { DICE_TYPES } from "./Die3DCanvas";

export default memo(function SingleDie({ die, onRemove, rolling, rollTrigger, finalValue, color, scale = 1, count = 1 }) {
  const config = DICE_TYPES[die.type];
  const activeColor = color ?? config.color;
  // Shrink dice as more are added: full size at 1-4, scales down, floors at 60%
  const countFactor = count <= 4 ? 1 : Math.max(0.6, 1 - (count - 4) * 0.08);
  const dieSize = Math.round(54 * scale * countFactor);

  return (
    <div className="single-die">
      {/* Remove button — visible on hover via CSS */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(die.id);
        }}
        className="die-remove-btn"
      >
        ×
      </button>

      {/* The 3D die */}
      <Die3DCanvas
        type={die.type}
        rolling={rolling}
        rollTrigger={rollTrigger}
        finalValue={finalValue}
        value={die.value}
        size={dieSize}
        color={activeColor}
      />

      {/* Numeric value beneath the die */}
      <span
        className="die-value"
        style={{ color: rolling ? "#94a3b8" : activeColor }}
      >
        {die.value}
      </span>

      {/* Type label */}
      <span className="die-label" style={{ color: activeColor }}>
        {config.label}
      </span>
    </div>
  );
}, (prev, next) => {
  return prev.die.id === next.die.id
    && prev.die.value === next.die.value
    && prev.die.type === next.die.type
    && prev.rolling === next.rolling
    && prev.rollTrigger === next.rollTrigger
    && prev.finalValue === next.finalValue
    && prev.color === next.color
    && prev.scale === next.scale
    && prev.count === next.count;
});
