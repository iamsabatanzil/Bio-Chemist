import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, Activity, Beaker, FlaskConical, Microscope, Atom, Menu, X } from 'lucide-react'

// DNA Helix Background Component
const DNAHelix: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const scrollPos = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleScroll = () => {
      scrollPos.current = window.scrollY
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)

    const drawHelix = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const helixHeight = canvas.height * 1.5
      const amplitude = 80
      const frequency = 0.02
      const rotation = time * 0.0005 + scrollPos.current * 0.001
      
      const mouseDist = Math.sqrt(
        Math.pow(mousePos.current.x - centerX, 2) + 
        Math.pow(mousePos.current.y - canvas.height / 2, 2)
      )
      const mouseEffect = Math.max(0, 1 - mouseDist / 300)

      for (let strand = 0; strand < 2; strand++) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(74, 255, 181, ${0.1 + mouseEffect * 0.2})`
        ctx.lineWidth = 2

        for (let y = -200; y < helixHeight; y += 2) {
          const angle = y * frequency + rotation + strand * Math.PI
          const x = centerX + Math.sin(angle) * (amplitude - mouseEffect * 50)
          
          if (y === -200) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      for (let y = 0; y < helixHeight; y += 40) {
        const angle1 = y * frequency + rotation
        const angle2 = y * frequency + rotation + Math.PI
        
        const x1 = centerX + Math.sin(angle1) * (amplitude - mouseEffect * 50)
        const x2 = centerX + Math.sin(angle2) * (amplitude - mouseEffect * 50)
        
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + mouseEffect * 0.1})`
        ctx.lineWidth = 1
        ctx.moveTo(x1, y)
        ctx.lineTo(x2, y)
        ctx.stroke()

        const baseSize = 3 + mouseEffect * 2
        ctx.fillStyle = `rgba(74, 255, 181, ${0.2 + mouseEffect * 0.3})`
        ctx.beginPath()
        ctx.arc(x1, y, baseSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x2, y, baseSize, 0, Math.PI * 2)
        ctx.fill()
      }

      time++
      animationFrameId = requestAnimationFrame(drawHelix)
    }

    drawHelix()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

