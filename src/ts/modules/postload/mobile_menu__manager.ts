import FocusTrap from '@callbacksystems/focus-trap'

//todo  можно доделать History API для мобилок
export function initMobileMenuManager() {
    const open_btn = document.getElementById('open-menu-btn') as HTMLButtonElement
    const close_btn = document.getElementById('close-menu-btn') as HTMLButtonElement
    const menu = document.getElementById('menu') as HTMLDivElement
    const header_logo = document.getElementById('header-logo') as HTMLLinkElement

    if (!open_btn || !close_btn || !menu || !header_logo) {
        return
    }

    let menuFocusTrap = null
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (!isTouchDevice) {
        /* * set focus trap */
        menuFocusTrap = new FocusTrap(menu)
    }

    let timeoutId: number | undefined

    // * open menu logic
    const openMenu = () => {
        // document.documentElement.style.overflow = 'hidden'
        menu.style.display = 'grid'

        requestAnimationFrame(() => {
            menu.classList.add('open')

            if (menuFocusTrap) {
                // * start focus trap
                menuFocusTrap.start()
            }

            // * focus to close btn
            close_btn.focus({ preventScroll: true })
        })
    }

    // * close menu logic
    const closeMenu = (closedByResize = false) => {
        // * clear old timeout
        clearTimeout(timeoutId)

        menu.classList.remove('open')

        if (menuFocusTrap) {
            // * stop focus trap
            menuFocusTrap.stop()
        }

        if (closedByResize) {
            // * focus to header logo
            header_logo.focus({ preventScroll: true })
        } else {
            // * focus to open btn
            open_btn.focus({ preventScroll: true })
        }

        // // * body overflow to default
        // document.documentElement.style.overflow = ''

        timeoutId = window.setTimeout(() => {
            menu.style.display = 'none'
        }, 300)
    }

    // * listeners
    open_btn.addEventListener('click', openMenu)
    close_btn.addEventListener('click', () => closeMenu(false))

    // * ESC keyboard button
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
            closeMenu(false)
        }
    })

    // * media queries
    const media_query = window.matchMedia('(min-width: 1024px)')
    media_query.addEventListener('change', (e) => {
        if (e.matches && menu.classList.contains('open')) {
            closeMenu(true)
        }
    })
}
