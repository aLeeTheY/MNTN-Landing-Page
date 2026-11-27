/* eslint-disable no-console */
import Image from '@11ty/eleventy-img'

import fs from 'node:fs'
import nodePath from 'node:path'

import { env } from '../config/env.js'
import { path } from '../config/path.js'

// * Настройки Sharp
const sharpOptions = {
    jpeg: {
        quality: env.buildMode.isDev ? 100 : 80,
        mozjpeg: env.buildMode.isStaging || env.buildMode.isProd,
        progressive: true,
        chromaSubsampling: '4:4:4',
    },
    png: {
        effort: env.buildMode.isDev ? 1 : 10,
        quality: env.buildMode.isDev ? 100 : 80,
        compressionLevel: env.buildMode.isDev ? 0 : 9,
        palette: true,
        adaptiveFiltering: true,
    },
    webp: {
        effort: env.buildMode.isDev ? 0 : 6,
        quality: env.buildMode.isDev ? 100 : 70,
        smartSubsample: true,
        smartDeblock: true,
    },
    avif: {
        effort: env.buildMode.isDev ? 0 : 9,
        quality: env.buildMode.isDev ? 100 : 55,
        bitdepth: 8,
        chromaSubsampling: '4:4:4',
    },
}

// * Ширины для нарезки
const defaultWidths = ['auto', 375, 640, 1024, 1366, 1920, 2560]

// * Атрибуты, которые будут перенесены с <img> на <picture>
const attrsToLift = [
    'data-aos',
    'data-aos-offset',
    'data-aos-delay',
    'data-aos-duration',
    'data-aos-easing',
    'data-aos-mirror',
    'data-aos-once',
    'data-aos-anchor-placement',
]

const filenameFormat = function (id, src, width, format) {
    // * Берём оригинальное имя файла без расширения
    const name = nodePath.basename(src, nodePath.extname(src))

    // * id - это тот самый хеш (VkciesLvOW)
    return `${name}-${width}w-${id}.${format}`
}

