import type { IConfigOption, Theme } from '@/types'

import { toMerged } from 'es-toolkit'

const defaultTheme: Theme = {
  base: {
    '--md-primary-color': `hsl(0, 100%, 50%)`,
    'text-align': `left`,
    'line-height': `1.75`,
  },
  block: {
    // 一级标题
    h1: {
      // 'display': `table`,
      // 'padding': `0 1em`,
      // 'border-bottom': `2px solid var(--md-primary-color)`,
      'margin': `0 auto 0`,
      'color': `hsl(0, 100%, 50%)`,
      'font-size': `3em`,
      'font-weight': `bold`,
      'text-align': `left`,
      'font-style': `italic`,
    },

    // 二级标题
    h2: {
      'margin': `-14px auto 2em`,
      'color': `hsl(0, 100%, 50%)`,
      'font-size': `1.2em`,
      'font-weight': `bold`,
      'text-align': `left`,
    },

    // 三级标题
    h3: {
      'padding-left': `8px`,
      'border-left': `3px solid var(--md-primary-color)`,
      'margin': `2em 8px 0.75em 0`,
      'color': `var(--el-text-color-regular)`,
      'font-size': `1.1em`,
      'font-weight': `bold`,
      'line-height': `1.2`,
    },

    // 四级标题
    h4: {
      'margin': `2em 8px 0.5em`,
      'color': `var(--md-primary-color)`,
      'font-size': `1em`,
      'font-weight': `bold`,
    },

    // 五级标题
    h5: {
      'margin': `1.5em 8px 0.5em`,
      'color': `var(--md-primary-color)`,
      'font-size': `1em`,
      'font-weight': `bold`,
    },

    // 六级标题
    h6: {
      'margin': `1.5em 8px 0.5em`,
      'font-size': `1em`,
      'color': `var(--md-primary-color)`,
    },

    // 段落
    p: {
      'margin': `1.5em 0`,
      'letter-spacing': `0.1em`,
      'color': `var(--el-text-color-regular)`,
      'text-align': `justify`,
    },

    // 引用
    blockquote: {
      'font-style': `normal`,
      'border-left': `none`,
      'padding': `1.4em`,
      'border-radius': `8px`,
      'color': `rgba(0,0,0,0.5)`,
      'background-color': `var(--blockquote-background)`,
      'background-image': `url('https://static.wuxiaobao.cn/image/adren/quote.png')`,
      'background-size': `18px`,
      'background-repeat': `no-repeat`,
      'background-position': `6px 6px`,
      'margin': `2em 0`,
    },

    // 引用内容
    blockquote_p: {
      'display': `block`,
      'font-size': `1em`,
      'letter-spacing': `0.1em`,
      'color': `var(--el-text-color-regular)`,
    },

    blockquote_name: {
      'color': `#3f3f3f`,
      'font-weight': `bold`,
    },
    blockquote_name_others: {
      'color': `#3f3f3f`,
      'font-weight': `bold`,
    },
    blockquote_content: {
      'color': `var(--md-primary-color)`,
      'font-weight': `bold`,
    },
    blockquote_note: {
    },

    blockquote_tip: {
    },

    blockquote_important: {
    },

    blockquote_warning: {
    },

    blockquote_caution: {
    },

    // GFM 警告块标题
    blockquote_title: {
      'display': `flex`,
      'align-items': `center`,
      'gap': `0.5em`,
      'margin-bottom': `0.5em`,
    },

    blockquote_title_note: {
      color: `#478be6`,
    },

    blockquote_title_tip: {
      color: `#57ab5a`,
    },

    blockquote_title_important: {
      color: `#986ee2`,
    },

    blockquote_title_warning: {
      color: `#c69026`,
    },

    blockquote_title_caution: {
      color: `#e5534b`,
    },

    blockquote_p_note: {
    },

    blockquote_p_tip: {
    },

    blockquote_p_important: {
    },

    blockquote_p_warning: {
    },

    blockquote_p_caution: {
    },

    // 代码块
    code_pre: {
      'font-size': `14px`,
      'overflow-x': `auto`,
      'border-radius': `8px`,
      'padding': `1em`,
      'line-height': `1.5`,
      'margin': `10px 0`,
    },

    // 行内代码
    code: {
      'margin': 0,
      'white-space': `nowrap`,
      'font-family': `Menlo, Operator Mono, Consolas, Monaco, monospace`,
    },

    // 图片
    image: {
      display: `block`,
      width: `100% !important`,
      margin: `0.1em auto 0em`,
      // 'border-radius': `4px`,
    },

    // 有序列表
    ol: {
      'padding-left': `0em`,
      'margin-left': `0`,
      'color': `var(--el-text-color-regular)`,
    },

    // 无序列表
    ul: {
      'list-style': `circle`,
      'padding-left': `0em`,
      'margin-left': `0`,
      'color': `var(--el-text-color-regular)`,
    },

    footnotes: {
      'margin': `0.5em 0`,
      'font-size': `80%`,
      'color': `var(--el-text-color-regular)`,
    },

    figure: {
      margin: `1.5em 0`,
      color: `var(--el-text-color-regular)`,
    },

    hr: {
      'border-style': `solid`,
      'border-width': `1px 0 0`,
      'border-color': `rgba(0,0,0,0.1)`,
      '-webkit-transform-origin': `0 0`,
      '-webkit-transform': `scale(1, 0.5)`,
      'transform-origin': `0 0`,
      'transform': `scale(1, 0.5)`,
    },
  },
  inline: {
    listitem: {
      // 'text-indent': `-1em`,
      display: `flex`,
      // 'align-items': `center`,
      margin: `0.2em 0`,
      color: `var(--el-text-color-regular)`,
    },

    codespan: {
      'font-weight': `bold`,
      'font-size': `inherit`,
      // 'word-break': `break-all`,
    },

    em: {
      'font-style': `italic`,
      'font-size': `inherit`,
    },

    link: {
      color: `#576b95`,
    },

    wx_link: {
      'color': `#576b95`,
      'text-decoration': `none`,
    },

    // 字体加粗样式
    strong: {
      'color': `var(--md-primary-color)`,
      'font-weight': `bold`,
      'font-size': `inherit`,
      'box-shadow': `inset 0 -8px 0 rgba(255,0,0,0.1)`,
    },

    table: {
      'border-collapse': `collapse`,
      'text-align': `center`,
      'margin': `1em 0`,
      'color': `var(--el-text-color-regular)`,
    },

    thead: {
      'background': `rgba(0, 0, 0, 0.05)`,
      'font-weight': `bold`,
      'color': `var(--el-text-color-regular)`,
    },

    td: {
      'border': `1px solid #dfdfdf`,
      'padding': `0.25em 0.5em`,
      'color': `#3f3f3f`,
      'word-break': `keep-all`,
    },

    footnote: {
      'font-size': `12px`,
      'color': `var(--el-text-color-regular)`,
    },

    figcaption: {
      'text-align': `left`,
      'color': `rgba(0,0,0,0.6)`,
      'font-size': `1em`,
      'line-height': `1.4`,
      'padding': `0.8em 1em`,
      'border-left': `5px solid var(--md-primary-color)`,
      'background': `rgba(0,0,0,0.05)`,
    },
  },
}

