"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DICE_TYPES } from "./Die3DCanvas";
import SingleDie from "./SingleDie";
import ModuleHeader from "../ModuleHeader.js/ModuleHeader";
import "./Dice.css";
import { useSession, MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession";

import { MODULE_DEFINITIONS } from '@/module_definitions/module_definitions';

//Find next auto-incrementing ID for the dice array
function findNextDieId(dice){
  return dice.reduce((maxId, die) => Math.max(maxId, die.id), 0) + 1;
}

export default function Dice({ id, onRemove, onSettings, onReady }) {

  const [data, setData] = useSession(
    `${MODULE_SESSION_PREFIX}${id}`,
    MODULE_DEFINITIONS.dice.defaultData
  )

  const dice = Array.isArray(data.dice) ? data.dice : [];

  const containerRef = useRef(null);
  const [diceScale, setDiceScale] = useState(1);
  const scaleTimerRef = useRef(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const scale = Math.min(width / 250, height / 200);
      const clamped = Math.max(0.5, Math.min(scale, 2.5));
      // CSS variable updates instantly (no re-render needed)
      el.style.setProperty('--dice-scale', clamped);
      // Debounce the state update that resizes 3D canvases
      clearTimeout(scaleTimerRef.current);
      scaleTimerRef.current = setTimeout(() => setDiceScale(clamped), 150);
    });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(scaleTimerRef.current); };
  }, []);

  const [rolling, setRolling] = useState(false);
  const [rollTrigger, setRollTrigger] = useState(0);
  const rollTimers = useRef([]);

  const [editingModifier, setEditingModifier] = useState(false);
  const [modifierDraft, setModifierDraft] = useState("");

  const [displayTotal, setDisplayTotal] = useState(null); // null = use live total
  const [modPhase, setModPhase] = useState('idle');        // 'idle' | 'flying' | 'impact'
  const [impactKey, setImpactKey] = useState(0);
  const modTimers = useRef([]);

  const [finalValues, setFinalValues] = useState({});
  const hasReportedReadyRef = useRef(false);

  const modifier = data.modifier ?? 0;
  const diceColors = data.diceColors ?? {};
  const diceSum = dice.reduce((sum, d) => sum + d.value, 0);
  const total = diceSum + modifier;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => rollTimers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (hasReportedReadyRef.current) return;

    hasReportedReadyRef.current = true;
    onReady?.();
  }, []);

  function runModAnimation(sum) {
    modTimers.current.forEach(clearTimeout);
    modTimers.current = [];
    setDisplayTotal(sum);
    setModPhase('idle');
    const t1 = setTimeout(() => setModPhase('flying'), 100);
    const t2 = setTimeout(() => {
      setDisplayTotal(null);
      setModPhase('impact');
      setImpactKey((k) => k + 1);
    }, 520);
    const t3 = setTimeout(() => setModPhase('idle'), 900);
    modTimers.current = [t1, t2, t3];
  }

  // Smash animation: mod flies in and collides with the total after rolling
  useEffect(() => {
    modTimers.current.forEach(clearTimeout);
    modTimers.current = [];
    if (rolling) {
      setDisplayTotal(null);
      setModPhase('idle');
      return;
    }
    if (dice.length > 0 && modifier !== 0) {
      runModAnimation(diceSum);
    } else {
      setDisplayTotal(null);
      setModPhase('idle');
    }
    return () => modTimers.current.forEach(clearTimeout);
  }, [rolling, modifier, dice.length, diceSum]);

  // Re-run animation when modifier changes outside of a roll
  const prevModifier = useRef(null);
  useEffect(() => {
    if (prevModifier.current === null) { prevModifier.current = modifier; return; }
    if (prevModifier.current === modifier) return;
    prevModifier.current = modifier;
    if (!rolling && dice.length > 0 && modifier !== 0) {
      runModAnimation(diceSum);
    } else {
      modTimers.current.forEach(clearTimeout);
      setDisplayTotal(null);
      setModPhase('idle');
    }
  }, [modifier, rolling, dice.length, diceSum]);

  const addDie = (type) => {
    const config = DICE_TYPES[type];
    setData({ ...data, dice: [
      ...data.dice,
      {
        id: findNextDieId(data.dice),
        type,
        value: Math.floor(Math.random() * config.sides) + 1,
      },
    ] });
  };

  const removeDie = (id) => {
    setData({ ...data, dice: data.dice.filter((d) => d.id !== id) });
  };

  const rollAll = useCallback(() => {
    if (data.dice.length === 0 || rolling) return;

    // Decide ALL final values upfront
    const newFinals = {};
    data.dice.forEach((d) => {
      const config = DICE_TYPES[d.type];
      newFinals[d.id] = Math.floor(Math.random() * config.sides) + 1;
    });
    setFinalValues(newFinals);

    setRolling(true);
    setRollTrigger((t) => t + 1);

    // Rapidly cycle displayed values for visual effect
    const cycleInterval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        dice: (prev.dice || []).map((d) => {
          const config = DICE_TYPES[d.type];
          return {
            ...d,
            value: Math.floor(Math.random() * config.sides) + 1,
          };
        }),
      }));
    }, 100);

    // Stop cycling and lock in the pre-determined finals
    const stopTimer = setTimeout(() => {
      clearInterval(cycleInterval);
      setData((prev) => ({
        ...prev,
        dice: (prev.dice || []).map((d) => ({
          ...d,
          value: newFinals[d.id] ?? d.value,
        })),
      }));
      setRolling(false);
    }, 1300);

    rollTimers.current = [cycleInterval, stopTimer];
  }, [data.dice, rolling, setData]);

  const clearAll = () => {
    rollTimers.current.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    setData({ ...data, dice: [], modifier: 0 });
    setRolling(false);
    setFinalValues({});
  };

  function handleModifierClick() {
    setModifierDraft(modifier === 0 ? "" : String(modifier));
    setEditingModifier(true);
  }

  function handleModifierSubmit() {
    const parsed = parseInt(modifierDraft, 10);
    setData({ ...data, modifier: isNaN(parsed) ? 0 : parsed });
    setEditingModifier(false);
  }

  return (
    <div className="dice" ref={containerRef}>
      <ModuleHeader
        title={data.title}
        onTitleChange={(newTitle) => setData({ ...data, title: newTitle })}
        onRemove={() => onRemove(id)}
        onSettings={() => onSettings(id)}
        onReset={clearAll}
      />

      {/* Add Dice Toolbar */}
      <div className="dice-toolbar">
        {Object.entries(DICE_TYPES).map(([type, config]) => {
          const btnColor = diceColors[type] ?? config.color;
          return (
          <button
            key={type}
            onClick={() => addDie(type)}
            disabled={rolling}
            className="dice-toolbar__btn"
            style={{
              color: btnColor,
              borderColor: btnColor,
            }}
          >
            <span className="dice-toolbar__plus">+</span>
            {config.label}
          </button>
          );
        })}
      </div>

      {/* Dice Tray */}
      <div className="dice-tray">
        {dice.length === 0 ? (
          <p className="dice-tray__empty">Add dice using the buttons above</p>
        ) : (
          dice.map((die) => (
            <SingleDie
              key={die.id}
              die={die}
              onRemove={removeDie}
              rolling={rolling}
              rollTrigger={rollTrigger}
              finalValue={finalValues[die.id]}
              color={diceColors[die.type] ?? null}
              scale={diceScale}
              count={dice.length}
            />
          ))
        )}
      </div>

      {/* Bottom Bar */}
      <div className="dice-bottom">
        <div className="dice-total">
          <span className="dice-total__label">Total</span>
          <div className="dice-total__number-wrap">
            {modPhase === 'flying' && (
              <span className={`dice-total__mod-fly ${modifier >= 0 ? 'dice-total__mod-fly--pos' : 'dice-total__mod-fly--neg'}`}>
                {modifier > 0 ? `+${modifier}` : modifier}
              </span>
            )}
            <span key={impactKey} className={`dice-total__value${modPhase === 'impact' ? ' dice-total__value--impact' : ''}`}>
              {dice.length > 0 ? (displayTotal ?? total) : "—"}
            </span>
          </div>
        </div>

        <div className="dice-modifier">
          <span className="dice-modifier__label">Mod</span>
          {editingModifier ? (
            <input
              className="dice-modifier__input"
              type="text"
              inputMode="numeric"
              value={modifierDraft}
              autoFocus
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || v === "-" || /^-?\d+$/.test(v)) setModifierDraft(v);
              }}
              onBlur={handleModifierSubmit}
              onKeyDown={(e) => { if (e.key === "Enter") handleModifierSubmit(); }}
            />
          ) : (
            <span className="dice-modifier__value" onClick={handleModifierClick} title="Click to edit">
              {modifier === 0 ? "±" : modifier > 0 ? `+${modifier}` : modifier}
            </span>
          )}
        </div>

        <div className="dice-actions">
          {dice.length > 0 && (
            <button
              onClick={clearAll}
              disabled={rolling}
              className="dice-actions__clear"
            >
              Clear
            </button>
          )}
          <button
            onClick={rollAll}
            disabled={rolling || dice.length === 0}
            className="dice-actions__roll"
          >
            {rolling ? "Rolling..." : "Roll All"}
          </button>
        </div>
      </div>
    </div>
  );
}