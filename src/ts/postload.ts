// ! --- BASE IMPORTS
// ! ----------------
// * --- vendors scripts
import { createSnow, showSnow } from 'pure-snow.js'
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

    // * decorations
    createSnow()
    showSnow(true)
})
