<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import CssEditor from '@/components/CodemirrorEditor/CssEditor.vue'
import EditorHeader from '@/components/CodemirrorEditor/EditorHeader/index.vue'
import InsertFormDialog from '@/components/CodemirrorEditor/InsertFormDialog.vue'
import UploadImgDialog from '@/components/CodemirrorEditor/UploadImgDialog.vue'

import RunLoading from '@/components/RunLoading.vue'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

import { altKey, altSign, ctrlKey, shiftKey, shiftSign } from '@/config'
import { useDisplayStore, useStore } from '@/stores'
import {
  checkImage,
  formatDoc,
  toBase64,
} from '@/utils'
import fileApi from '@/utils/file'
import CodeMirror from 'codemirror'

import { ElCol, ElMessage } from 'element-plus'

import { storeToRefs } from 'pinia'

import { onMounted, ref, toRaw, watch } from 'vue'

const store = useStore()
const displayStore = useDisplayStore()
const { isDark, output, editor, editorContent } = storeToRefs(store)
const { isShowCssEditor } = storeToRefs(displayStore)

const {
  editorRefresh,
  exportEditorContent2HTML,
  exportEditorContent2MD,
  formatContent,
  importMarkdownContent,
  resetStyleConfirm,
} = store

const {
  toggleShowInsertFormDialog,
  toggleShowUploadImgDialog,
} = displayStore

const isImgLoading = ref(false)
const timeout = ref<NodeJS.Timeout>()

const preview = ref<typeof ElCol | null>(null)

// 使浏览区与编辑区滚动条建立同步联系
function leftAndRightScroll() {
  const scrollCB = (text: string) => {
    let source: HTMLElement
    let target: HTMLElement

    clearTimeout(timeout.value)
    if (text === `preview`) {
      source = preview.value!.$el
      target = document.querySelector<HTMLElement>(`.CodeMirror-scroll`)!

      editor.value!.off(`scroll`, editorScrollCB)
      timeout.value = setTimeout(() => {
        editor.value!.on(`scroll`, editorScrollCB)
      }, 300)
    }
    else {
      source = document.querySelector<HTMLElement>(`.CodeMirror-scroll`)!
      target = preview.value!.$el

      target.removeEventListener(`scroll`, previewScrollCB, false)
      timeout.value = setTimeout(() => {
        target.addEventListener(`scroll`, previewScrollCB, false)
      }, 300)
    }

    const percentage
      = source.scrollTop / (source.scrollHeight - source.offsetHeight)
    const height = percentage * (target.scrollHeight - target.offsetHeight)

    target.scrollTo(0, height)
  }

  function editorScrollCB() {
    scrollCB(`editor`)
  }

  function previewScrollCB() {
    scrollCB(`preview`)
  }

  (preview.value!.$el).addEventListener(`scroll`, previewScrollCB, false)
  editor.value!.on(`scroll`, editorScrollCB)
}

onMounted(() => {
  setTimeout(() => {
    leftAndRightScroll()
  }, 300)
})

// 更新编辑器
function onEditorRefresh() {
  editorRefresh()
}

const backLight = ref(false)
const isCoping = ref(false)

function startCopy() {
  isCoping.value = true
  backLight.value = true
}

// 拷贝结束
function endCopy() {
  backLight.value = false
  setTimeout(() => {
    isCoping.value = false
  }, 800)
}

function beforeUpload(file: File) {
  // validate image
  const checkResult = checkImage(file)
  if (!checkResult.ok) {
    ElMessage.error(checkResult.msg)
    return false
  }

  // check image host
  const imgHost = localStorage.getItem(`imgHost`) || `default`
  localStorage.setItem(`imgHost`, imgHost)

  const config = localStorage.getItem(`${imgHost}Config`)
  const isValidHost = imgHost === `default` || config
  if (!isValidHost) {
    ElMessage.error(`请先配置 ${imgHost} 图床参数`)
    return false
  }
  return true
}