const ScrambleText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [displayText, setDisplayText] = useState(text)
  const [isGlitching, setIsGlitching] = useState(false)
  const chars = 'ATGC'

  const scramble = useCallback(() => {
    let frame = 0
    const maxFrames = 25
    const animate = () => {
      if (frame < maxFrames) {
        setDisplayText(
          text.split('').map((char, i) => {
            if (char === ' ') return ' '
            if (frame / maxFrames > i / text.length + Math.random() * 0.2) return text[i]
            return chars[Math.floor(Math.random() * chars.length)]
          }).join('')
        )
        frame++
        requestAnimationFrame(animate)
      } else {
        setDisplayText(text)
      }
    }
    animate()
  }, [text])

  useEffect(() => {
    scramble()
  }, [scramble])

  const handleMouseEnter = () => {
    scramble()
    setIsGlitching(true)
    setTimeout(() => setIsGlitching(false), 500)
  }

  return (
    <span 
      className={`relative inline-block cursor-default ${className} ${isGlitching ? 'animate-glitch' : ''}`}
      onMouseEnter={handleMouseEnter}
      data-text={text}
    >
      {displayText}
      {isGlitching && (
        <>
          <span className="absolute top-0 left-0 -ml-[2px] text-lab-magenta opacity-70 animate-noise-1 pointer-events-none mix-blend-screen">{displayText}</span>
          <span className="absolute top-0 left-0 ml-[2px] text-lab-cyan opacity-70 animate-noise-2 pointer-events-none mix-blend-screen">{displayText}</span>
        </>
      )}
    </span>
  )
}

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-xl' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dna className="w-6 h-6 text-lab-cyan" />
            <span className="text-white font-mono text-lg tracking-tighter italic">SABA.LAB</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['research', 'skills', 'contact'].map((item) => (
              <a key={item} href={`#${item}`} className="text-gray-400 hover:text-lab-cyan transition-colors text-sm font-mono uppercase tracking-widest">{item}</a>
            ))}
          </div>

          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden mt-2">
              <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
                {['research', 'skills', 'contact'].map((item) => (
                  <a key={item} href={`#${item}`} onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-lab-cyan transition-colors font-mono">{item.toUpperCase()}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

const DNATicker: React.FC = () => {
  const [sequence, setSequence] = useState('')
  useEffect(() => {
    const bases = ['A', 'T', 'G', 'C']
    const gen = () => Array.from({ length: 40 }, () => bases[Math.floor(Math.random() * 4)]).join(' ')
    setSequence(gen())
    const interval = setInterval(() => setSequence(gen()), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-24 left-0 right-0 z-40 bg-black/10 backdrop-blur-sm border-y border-white/5 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap py-1.5 flex gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-8">
            <span className="text-lab-cyan/40 font-mono text-xs tracking-[0.2em]">{sequence}</span>
            <span className="text-white/20 font-mono text-xs">GC% 42.4</span>
            <span className="text-white/20 font-mono text-xs">PITCH 3.4nm</span>
            <span className="text-lab-magenta/40 font-mono text-xs tracking-[0.2em]">{sequence}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TerminalMonitor: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Sequence Core Alpha',
    '[OK] B-DNA Stability Confirmed',
    '[OK] Post-translational Mods: ON',
    '[LOG] User: Saba Tanzil | O+ | USTC'
  ])

  useEffect(() => {
    const additionalLogs = [
      '[DATA] PCR Amplification: Complete',
      '[WARN] Buffer PH anomaly detected (7.2 -> 6.8)',
      '[SYSTEM] Re-calibrating enzymatic sensors',
      '[OK] Kinetic Model: STABLE',
      '[LOG] Protein-Ligand bind: -9.2 kcal/mol',
      '[OK] Convergence achieved @ 500ps',
      '[SYSTEM] Heartbeat: NOMINAL'
    ]
    
    let logIndex = 0
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev, additionalLogs[logIndex]]
        if (newLogs.length > 6) newLogs.shift()
        return newLogs
      })
      logIndex = (logIndex + 1) % additionalLogs.length
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed main-terminal bottom-10 right-10 z-50 w-80">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
        {/* Shiny glow effect */}
        <div className="absolute inset-0 bg-lab-cyan/5 blur-xl pointer-events-none" />
        
        <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex gap-1.5">
            {[ '#ff5f56', '#ffbd2e', '#27c93f'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c}} />)}
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Molecular Monitor</span>
        </div>
        <div className="p-4 space-y-1.5 font-mono text-[11px] relative z-10 h-32 overflow-hidden">
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.div 
                key={log + i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-lab-cyan opacity-80 leading-tight flex items-start"
              >
                <span className="text-white/30 mr-2 shrink-0">{'>'}</span>
                <span>{log}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%]" />
      </div>
    </div>
  )
}