const graceTheme = toMerged(defaultTheme, {
  base: {
  },
  block: {
    'h1': {
      'padding': `0.5em 1em`,
      'border-bottom': `2px solid var(--md-primary-color)`,
      'font-size': `1.4em`,
      'text-shadow': `2px 2px 4px rgba(0,0,0,0.1)`,
    },

    'h2': {
      'padding': `0.3em 1em`,
      'border-radius': `8px`,
      'font-size': `1.3em`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.1)`,
    },

    'h3': {
      'padding-left': `12px`,
      'font-size': `1.2em`,
      'border-left': `4px solid var(--md-primary-color)`,
      'border-bottom': `1px dashed var(--md-primary-color)`,
    },

    'h4': {
      'font-size': `1.1em`,
    },

    'h5': {
      'font-size': `1em`,
    },

    'h6': {
      'font-size': `1em`,
    },

    'p': {
    },

    'blockquote': {
      'font-style': `italic`,
      'padding': `1em 1em 1em 2em`,
      'border-left': `4px solid var(--md-primary-color)`,
      'border-radius': `6px`,
      'color': `rgba(0,0,0,0.6)`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.05)`,
    },

    'blockquote_p': {
    },

    'markdown-alert': {
      'font-style': `italic`,
    },

    'code_pre': {
      'box-shadow': `inset 0 0 10px rgba(0,0,0,0.05)`,
    },

    'code': {
      'white-space': `pre-wrap`,
      'font-family': `'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace`,
    },

    'image': {
      'border-radius': `8px`,
      'box-shadow': `0 4px 8px rgba(0,0,0,0.1)`,
    },

    'ol': {
      'padding-left': `1.5em`,
    },

    'ul': {
      'list-style': `none`,
      'padding-left': `1.5em`,
    },

    'footnotes': {

    },

    'figure': {

    },

    'hr': {
      height: `1px`,
      border: `none`,
      margin: `2em 0`,
      background: `linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.1), rgba(0,0,0,0))`,
    },
  },
  inline: {
    listitem: {
      margin: `0.5em 0`,
    },

    codespan: {
    },

    em: {
    },

    link: {
    },

    wx_link: {
    },

    strong: {
    },

    table: {
      'border-collapse': `separate`,
      'border-spacing': `0`,
      'border-radius': `8px`,
      'margin': `1em 0`,
      'color': `var(--el-text-color-regular)`,
      'box-shadow': `0 4px 6px rgba(0,0,0,0.1)`,
      'overflow': `hidden`,
    },

    thead: {
      color: `#fff`,
    },

    td: {
      padding: `0.5em 1em`,
    },

    footnote: {
      color: `rgba(0,0,0,0.5)`,
    },

    figcaption: {

    },
  },
})

export const themeMap = {
  default: defaultTheme,
  grace: graceTheme,
}

export const themeOptions: IConfigOption<keyof typeof themeMap>[] = [
  {
    label: `经典`,
    value: `default`,
    desc: ``,
  },
  {
    label: `优雅`,
    value: `grace`,
    desc: ``,
  },
]
