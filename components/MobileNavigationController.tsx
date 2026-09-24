'use client'

import { useEffect } from 'react'

const links = [
  ['/register', 'Product Registration'],
  ['/warranty', 'Warranty Status'],
  ['/service/complaint/start', 'Register Complaint'],
  ['/service/track', 'Complaint Status'],
]

export default function MobileNavigationController(){
  useEffect(() => {
    const closeMenu = () => {
      const root = document.getElementById('olitec-mobile-menu-root')
      root?.remove()
      document.querySelectorAll<HTMLButtonElement>('.mobileMenuButton').forEach(button => button.setAttribute('aria-expanded','false'))
      document.body.classList.remove('mobile-menu-open')
    }

    const openMenu = () => {
      if (document.getElementById('olitec-mobile-menu-root')) return
      const root = document.createElement('div')
      root.id = 'olitec-mobile-menu-root'
      root.className = 'olitecMobileMenuRoot'
      root.innerHTML = `
        <div class="olitecMobileMenuBackdrop" data-mobile-menu-close="true"></div>
        <aside class="olitecMobileMenuPanel" role="dialog" aria-modal="true" aria-label="OLITEC support navigation">
          <div class="olitecMobileMenuHead">
            <img src="/olitec-logo.svg" alt="OLITEC" />
            <button type="button" class="olitecMobileMenuClose" aria-label="Close menu">×</button>
          </div>
          <nav class="olitecMobileMenuLinks">
            ${links.map(([href,label]) => `<a href="${href}">${label}<span>→</span></a>`).join('')}
          </nav>
          <a class="olitecMobileMenuHome" href="/"><span>⌂</span> Home</a>
        </aside>`
      document.body.appendChild(root)
      document.body.classList.add('mobile-menu-open')
      document.querySelectorAll<HTMLButtonElement>('.mobileMenuButton').forEach(button => button.setAttribute('aria-expanded','true'))
      root.querySelector('.olitecMobileMenuClose')?.addEventListener('click', closeMenu)
      root.querySelector('[data-mobile-menu-close]')?.addEventListener('click', closeMenu)
    }

    const clickHandler = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (!target) return
      const button = target.closest('.mobileMenuButton')
      if (button) {
        event.preventDefault()
        if (document.getElementById('olitec-mobile-menu-root')) closeMenu()
        else openMenu()
      }
    }

    document.addEventListener('click', clickHandler)
    return () => {
      document.removeEventListener('click', clickHandler)
      closeMenu()
    }
  }, [])

  return null
}