function App() {
  const [taglineIndex, setTaglineIndex] = useState(0)
  const taglines = ['Architecting Genetic Systems', 'Protein Folder', 'Enzyme Hacker', 'Molecular Specialist']

  useEffect(() => {
    const interval = setInterval(() => setTaglineIndex(p => (p + 1) % taglines.length), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-lab-bg selection:bg-lab-cyan selection:text-black">
      <DNAHelix />
      <Navigation />
      <DNATicker />
      <TerminalMonitor />

      <main className="relative z-10 pt-48 px-6 max-w-7xl mx-auto space-y-32 pb-32">
        {/* Hero Section */}
        <section className="min-h-[60vh] flex items-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="max-w-4xl p-10 md:p-16 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-lab-cyan/10 blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-lab-cyan/20" />
            
            <div className="relative z-10">
              <span className="text-lab-cyan font-mono text-xs uppercase tracking-[0.5em] mb-4 block">Biochemistry Lab v2.0</span>
              <h1 className="text-5xl md:text-8xl font-bold text-white mb-6 tracking-tight leading-none">
                <ScrambleText text="Saba Tanzil's Laboratory" />
              </h1>
              
              <div className="h-8 mb-10 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p key={taglineIndex} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="text-lab-magenta font-mono text-xl tracking-wide">
                    {taglines[taglineIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="grid md:grid-cols-2 gap-12 mt-16 pt-12 border-t border-white/10">
                <div className="space-y-6">
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Exploring the intersection of structural biology and computational chemistry. Building molecular systems to understand life at the atomic level.
                  </p>
                  <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/60 hover:border-lab-cyan transition-colors cursor-default">O+ Blood Group</div>
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/60 hover:border-lab-magenta transition-colors cursor-default">USTC CTG</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Microscope, label: 'Genomics', desc: 'DNA Sequencing Analysis' },
                    { icon: Atom, label: 'Proteomics', desc: 'Structural Dynamics' },
                    { icon: Activity, label: 'Metabolism', desc: 'Enzymatic Pathways' }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:border-lab-cyan transition-all">
                        <s.icon className="w-5 h-5 text-lab-cyan" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{s.label}</div>
                        <div className="text-gray-500 text-xs font-mono">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 p-6 rounded-2xl bg-lab-cyan/5 border border-lab-cyan/10">
                <p className="text-sm text-gray-300 italic">
                  "🐱 loves cats · 🍰 baking enthusiast · 🧪 building molecular chemistry to refine world"
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Research Experience */}
        <section id="research" className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <h2 className="text-4xl font-bold text-white mb-4">Research Experience</h2>
            <div className="w-20 h-1 bg-lab-magenta mb-6" />
            <p className="text-gray-500 font-mono text-sm leading-relaxed uppercase tracking-wider">
              Computational approaches to protein-ligand interactions.
            </p>
          </div>
          <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
            {[
              { icon: Beaker, title: 'Molecular Modeling', tools: 'Python, R, PyMOL', desc: 'Focused on enzymatic mechanisms and structural analysis via molecular dynamics.' },
              { icon: FlaskConical, title: 'Data Analysis', tools: 'Statistical Methods, D3.js', desc: 'Visualizing biological datasets to extract metabolic insights.' }
            ].map((r, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-lab-cyan transition-all group">
                <r.icon className="w-8 h-8 text-lab-cyan mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">{r.title}</h3>
                <div className="text-lab-magenta font-mono text-[10px] mb-4 uppercase tracking-widest">{r.tools}</div>
                <p className="text-gray-400 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="space-y-12">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-4">Core Competencies</h2>
            <div className="w-24 h-1 bg-lab-cyan mx-auto mb-8" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Python', 'R', 'Molecular Dynamics', 'Protein Analysis', 'Data Visualization', 'Statistical Methods'].map((skill) => (
              <div key={skill} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center group hover:bg-lab-cyan transition-all cursor-default">
                <span className="text-gray-300 text-sm font-medium group-hover:text-black transition-colors">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="p-16 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-lab-magenta/5 blur-[120px] -z-10" />
            <h2 className="text-5xl font-bold text-white mb-6">Let's Collaborate</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
              Interested in structural biology or computational chemistry? My lab is always open for interaction.
            </p>
            <button className="group relative px-10 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-all overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="relative z-10">Initiate Contact</span>
              {/* Shiny animated overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform z-20" />
              {/* Background glow shadow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-lab-cyan/20 blur-xl -z-10" />
            </button>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-white/10 text-center">
        <p className="text-gray-600 font-mono text-xs tracking-widest uppercase">
          © 2024 SABA TANZIL'S LABORATORY // ARCHITECTING GENETIC SYSTEMS
        </p>
      </footer>
    </div>
  )
}

export default App
