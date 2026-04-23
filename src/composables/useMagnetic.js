import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useCustomCursor } from './useCustomCursor'

export function useMagnetic(targetRef, options = {}) {
  const {
    maxOffset = 20,
    duration = 0.2,
    wrapperRef = null,
    hoverScale = 1,
    cursorHover = true,
    cursorLabel = ''
  } = options
  const { setCursorHover, setCursorMagneticTarget } = useCustomCursor()

  let moveHandler
  let leaveHandler
  let enterHandler
  let xTo
  let yTo
  let wrapperEl
  let targetEl

  onMounted(() => {
    targetEl = targetRef.value
    wrapperEl = wrapperRef?.value || targetEl
    if (!targetEl || !wrapperEl) return

    xTo = gsap.quickTo(targetEl, 'x', { duration, ease: 'power3.out' })
    yTo = gsap.quickTo(targetEl, 'y', { duration, ease: 'power3.out' })

    moveHandler = (e) => {
      const rect = wrapperEl.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const nx = gsap.utils.clamp(-1, 1, dx / (rect.width / 2 || 1))
      const ny = gsap.utils.clamp(-1, 1, dy / (rect.height / 2 || 1))
      xTo(nx * maxOffset)
      yTo(ny * maxOffset)
    }

    leaveHandler = () => {
      if (cursorHover) {
        setCursorHover(false)
        setCursorMagneticTarget(null)
      }
      gsap.to(targetEl, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'elastic.out(1, 0.3)',
        overwrite: 'auto'
      })
    }

    enterHandler = () => {
      if (cursorHover) {
        setCursorHover(true, cursorLabel)
        setCursorMagneticTarget(wrapperEl)
      }
      if (hoverScale !== 1) {
        gsap.to(targetEl, {
          scale: hoverScale,
          duration: 0.35,
          ease: 'power3.out',
          overwrite: 'auto'
        })
      }
    }

    wrapperEl.addEventListener('mouseenter', enterHandler, { passive: true })
    wrapperEl.addEventListener('mousemove', moveHandler, { passive: true })
    wrapperEl.addEventListener('mouseleave', leaveHandler, { passive: true })
  })

  onUnmounted(() => {
    if (enterHandler && wrapperEl) wrapperEl.removeEventListener('mouseenter', enterHandler)
    if (moveHandler && wrapperEl) wrapperEl.removeEventListener('mousemove', moveHandler)
    if (leaveHandler && wrapperEl) wrapperEl.removeEventListener('mouseleave', leaveHandler)
  })
}
