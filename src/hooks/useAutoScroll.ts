import { useEffect, useRef, RefObject } from 'react'

interface UseAutoScrollOptions {
  behavior?: ScrollBehavior
  delay?: number
  enabled?: boolean
}

export function useAutoScroll<T extends HTMLElement>(
  options: UseAutoScrollOptions = {}
): RefObject<T> {
  const { behavior = 'smooth', delay = 100, enabled = true } = options
  const elementRef = useRef<T>(null)

  const scrollToBottom = () => {
    if (elementRef.current && enabled) {
      elementRef.current.scrollIntoView({ behavior })
    }
  }

  return elementRef
}

export function useAutoScrollEffect<T extends HTMLElement>(
  ref: RefObject<T>,
  dependencies: any[],
  options: UseAutoScrollOptions = {}
): void {
  const { behavior = 'smooth', delay = 100, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const timeoutId = setTimeout(() => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior })
      }
    }, delay)

    return () => clearTimeout(timeoutId)
  }, dependencies)
}
