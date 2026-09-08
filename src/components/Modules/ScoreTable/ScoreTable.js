"use client"
import { useState, useRef, useEffect } from 'react'
import { useSession, MODULE_SESSION_PREFIX } from "@/client_API_calls/session_storage/useSession"
import './ScoreTable.css'
import ModuleHeader from '../ModuleHeader.js/ModuleHeader'
import { MODULE_DEFINITIONS } from '@/module_definitions/module_definitions';
import AlertModal from '@/components/AlertModal/AlertModal';
import { useDashboardMode } from '@/components/Dashboard/DashboardMode/DashboardModeContext';

export default function ScoreTable({ id, onRemove, onSettings }) {
    // Persisted data
    const [data, setData] = useSession(
        MODULE_SESSION_PREFIX + id,
        MODULE_DEFINITIONS.scoreTable.defaultData
    );

    const { isPlayMode } = useDashboardMode();

    const containerRef = useRef(null);
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            const scale = Math.min(width / 300, height / 220);
            el.style.setProperty('--st-scale', Math.max(0.5, Math.min(scale, 2.5)));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // UI-only state (not persisted)
    const [modal, setModal] = useState({ open: false, title: '', message: '', confirmText: 'OK', cancelText: '', onConfirm: null })
    const closeModal = () => setModal(m => ({ ...m, open: false }))

    const [editingPlayer, setEditingPlayer] = useState(null)
    const [preEditName, setPreEditName] = useState("")
    const [editingRound, setEditingRound] = useState(null)
    const [editingCell, setEditingCell] = useState(null)
    const tableContainerRef = useRef(null)


    // Handle player name changes
    function handlePlayerNameChange(playerIndex, newName) {
        const updatedPlayers = data.players.map((player, index) =>
            index === playerIndex ? newName : player
        )
        setData({ ...data, players: updatedPlayers })
    }

    function handleScoreChange(playerIndex, roundIndex, newValue) {
        
        let scoreValue

        if (newValue === '' || newValue === '-') {
            scoreValue = null
        } else {
            const parsed = parseInt(newValue)
            if (isNaN(parsed)) return
            scoreValue = parsed
        }
        
        // Create a copy of the scores array
        const updatedScores = data.scores.map(playerScores => [...playerScores])
        
        // Update the specific score
        updatedScores[playerIndex][roundIndex] = scoreValue
        
        // Update state
        setData({ ...data, scores: updatedScores })

        // If all players have scores for this round, scroll to the next round
        const roundComplete = data.players.every((_, pIndex) => typeof updatedScores[pIndex][roundIndex] === 'number')
        if (roundComplete && roundIndex < updatedScores[0].length - 1) {
            setTimeout(() => {
                if (tableContainerRef.current) {
                    const roundRows = tableContainerRef.current.querySelectorAll('tbody tr:not(:last-child)')
                    if (roundRows[roundIndex + 1]) {
                        roundRows[roundIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                }
            }, 0)
        }
    }

    const MAX_PLAYERS = 10

    // Add a new player
    function handleAddPlayer() {
        if (data.players.length >= MAX_PLAYERS) return
        const newPlayerScores = new Array(data.roundNames.length).fill(null)

        setData({
            ...data,
            players: [...data.players, ""],
            scores: [...data.scores, newPlayerScores]
        })
    }

    // Remove a player
    function handleRemovePlayer(playerIndex) {
        // Prevent removing the last player
        if (data.players.length === 1) {
            setModal({ open: true, title: 'Cannot Remove', message: 'You must have at least one player!', confirmText: 'OK', cancelText: '', onConfirm: closeModal })
            return
        }

        const playerScores = data.scores[playerIndex]
        const hasScores = playerScores.some(score => score !== null)

        if (hasScores) {
            const playerName = data.players[playerIndex]
            setModal({
                open: true,
                title: 'Delete Player',
                message: `Delete ${playerName || `Player ${playerIndex + 1}`}? All of their scores will be lost.`,
                confirmText: 'Delete',
                confirmVariant: 'danger',
                cancelText: 'Cancel',
                onConfirm: () => {
                    const updatedPlayers = data.players.filter((_, index) => index !== playerIndex)
                    const updatedScores = data.scores.filter((_, index) => index !== playerIndex)
                    setData({ ...data, players: updatedPlayers, scores: updatedScores })
                    closeModal()
                }
            })
            return
        }
       
        
        // Remove player and their scores
        const updatedPlayers = data.players.filter((_, index) => index !== playerIndex)
        const updatedScores = data.scores.filter((_, index) => index !== playerIndex)
        
        setData({ ...data, players: updatedPlayers, scores: updatedScores })
    }

    function handleRoundNameChange(roundIndex, newName) {
        const updatedNames = data.roundNames.map((name, i) => i === roundIndex ? newName : name)
        setData({ ...data, roundNames: updatedNames })
    }

    function handleAddRound() {
        const updatedScores = data.scores.map(playerScores => [...playerScores, null])
        setData({
            ...data,
            scores: updatedScores,
            roundNames: [...data.roundNames, ""]
        })
    }

    function handleRemoveRound(roundIndex) {
        if (data.roundNames.length === 1) {
            setModal({ open: true, title: 'Cannot Remove', message: 'You must have at least one round!', confirmText: 'OK', cancelText: '', onConfirm: closeModal })
            return
        }

        const lastRoundIndex = data.roundNames.length - 1
        if (roundIndex !== lastRoundIndex) {
            setModal({ open: true, title: 'Cannot Remove', message: 'You can only delete the most recent round!', confirmText: 'OK', cancelText: '', onConfirm: closeModal })
            return
        }

        const hasScores = data.players.some((_, pIndex) => data.scores[pIndex][roundIndex] !== null)
        if (hasScores) {
            setModal({
                open: true,
                title: 'Delete Round',
                message: `Delete ${data.roundNames[roundIndex]}? All scores in this round will be lost.`,
                confirmText: 'Delete',
                confirmVariant: 'danger',
                cancelText: 'Cancel',
                onConfirm: () => {
                    const updatedScores = data.scores.map(playerScores => playerScores.slice(0, -1))
                    setData({ ...data, scores: updatedScores, roundNames: data.roundNames.slice(0, -1) })
                    closeModal()
                }
            })
            return
        }

        // Remove the last score and round name
        const updatedScores = data.scores.map(playerScores => playerScores.slice(0, -1))
        setData({
            ...data,
            scores: updatedScores,
            roundNames: data.roundNames.slice(0, -1)
        })
    }

    const lowestScoreWins = data.lowestScoreWins ?? false;
    const showTotals = data.showTotals ?? true;
    const showHighlights = data.showHighlights ?? true;

    function isRoundWinner(playerIndex, roundIndex) {
        if (!showHighlights) return false;

        const roundScores = data.players.map((_, pIndex) => data.scores[pIndex][roundIndex])
        const enteredScores = roundScores.filter(score => typeof score === 'number')
        if (enteredScores.length < 2) return false

        const playerScore = data.scores[playerIndex][roundIndex]
        if (typeof playerScore !== 'number') return false

        if (lowestScoreWins) {
            return playerScore === Math.min(...enteredScores)
        } else {
            const maxScore = Math.max(...enteredScores)
            return playerScore === maxScore && maxScore > 0
        }
    }

    function isOverallLeader(playerIndex) {
        if (!showHighlights) return false;

        const hasAnyScores = data.scores[playerIndex].some(score => typeof score === 'number')
        if (!hasAnyScores) return false

        const totals = data.players.map((_, pIndex) =>
           data.scores[pIndex].reduce((sum, score) => sum + (score ?? 0), 0)
        )
        const playerTotal = totals[playerIndex]

        if (lowestScoreWins) {
            const playersWithScores = data.players
                .map((_, pIndex) => ({ pIndex, total: totals[pIndex], hasScores: data.scores[pIndex].some(s => typeof s === 'number') }))
                .filter(p => p.hasScores)
            return playerTotal === Math.min(...playersWithScores.map(p => p.total))
        } else {
            const maxTotal = Math.max(...totals)
            return playerTotal === maxTotal && maxTotal > 0
        }
    }

    function handleReset() {
        setModal({
            open: true,
            title: 'Reset Scores',
            message: 'Reset all scores? This cannot be undone.',
            confirmText: 'Reset',
            confirmVariant: 'danger',
            cancelText: 'Cancel',
            onConfirm: () => {
                const resetScores = data.scores.map(playerScores => playerScores.map(() => null))
                setData({ ...data, scores: resetScores })
                closeModal()
            }
        })
    }

    return (
        <>
        <AlertModal
            open={modal.open}
            title={modal.title}
            message={modal.message}
            confirmText={modal.confirmText}
            confirmVariant={modal.confirmVariant}
            cancelText={modal.cancelText}
            onConfirm={modal.onConfirm}
            onCancel={closeModal}
        />
        <div className='score-table-module' ref={containerRef}>
                <ModuleHeader
                    title={data.title}
                    onTitleChange={(newTitle) => setData({ ...data, title: newTitle })}
                    onRemove={() => onRemove(id)}
                    onSettings={() => onSettings(id)}
                    onReset={handleReset}
                />

            {/* Table Container */}
            <div className='score-table-container' ref={tableContainerRef}>
                <table className='score-table'>
                    {/* Player Headers */}
                    <thead>
                        <tr>
                            <th className='round-label-header'>Round</th>
                            {data.players.map((player, index) => (
                                <th key={index} className='player-header'>
                                    <div className="player-header-content">
                                        {editingPlayer === index ? (
                                            <input
                                                type='text'
                                                value={player}
                                                placeholder={`Player ${index + 1}`}
                                                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                                onBlur={() => setEditingPlayer(null)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') setEditingPlayer(null)
                                                }}
                                                autoFocus
                                                className='player-name-input'
                                            />
                                        ) : (
                                            <span
                                                onClick={() => { setEditingPlayer(index); setPreEditName(player) }}
                                                className='player-name-text'
                                            >
                                                {player || <span style={{ opacity: 0.4, fontStyle: "italic" }}>{`Player ${index + 1}`}</span>}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleRemovePlayer(index)}
                                            className="delete-player-btn"
                                            title="Delete player"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </th>
                            ))}
                            {!isPlayMode && data.players.length < MAX_PLAYERS && (
                                <th className="add-player-header">
                                    <button
                                        onClick={handleAddPlayer}
                                        className="add-player-btn"
                                        title="Add player"
                                    >
                                        +
                                    </button>
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* Score Rows */}
                    <tbody>
                        {data.roundNames.map((_, roundIndex) => (
                            <tr key={roundIndex}>
                                <td className='round-label'>
                                    <div className="round-label-content">
                                        {editingRound === roundIndex ? (
                                            <input
                                                type='text'
                                                value={data.roundNames[roundIndex]}
                                                placeholder={`Round ${roundIndex + 1}`}
                                                onChange={(e) => handleRoundNameChange(roundIndex, e.target.value)}
                                                onBlur={() => setEditingRound(null)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') setEditingRound(null)
                                                }}
                                                autoFocus
                                                onFocus={(e) => e.target.select()}
                                                className='round-name-input'
                                            />
                                        ) : (
                                            <span
                                                onClick={() => setEditingRound(roundIndex)}
                                                className='round-name-text'
                                            >
                                                {data.roundNames[roundIndex] || <span style={{ opacity: 0.4, fontStyle: "italic" }}>{`Round ${roundIndex + 1}`}</span>}
                                            </span>
                                        )}
                                        {roundIndex === data.roundNames.length - 1 && (
                                            <button
                                                onClick={() => handleRemoveRound(roundIndex)}
                                                className="delete-round-btn"
                                                title="Delete round"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </td>
                                {data.players.map((_, playerIndex) => (
                                    <td 
                                        key={playerIndex} 
                                        className={`score-cell ${isRoundWinner(playerIndex, roundIndex) ? 'round-winner' : ''}`}
                                    >
                                        {editingCell?.playerIndex === playerIndex && editingCell?.roundIndex === roundIndex ? (
                                            <input
                                                type="number"
                                                value={data.scores[playerIndex][roundIndex] ?? ''}
                                                onChange={(e) => handleScoreChange(playerIndex, roundIndex, e.target.value)}
                                                onBlur={() => setEditingCell(null)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        setEditingCell(null)
                                                    }
                                                }}
                                                autoFocus
                                                onFocus={(e) => e.target.select()}
                                                className="score-input"
                                            />
                                        ) : (
                                            <span
                                                onClick={() => setEditingCell({ playerIndex, roundIndex })}
                                                className="score-value"
                                            >
                                                {data.scores[playerIndex][roundIndex] ?? '-'}
                                            </span>
                                        )}
                                    </td>
                                ))}
                                <td className="empty-cell"></td>
                            </tr>
                        ))}

                        {/* Add Round Button Row */}
                        {!isPlayMode && <tr>
                            <td className="add-round-cell">
                                <button
                                    onClick={handleAddRound}
                                    className="add-round-btn"
                                    title="Add round"
                                >
                                    +
                                </button>
                            </td>
                            {data.players.map((_, playerIndex) => (
                                <td key={playerIndex} className="empty-cell"></td>
                            ))}
                            <td className="empty-cell"></td>
                        </tr>}
                    </tbody>

                    {/* Totals Row */}
                    {showTotals && (
                    <tfoot>
                        <tr>
                            <td className='totals-label'>Total</td>
                            {data.players.map((_, playerIndex) => {
                                const total = data.scores[playerIndex].reduce((sum, score) => sum + (score ?? 0), 0);
                                return (
                                    <td
                                        key={playerIndex}
                                        className={`totals-cell ${isOverallLeader(playerIndex) ? 'overall-leader' : ''}`}
                                    >
                                        {total}
                                    </td>
                                );
                            })}
                            <td className="empty-cell"></td>
                        </tr>
                    </tfoot>
                    )}
                </table>
            </div>
        </div>
        </>
    );
}