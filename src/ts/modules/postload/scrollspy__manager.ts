export function initScrollspyManager() {
    const sections = document.querySelectorAll('header[id], section[id], footer[id], li[id]')
    const scrollspy = document.querySelector('.scrollspy') as HTMLDivElement

    if (sections.length === 0 || !scrollspy) {
        return
    }

    // * без scrollspy на макете - функционал не нужен
    if (window.innerWidth <= 1024) {
        return
    }

    // * настройки обсервера
    const observer_options = {
        root: null,
        rootMargin: '-45% 0px -65% 0px',
        threshold: 0,
    }

    let prevId: null | string
    const observer = new IntersectionObserver((entries) => {
        // * тут код, который выполнится срабатывании обсервера

        entries.forEach((entry) => {
            let id = entry.target.getAttribute('id')

            if (id === 'footer') {
                // * footer всегда прокидывает id на step-03 т.к. он всегда идёт после него
                id = 'step-03'
            }

            if (id !== 'step-01' && id !== 'step-02' && id !== 'step-03') {
                // * если попадаются все другие id - сбрасываем класс
                scrollspy.classList.remove(`active__${prevId}`)
                prevId = null

                return
            }

            // * целевые id
            if (entry.isIntersecting) {
                if (prevId) {
                    scrollspy.classList.remove(`active__${prevId}`)
                }

                scrollspy.classList.add(`active__${id}`)
            }

            prevId = id
        })
    }, observer_options)

    // * назначаем обсервер секциям
    sections.forEach((section) => {
        observer.observe(section)
    })

    // // * media queries
    // const media_query = window.matchMedia('(min-width: 576px)')
    // media_query.addEventListener('change', (e) => {
    //     if (e.matches && menu.classList.contains('open')) {
    //         closeMenu(true)
    //     }
    // })
}
