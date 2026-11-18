// ! --- BASE IMPORTS
// ! ----------------
// * --- vendors scripts
// ...
// * -------------------

// * --- my scripts
import { initMobileMenuManager } from 'modules/postload/mobile_menu__manager'
import { initScrollspyManager } from 'modules/postload/scrollspy__manager'
// * --------------

// ! --- BASE PAGE UI | STARTS IMMEDIATELY AFTER PAGE LOAD
// ! -----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenuManager()
    initScrollspyManager()
})
