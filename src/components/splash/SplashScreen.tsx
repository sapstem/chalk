import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { RecentBoard } from '../../types'

const STORAGE_KEY = 'chalk_recent_boards'

function getRecentBoards(): RecentBoard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return (JSON.parse(raw) as RecentBoard[]).sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

function formatDate(ms: number): string {
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ms).toLocaleDateString()
}

// ─── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SplashScreen() {
  const navigate = useNavigate()
  const [recentBoards, setRecentBoards] = useState<RecentBoard[]>([])

  useEffect(() => {
    setRecentBoards(getRecentBoards())
  }, [])

  const handleNewBoard = () => {
    navigate('/board')
  }

  const handleOpenBoard = (id: string) => {
    navigate(`/board?id=${id}`)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#111113',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Dot grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, #111113 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          zIndex: 1,
          width: '100%',
          maxWidth: 480,
          padding: '0 24px',
        }}
      >
        {/* Logo */}
        <motion.div variants={itemVariants}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 48,
              fontStyle: 'italic',
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              userSelect: 'none',
            }}
          >
            chalk
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>.</span>
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            marginTop: 12,
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-sm)',
            color: 'rgba(255,255,255,0.38)',
            letterSpacing: '0.02em',
            textAlign: 'center',
          }}
        >
          a canvas for your ideas
        </motion.p>

        {/* New board button */}
        <motion.div variants={itemVariants} style={{ marginTop: 36 }}>
          <button
            onClick={handleNewBoard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 44,
              padding: '0 28px',
              background: '#ffffff',
              color: '#111113',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.01em',
              transition: 'opacity var(--transition-fast), transform var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.88'
              e.currentTarget.style.transform = 'scale(1.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="#111113" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            New board
          </button>
        </motion.div>

        {/* Recent boards */}
        {recentBoards.length > 0 && (
          <motion.div
            variants={itemVariants}
            style={{
              marginTop: 48,
              width: '100%',
            }}
          >
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
                fontFamily: 'var(--font-sans)',
              }}
            >
              Recent
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentBoards.slice(0, 5).map((board) => (
                <button
                  key={board.id}
                  onClick={() => handleOpenBoard(board.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                >
                  {/* Thumbnail or placeholder */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-sm)',
                      background: board.thumbnail
                        ? `url(${board.thumbnail}) center/cover no-repeat`
                        : 'rgba(255,255,255,0.06)',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'rgba(255,255,255,0.82)',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {board.name}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'rgba(255,255,255,0.28)',
                        marginTop: 2,
                      }}
                    >
                      {formatDate(board.updatedAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
