// * --- vendors scripts
import AOS from 'aos'
import { createSnow, showSnow } from 'pure-snow.js'

// * aos
AOS.init()

// * snow
function getCountFor(width: number): number {
    if (width <= 768) {
        return 200
    }
    if (width <= 1920) {
        return 350
    }
    return 500
}

const snowEl = document.getElementById('snow') as HTMLDivElement
if (snowEl) {
    // * first init
    snowEl.dataset.count = String(getCountFor(window.innerWidth))

    createSnow()
    showSnow(true)

    // * after init behavior
    const media_queries = [
        window.matchMedia('(max-width: 768px)'),
        window.matchMedia('(min-width: 769px) and (max-width: 1920px)'),
        window.matchMedia('(min-width: 1921px)'),
    ]

    media_queries.forEach((mql) => {
        mql.addEventListener('change', () => {
            snowEl.dataset.count = String(getCountFor(window.innerWidth))
            createSnow()
        })
    })
}
