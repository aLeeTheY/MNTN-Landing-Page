export function initScrollspyManager() {
    const sections = document.querySelectorAll('header[id], section[id], footer[id], li[id]')

    const scrollspy_desktop = document.getElementById('scrollspy-desktop') as HTMLDivElement
    const scrollspy_mobile = document.getElementById('scrollspy-mobile') as HTMLDivElement

    if (sections.length === 0 || !scrollspy_desktop || !scrollspy_mobile) {
        return
    }

    // * настройки обсервера
    const observer_options = {
        root: null,
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
    }

    let prevId: null | string = null
    const observer = new IntersectionObserver((entries) => {
        // * тут код, который выполнится срабатывании обсервера

        entries.forEach((entry) => {
            let id = entry.target.getAttribute('id')

            // * for manual debug
            // console.log(`id = ${id}\nprevId = ${prevId}\n\n`)

            // * footer всегда прокидывает id на step-03 т.к. он всегда идёт после него
            if (id === 'footer') {
                id = 'step-03'
            }

            // * если это целевой id
            if (id === 'step-01' || id === 'step-02' || id === 'step-03') {
                if (entry.isIntersecting) {
                    if (prevId && prevId !== id) {
                        scrollspy_desktop.classList.remove(`active__${prevId}`)
                        scrollspy_mobile.classList.remove(`active__${prevId}`)
                    }

                    scrollspy_desktop.classList.add(`active__${id}`)
                    scrollspy_mobile.classList.add(`active__${id}`)

                    prevId = id
                }
            }
            // * НЕ целевые id и НЕ footer
            else {
                if (entry.isIntersecting) {
                    if (prevId) {
                        scrollspy_desktop.classList.remove(`active__${prevId}`)
                        scrollspy_mobile.classList.remove(`active__${prevId}`)

                        prevId = null
                    }
                }
            }
        })
    }, observer_options)

    // * назначаем обсервер секциям
    sections.forEach((section) => {
        observer.observe(section)
    })
}
