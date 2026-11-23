import FocusTrap from '@callbacksystems/focus-trap'

//todo  можно доделать History API для мобилок
export function initMobileMenuManager() {
    const open_btn = document.getElementById('open-menu-btn') as HTMLButtonElement
    const close_btn = document.getElementById('close-menu-btn') as HTMLButtonElement

    const menu = document.getElementById('menu') as HTMLDivElement
    const menuFocusTrap = new FocusTrap(menu)

    const header_logo = document.getElementById('header-logo') as HTMLLinkElement

    if (!open_btn || !close_btn || !menu || !header_logo) {
        return
    }

    let timeoutId: number | undefined

    // * open menu logic
    const openMenu = () => {
        // * clear old timeout
        clearTimeout(timeoutId)

        // document.documentElement.style.overflow = 'hidden'
        menu.style.display = 'grid'

        timeoutId = window.setTimeout(() => {
            menu.classList.add('open')
        }, 10)

        // * start focus trap
        menuFocusTrap.start()

        // * focus to close btn
        close_btn.focus()
    }

    // * close menu logic
    const closeMenu = (closedByResize = false) => {
        // * clear old timeout
        clearTimeout(timeoutId)

        menu.classList.remove('open')

        timeoutId = window.setTimeout(() => {
            menu.style.display = 'none'
        }, 300)

        // * stop focus trap
        menuFocusTrap.stop()

        if (closedByResize) {
            // * focus to header logo
            header_logo.focus()
        } else {
            // * focus to open btn
            open_btn.focus()
        }

        // // * body overflow to default
        // document.documentElement.style.overflow = ''
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
    const media_query = window.matchMedia('(min-width: 576px)')
    media_query.addEventListener('change', (e) => {
        if (e.matches && menu.classList.contains('open')) {
            closeMenu(true)
        }
    })
}
