import postHTMLNoRef from 'posthtml-link-noreferrer'
import postHTMLAltAlways from 'posthtml-alt-always'

import postHtmlEleventyImg from './gulp/plugins/posthtml-eleventy-img.js'

// ! функционал плагина уже реализован в gulp/plugins/posthtml-eleventy-img.js
// import postHTMLImgAutoSize from 'posthtml-img-autosize'

export default {
    plugins: [
        // * 1. Обрабатываем картинки | Тег <img> сконвертируется в <picture> + <source>
        postHtmlEleventyImg(),

        // * 2. Остальные плагины
        postHTMLNoRef({
            attr: ['noopener', 'noreferrer'],
        }),
        postHTMLAltAlways(),
    ],
}