export default function postHtmlEleventyImg() {
    return async function (tree) {
        const imgNodes = []
        const preloadLinks = []

        // ? 1. Собираем все <img> с нужным src
        tree.match({ tag: 'img' }, (node) => {
            const src = node.attrs?.src

            if (!src || src.startsWith('http') || src.startsWith('data:')) {
                return node
            }
            if (!src.includes('@images/')) {
                return node
            }

            imgNodes.push(node)
            return node
        })

        // ? 2. Асинхронно обрабатываем
        await Promise.all(
            imgNodes.map(async (node) => {
                const src = node.attrs.src

                // * Достаем относительный путь: '@images/hero/bg.png' -> 'hero/bg.png'
                const relativeImgPath = src.replace(/.*@images\//, '')

                const relativeDir = nodePath.dirname(relativeImgPath)
                const isRootDir = relativeDir === '.'

                // * Абсолютный путь к исходнику: './src/assets/images/hero/bg.png'
                const absoluteImgPath = nodePath.join(path.src.images.base, relativeImgPath)

                // * Определяем, куда сохранять файлы (в dist или в Django)
                const baseOutputDir = env.isDjangoBuild
                    ? path.djangoBuild.images
                    : path.build.images

                // * Сохраняем структуру папок!
                const outputDir = isRootDir
                    ? baseOutputDir
                    : nodePath.join(baseOutputDir, relativeDir)

                // * Создаем папки, если их нет
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true })
                }

                try {
                    // ? 3. Нарезаем и конвертируем через @11ty/eleventy-img
                    const metadata = await Image(absoluteImgPath, {
                        widths: defaultWidths,
                        formats: ['avif', 'webp', 'png'],

                        urlPath: isRootDir ? '@images/' : `@images/${relativeDir}/`,
                        outputDir: outputDir,

                        hashLength: 10,
                        filenameFormat: filenameFormat,

                        sharpJpegOptions: sharpOptions.jpeg,
                        sharpPngOptions: sharpOptions.png,
                        sharpWebpOptions: sharpOptions.webp,
                        sharpAvifOptions: sharpOptions.avif,

                        // useCache: !env.isForceClean,
                        useCache: true,
                    })

                    // ? Если картинка помечена data-preload="true"
                    if (node.attrs['data-my-preload'] === 'true') {
                        const sizes = node.attrs.sizes || '100vw'
                        const format = metadata.avif ? 'avif' : metadata.webp ? 'webp' : 'png'
                        const urlPathPrefix = isRootDir ? '@images/' : `@images/${relativeDir}/`

                        // * Генерируем imagesrcset для выбранного формата
                        const imagesrcset = metadata[format]
                            .map((entry) => `${urlPathPrefix}${entry.filename} ${entry.width}w`)
                            .join(', ')

                        // * Берем href для fallback (например, 1920w или самый большой | @11ty/eleventy-img выставляет наименьшее значение в src/ !!! )
                        const fallbackEntry =
                            metadata[format].find((e) => e.width === 1920) ||
                            metadata[format][metadata[format].length - 1]

                        const linkTag = `<link rel="preload" as="image" type="image/${format}" fetchpriority="high" href="${urlPathPrefix}${fallbackEntry.filename}" imagesrcset="${imagesrcset}" imagesizes="${sizes}">`

                        preloadLinks.push(linkTag)
                    }

                    // ? 4. Настройки для <img>
                    const imageAttributes = { ...node.attrs }

                    imageAttributes.alt = node.attrs.alt || ''
                    imageAttributes.sizes = node.attrs.sizes || '100vw'

                    // ? eager в любом случае делаем | lazy - gavno
                    // imageAttributes.loading = node.attrs.fetchpriority === 'high' ? 'eager' : 'lazy'
                    imageAttributes.loading =
                        node.attrs.fetchpriority === 'high' ? 'eager' : 'eager'

                    imageAttributes.decoding = 'async'

                    // ? Eleventy сам подставит правильный src
                    delete imageAttributes.src

                    // ? Это ушло на <picture>
                    delete imageAttributes['data-my-picture-class']

                    // ? Не нужен в итоговом файле
                    delete imageAttributes['data-my-preload']

                    // delete imageAttributes.fetchpriority

                    // ? Удаляем атрибуты AOS, так как они уже перенесены на <picture>
                    for (const attr of attrsToLift) {
                        delete imageAttributes[attr]
                    }

                    // ? 5. Переносим атрибуты на <picture>
                    const pictureAttributes = {}
                    if (node.attrs['data-my-picture-class']) {
                        pictureAttributes.class = node.attrs['data-my-picture-class']
                        delete node.attrs['data-my-picture-class']
                    }
                    for (const attr of attrsToLift) {
                        if (node.attrs[attr] !== undefined) {
                            pictureAttributes[attr] = node.attrs[attr]
                        }
                    }

                    // ? 6. Генерируем HTML
                    const html = Image.generateHTML(metadata, imageAttributes, {
                        pictureAttributes,
                    })

                    // ? 7. Заменяем тег
                    node.tag = false
                    node.content = [html]
                } catch (err) {
                    console.warn(`[eleventy-img] Ошибка обработки ${absoluteImgPath}:`, err.message)
                }
            }),
        )

        // ? 8. Вставляем собранные preload теги в <head> после meta viewport
        if (preloadLinks.length > 0) {
            tree.match({ tag: 'head' }, (node) => {
                if (!node.content) {
                    node.content = []
                }

                let insertIndex = 0
                for (let i = 0; i < node.content.length; i++) {
                    const child = node.content[i]
                    const isViewportMeta =
                        (typeof child === 'object' &&
                            child.tag === 'meta' &&
                            child.attrs &&
                            child.attrs.name === 'viewport') ||
                        (typeof child === 'string' && child.includes('name="viewport"'))

                    if (isViewportMeta) {
                        insertIndex = i + 1
                        break
                    }
                }

                node.content.splice(insertIndex, 0, ...preloadLinks)
                return node
            })
        }

        return tree
    }
}
