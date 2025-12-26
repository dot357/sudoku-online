import type { GameStatus, GameSummaryDTO } from '~/shared/types/sudoku'

export function formatElapsedSeconds(totalSeconds: number) {
    const seconds = Math.max(0, Math.floor(totalSeconds))
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    const hh = hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''
    return `${hh}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function getElapsed(game: GameSummaryDTO, nowMs: number, fetchedAtMs: number) {
    let elapsed = game.elapsedSec
    const shouldTick = game.status === 'in_progress' && !game.paused
    if (shouldTick && fetchedAtMs) {
        elapsed += Math.floor((nowMs - fetchedAtMs) / 1000)
    }
    return formatElapsedSeconds(elapsed)
}

export function getActionLabel(game: GameSummaryDTO) {
    if (game.status === 'finished') return 'Inspect'
    if (game.paused) return 'Resume'
    return 'Continue'
}

function formatClockTime(date: Date) {
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const suffix = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    if (hours === 0) hours = 12
    return `${hours}:${minutes} ${suffix}`
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
}

export function formatStartedAt(value: string, nowMs: number) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    const nowDate = new Date(nowMs)
    const diffMs = nowMs - date.getTime()
    if (diffMs >= 0 && diffMs < 60 * 60 * 1000) {
        const mins = Math.max(1, Math.floor(diffMs / 60000))
        return `${mins} min ago`
    }

    if (isSameDay(date, nowDate)) {
        return `today @${formatClockTime(date)}`
    }

    const yesterday = new Date(nowDate)
    yesterday.setDate(nowDate.getDate() - 1)
    if (isSameDay(date, yesterday)) {
        return `yesterday @${formatClockTime(date)}`
    }

    const months = [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December'
    ]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day}/${month}/${year} @${formatClockTime(date)}`
}

export function getStatusLabel(status: GameStatus) {
    const lookup = {
        'in_progress': 'In Progress',
        'finished': 'Finished',
        'abandoned': 'Abandoned'
    }

    return lookup[status] || 'Unknown'
}
