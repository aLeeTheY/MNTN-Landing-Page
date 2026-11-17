// ! --- БАЗОВЫЕ ИМПОРТЫ
// ! -------------------
// * --- vendors scripts
// ...
// * -------------------

// * --- my scripts
import { initMenuManager } from 'modules/postload/menu__manager'
// * --------------

// ! --- БАЗОВЫЙ UI СТРАНИЦЫ | СТАРТУЕТ МГНОВЕННО ПОСЛЕ ЗАГРУЗКИ
// ! -----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initMenuManager()
})