// 图片上传结束
function uploaded(imageUrl: string) {
  if (!imageUrl) {
    ElMessage.error(`上传图片未知异常`)
    return
  }
  toggleShowUploadImgDialog(false)
  // 上传成功，获取光标
  const cursor = editor.value!.getCursor()
  const markdownImage = `![](${imageUrl})`
  // 将 Markdown 形式的 URL 插入编辑框光标所在位置
  toRaw(store.editor!).replaceSelection(`\n${markdownImage}\n`, cursor as any)
  ElMessage.success(`图片上传成功`)
}
function uploadImage(file: File, cb?: { (url: any): void, (arg0: unknown): void } | undefined) {
  isImgLoading.value = true

  toBase64(file)
    .then(base64Content => fileApi.fileUpload(base64Content, file))
    .then((url) => {
      if (cb) {
        cb(url)
      }
      else {
        uploaded(url)
      }
    })
    .catch((err) => {
      ElMessage.error(err.message)
    })
    .finally(() => {
      isImgLoading.value = false
    })
}

const changeTimer = ref<NodeJS.Timeout>()

// 监听暗色模式并更新编辑器
watch(isDark, () => {
  const theme = isDark.value ? `darcula` : `xq-light`
  toRaw(editor.value)?.setOption?.(`theme`, theme)
})

function toggleHeading(editor: any, level: number) {
  const cursor = editor.getCursor()
  const selection = editor.getSelection()
  const line = editor.getLine(cursor.line)

  // 创建对应数量的 # 符号
  const hashes = `#`.repeat(level)

  if (selection) {
    // 处理选中的文本
    const lines = selection.split(`\n`)
    const processedLines = lines.map((line: string) => {
      // 跳过空行
      if (!line.trim()) {
        return line
      }

      const lineHashes = line.match(/^#{1,6}\s/)
      if (lineHashes && lineHashes[0].trim().length === level) {
        // 如果已经是对应级别的标题，则移除标题标记
        return line.replace(/^#{1,6}\s/, ``)
      }
      else {
        // 如果不是标题或者是其他级别的标题，则设置为目标级别
        return `${hashes} ${line.replace(/^#{1,6}\s/, ``)}`
      }
    })
    editor.replaceSelection(processedLines.join(`\n`))
  }
  else {
    // 处理当前行
    // 如果是空行，不做处理
    if (!line.trim()) {
      return
    }

    const currentHashes = line.match(/^#{1,6}\s/)
    if (currentHashes && currentHashes[0].trim().length === level) {
      // 如果已经是对应级别的标题，则移除标题标记
      editor.replaceRange(
        line.replace(/^#{1,6}\s/, ``),
        { line: cursor.line, ch: 0 },
        { line: cursor.line, ch: line.length },
      )
    }
    else {
      // 如果不是标题或者是其他级别的标题，则设置为目标级别
      editor.replaceRange(
        `${hashes} ${line.replace(/^#{1,6}\s/, ``)}`,
        { line: cursor.line, ch: 0 },
        { line: cursor.line, ch: line.length },
      )
    }
  }
}
// 初始化编辑器
function initEditor() {
  const editorDom = document.querySelector<HTMLTextAreaElement>(`#editor`)!

  if (!editorDom.value) {
    editorDom.value = editorContent.value
  }
  editor.value = CodeMirror.fromTextArea(editorDom, {
    mode: `text/x-markdown`,
    theme: isDark.value ? `darcula` : `xq-light`,
    lineNumbers: false,
    lineWrapping: true,
    styleActiveLine: true,
    autoCloseBrackets: true,
    extraKeys: {
      [`${shiftKey}-${altKey}-F`]: function autoFormat(editor) {
        formatDoc(editor.getValue()).then((doc) => {
          editor.setValue(doc)
        })
      },
      [`${ctrlKey}-B`]: function bold(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`**${selected}**`)
      },
      [`${ctrlKey}-I`]: function italic(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`*${selected}*`)
      },
      [`${ctrlKey}-D`]: function del(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`~~${selected}~~`)
      },
      [`${ctrlKey}-K`]: function italic(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`[${selected}]()`)
      },
      [`${ctrlKey}-E`]: function code(editor) {
        const selected = editor.getSelection()
        editor.replaceSelection(`\`${selected}\``)
      },
      [`${ctrlKey}-.`]: function quote(editor) {
        const selected = editor.getSelection()
        if (!selected) {
          // 获取当前行信息
          const currentLine = editor.getCursor().line
          const lineContent = editor.getLine(currentLine)

          // 判断当前行是否已有引用符号
          if (lineContent.trimStart().startsWith(`> `)) {
            // 如果有引用符号，移除它
            const lineWithoutQuote = lineContent.replace(/^\s*> /, ``)
            editor.replaceRange(
              lineWithoutQuote,
              { line: currentLine, ch: 0 },
              { line: currentLine, ch: lineContent.length },
            )
          }
          else {
            // 如果没有引用符号，添加它
            // 保持原有缩进
            const indentation = lineContent.match(/^\s*/)?.[0]
            const newLine = `${indentation}> ${lineContent.trimStart()}`
            editor.replaceRange(
              newLine,
              { line: currentLine, ch: 0 },
              { line: currentLine, ch: lineContent.length },
            )
          }
          return
        }

        // 处理选中的文本
        const lines = selected.split(`\n`)
        // 为每一行添加或移除引用符号
        const quotedText = lines.map((line) => {
          if (line.trimStart().startsWith(`> `))
            return line.slice(2)
          return `> ${line}`
        }).join(`\n`)

        editor.replaceSelection(quotedText)
      },
      [`${ctrlKey}-1`]: function h1(editor) {
        toggleHeading(editor, 1)
      },
      [`${ctrlKey}-2`]: function h2(editor) {
        toggleHeading(editor, 2)
      },
      [`${ctrlKey}-3`]: function h3(editor) {
        toggleHeading(editor, 3)
      },
      [`${ctrlKey}-4`]: function h4(editor) {
        toggleHeading(editor, 4)
      },
      [`${ctrlKey}-5`]: function h5(editor) {
        toggleHeading(editor, 5)
      },
      [`${ctrlKey}-6`]: function h6(editor) {
        toggleHeading(editor, 6)
      },
      [`${ctrlKey}-U`]: function unorderedList(editor) {
        const selected = editor.getSelection()
        if (!selected) {
          // 获取当前行信息
          const currentLine = editor.getCursor().line
          const lineContent = editor.getLine(currentLine)

          // 判断当前行是否已有列表符号
          if (lineContent.trimStart().startsWith(`- `)) {
            // 如果有列表符号，移除它
            const lineWithoutList = lineContent.replace(/^\s*- /, ``)
            editor.replaceRange(
              lineWithoutList,
              { line: currentLine, ch: 0 },
              { line: currentLine, ch: lineContent.length },
            )
          }
          else {
            // 如果没有列表符号，添加它
            // 保持原有缩进
            const indentation = lineContent.match(/^\s*/)?.[0]
            const newLine = `${indentation}- ${lineContent.trimStart()}`
            editor.replaceRange(
              newLine,
              { line: currentLine, ch: 0 },
              { line: currentLine, ch: lineContent.length },
            )
          }
          return
        }

        // 处理选中的文本
        const lines = selected.split(`\n`)
        // 为每一行添加或移除列表符号
        const listedText = lines.map((line) => {
          if (line.trimStart().startsWith(`- `))
            return line.replace(/^\s*- /, ``)
          return `- ${line}`
        }).join(`\n`)

        editor.replaceSelection(listedText)
      },
      [`${ctrlKey}-O`]: function orderedList(editor) {
        const selected = editor.getSelection()
        if (!selected) {
          // 获取当前行信息
          const currentLine = editor.getCursor().line
          const lineContent = editor.getLine(currentLine)

          // 判断当前行是否已有序号
          if (lineContent.trimStart().match(/^\d+\.\s/)) {
            // 如果有序号，移除它
            const lineWithoutNumber = lineContent.replace(/^\s*\d+\.\s/, ``)
            editor.replaceRange(
              lineWithoutNumber,
              { line: currentLine, ch: 0 },
              { line: currentLine, ch: lineContent.length },
            )
          }
          else {
            // 如果没有序号，添加它
            // 保持原有缩进
            const indentation = lineContent.match(/^\s*/)?.[0]
            const newLine = `${indentation}1. ${lineContent.trimStart()}`
            editor.replaceRange(
              newLine,
              { line: currentLine, ch: 0 },
              { line: currentLine, ch: lineContent.length },
            )
          }
          return
        }

        // 处理选中的文本
        const lines = selected.split(`\n`)
        // 检查是否所有行都已经是有序列表
        const allOrdered = lines.every(line => line.trimStart().match(/^\d+\.\s/))

        // 为每一行添加或移除序号
        const listedText = lines.map((line, index) => {
          if (allOrdered) {
            // 如果所有行都有序号，则移除序号
            return line.replace(/^\s*\d+\.\s/, ``)
          }
          else {
            // 如果不是有序列表，则添加序号
            // 移除已有的序号（如果有的话）后再添加新序号
            const cleanLine = line.replace(/^\s*\d+\.\s/, ``)
            return `${index + 1}. ${cleanLine}`
          }
        }).join(`\n`)

        editor.replaceSelection(listedText)
      },
    },
  })

  editor.value.on(`change`, (e) => {
    clearTimeout(changeTimer.value)
    changeTimer.value = setTimeout(() => {
      onEditorRefresh()
      editorContent.value = e.getValue()
    }, 300)
  })

  // 粘贴上传图片并插入
  editor.value.on(`paste`, (_cm, e) => {
    if (!(e.clipboardData && e.clipboardData.items) || isImgLoading.value) {
      return
    }
    for (let i = 0, len = e.clipboardData.items.length; i < len; ++i) {
      const item = e.clipboardData.items[i]
      if (item.kind === `file`) {
        // 校验图床参数
        const pasteFile = item.getAsFile()!
        const isValid = beforeUpload(pasteFile)
        if (!isValid) {
          continue
        }
        uploadImage(pasteFile)
      }
    }
  })
}

const container = ref(null)

// 工具函数，添加格式
function addFormat(cmd: string | number) {
  (editor.value as any).options.extraKeys[cmd](editor.value)
}

const codeMirrorWrapper = ref<ComponentPublicInstance<typeof ElCol> | null>(null)

// 转换 markdown 中的本地图片为线上图片
// todo 处理事件覆盖
function mdLocalToRemote() {
  const dom = codeMirrorWrapper.value!.$el as HTMLElement

  // 上传 md 中的图片
  const uploadMdImg = async ({ md, list }: { md: { str: string, path: string, file: File }, list: { path: string, file: File }[] }) => {
    const mdImgList = [
      ...(md.str.matchAll(/!\[(.*?)\]\((.*?)\)/g) || []),
    ].filter((item) => {
      return item // 获取所有相对地址的图片
    })
    const root = md.path.match(/.+?\//)![0]
    const resList = await Promise.all<{ matchStr: string, url: string }>(
      mdImgList.map((item) => {
        return new Promise((resolve) => {
          let [, , matchStr] = item
          matchStr = matchStr.replace(/^.\//, ``) // 处理 ./img/ 为 img/ 统一相对路径风格
          const { file }
            = list.find(f => f.path === `${root}${matchStr}`) || {}
          uploadImage(file!, (url) => {
            resolve({ matchStr, url })
          })
        })
      }),
    )
    resList.forEach((item) => {
      md.str = md.str
        .replace(`](./${item.matchStr})`, `](${item.url})`)
        .replace(`](${item.matchStr})`, `](${item.url})`)
    })
    editor.value!.setValue(md.str)
  }

  dom.ondragover = evt => evt.preventDefault()
  dom.ondrop = async (evt: any) => {
    evt.preventDefault()
    for (const item of evt.dataTransfer.items) {
      item.getAsFileSystemHandle().then(async (handle: { kind: string, getFile: () => any }) => {
        if (handle.kind === `directory`) {
          const list = await showFileStructure(handle) as { path: string, file: File }[]
          const md = await getMd({ list })
          uploadMdImg({ md, list })
        }
        else {
          const file = await handle.getFile()
          console.log(`file`, file)
        }
      })
    }
  }

  // 从文件列表中查找一个 md 文件并解析
  async function getMd({ list }: { list: { path: string, file: File }[] }) {
    return new Promise<{ str: string, file: File, path: string }>((resolve) => {
      const { path, file } = list.find(item => item.path.match(/\.md$/))!
      const reader = new FileReader()
      reader.readAsText(file!, `UTF-8`)
      reader.onload = (evt) => {
        resolve({
          str: evt.target!.result as string,
          file,
          path,
        })
      }
    })
  }

  // 转换文件系统句柄中的文件为文件列表
  async function showFileStructure(root: any) {
    const result = []
    let cwd = ``
    try {
      const dirs = [root]
      for (const dir of dirs) {
        cwd += `${dir.name}/`
        for await (const [, handle] of dir) {
          if (handle.kind === `file`) {
            result.push({
              path: cwd + handle.name,
              file: await handle.getFile(),
            })
          }
          else {
            result.push({
              path: `${cwd + handle.name}/`,
            })
            dirs.push(handle)
          }
        }
      }
    }
    catch (err) {
      console.error(err)
    }
    return result
  }
}

onMounted(() => {
  initEditor()
  onEditorRefresh()
  mdLocalToRemote()
})
</script>

<template>
  <div ref="container" class="container flex flex-col">
    <EditorHeader @add-format="addFormat" @format-content="formatContent" @start-copy="startCopy" @end-copy="endCopy" />
    <main class="container-main flex-1">
      <el-row class="container-main-section h-full border-1">
        <ElCol
          ref="codeMirrorWrapper" :span="isShowCssEditor ? 8 : 12" class="codeMirror-wrapper border-r-1" :class="{
            'order-1': !store.isEditOnLeft,
          }"
        >
          <ContextMenu>
            <ContextMenuTrigger>
              <textarea id="editor" type="textarea" placeholder="Your markdown text here." />
            </ContextMenuTrigger>
            <ContextMenuContent class="w-64">
              <ContextMenuItem inset @click="toggleShowUploadImgDialog()">
                上传图片
              </ContextMenuItem>
              <ContextMenuItem inset @click="toggleShowInsertFormDialog()">
                插入表格
              </ContextMenuItem>
              <ContextMenuItem inset @click="resetStyleConfirm()">
                恢复默认样式
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem inset @click="importMarkdownContent()">
                导入 .md 文档
              </ContextMenuItem>
              <ContextMenuItem inset @click="exportEditorContent2MD()">
                导出 .md 文档
              </ContextMenuItem>
              <ContextMenuItem inset @click="exportEditorContent2HTML()">
                导出 .html
              </ContextMenuItem>
              <ContextMenuItem inset @click="formatContent()">
                格式化
                <ContextMenuShortcut>{{ altSign }} + {{ shiftSign }} + F</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </ElCol>
        <ElCol id="preview" ref="preview" :span="isShowCssEditor ? 8 : 12" class="preview-wrapper p-5">
          <div id="output-wrapper" :class="{ output_night: !backLight }">
            <div class="preview border shadow-xl">
              <section id="output" v-html="output" />
              <div v-if="isCoping" class="loading-mask">
                <div class="loading-mask-box">
                  <div class="loading__img" />
                  <span>正在生成</span>
                </div>
              </div>
            </div>
          </div>
        </ElCol>
        <CssEditor />
      </el-row>
    </main>

    <UploadImgDialog @upload-image="uploadImage" />

    <InsertFormDialog />

    <RunLoading />
  </div>
</template>

<style lang="less" scoped>
@import url('../assets/less/app.less');
</style>

<style lang="less" scoped>
.container {
  height: 100vh;
  min-width: 100%;
  padding: 0;
}

.container-main {
  overflow: hidden;
  padding: 20px;
  padding-top: 0;
}

#output-wrapper {
  position: relative;
  user-select: text;
  height: 100%;
}

.loading-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  color: var(--el-text-color-regular);
  background-color: var(--el-bg-color);

  .loading-mask-box {
    position: sticky;
    top: 50%;
    transform: translateY(-50%);

    .loading__img {
      width: 75px;
      height: 75px;
      background: url('../assets/images/favicon.png') no-repeat;
      margin: 1em auto;
      background-size: cover;
    }
  }
}

:deep(.preview-table) {
  border-spacing: 0;
}

.codeMirror-wrapper,
.preview-wrapper {
  height: 100%;
}

.codeMirror-wrapper {
  overflow-x: auto;
}
</style>
