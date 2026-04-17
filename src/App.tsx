import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { invoke } from '@tauri-apps/api/core'
import { open, save } from '@tauri-apps/plugin-dialog'

const UNTITLED_LABEL = 'Untitled'

function countWords(text: string) {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function syncScrollPosition(source: HTMLElement, target: HTMLElement) {
  const sourceMax = source.scrollHeight - source.clientHeight
  const targetMax = target.scrollHeight - target.clientHeight

  if (sourceMax <= 0 || targetMax <= 0) {
    target.scrollTop = 0
    return
  }

  const ratio = source.scrollTop / sourceMax
  target.scrollTop = ratio * targetMax
}

function App() {
  const [content, setContent] = useState('')
  const [filePath, setFilePath] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('Ready')
  const [isBusy, setIsBusy] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLElement>(null)
  const syncingPaneRef = useRef<'editor' | 'preview' | null>(null)

  const wordCount = countWords(content)
  const characterCount = content.length

  async function createNewDocument() {
    setContent('')
    setFilePath(null)
    setStatusMessage('New document created')
  }

  async function openDocument() {
    try {
      setIsBusy(true)
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Markdown and Text',
            extensions: ['md', 'txt']
          }
        ]
      })

      if (!selected || Array.isArray(selected)) {
        setStatusMessage('Open cancelled')
        return
      }

      const nextContent = await invoke<string>('read_file', { path: selected })
      setContent(nextContent)
      setFilePath(selected)
      setStatusMessage(`Opened ${selected}`)
    } catch (error) {
      setStatusMessage(
        `Failed to open file: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function saveDocument() {
    try {
      setIsBusy(true)
      let targetPath = filePath

      if (!targetPath) {
        const selected = await save({
          filters: [
            {
              name: 'Markdown and Text',
              extensions: ['md', 'txt']
            }
          ],
          defaultPath: 'untitled.md'
        })

        if (!selected) {
          setStatusMessage('Save cancelled')
          return
        }

        targetPath = selected
      }

      await invoke<boolean>('write_file', {
        path: targetPath,
        content
      })

      setFilePath(targetPath)
      setStatusMessage(`Saved to ${targetPath}`)
    } catch (error) {
      setStatusMessage(
        `Failed to save file: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setIsBusy(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const hasModifier = event.ctrlKey || event.metaKey

      if (!hasModifier) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 's') {
        event.preventDefault()
        void saveDocument()
      }

      if (key === 'o') {
        event.preventDefault()
        void openDocument()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [content, filePath])

  useEffect(() => {
    if (!editorRef.current || !previewRef.current) {
      return
    }

    syncScrollPosition(editorRef.current, previewRef.current)
  }, [content])

  function syncPanes(sourcePane: 'editor' | 'preview') {
    const editor = editorRef.current
    const preview = previewRef.current

    if (!editor || !preview) {
      return
    }

    if (syncingPaneRef.current && syncingPaneRef.current !== sourcePane) {
      return
    }

    syncingPaneRef.current = sourcePane

    if (sourcePane === 'editor') {
      syncScrollPosition(editor, preview)
    } else {
      syncScrollPosition(preview, editor)
    }

    requestAnimationFrame(() => {
      if (syncingPaneRef.current === sourcePane) {
        syncingPaneRef.current = null
      }
    })
  }

  return (
    <div className="flex h-screen flex-col bg-canvas text-ink">
      <header className="toolbar">
        <div className="toolbar-actions">
          <button
            className="toolbar-button"
            onClick={() => void createNewDocument()}
            type="button"
          >
            New
          </button>
          <button
            className="toolbar-button"
            onClick={() => void openDocument()}
            type="button"
          >
            Open
          </button>
          <button
            className="toolbar-button toolbar-button-primary"
            onClick={() => void saveDocument()}
            type="button"
          >
            Save
          </button>
        </div>
        <div className="toolbar-meta">
          <span className="status-text">{isBusy ? 'Working' : statusMessage}</span>
          <span className="file-path" title={filePath ?? UNTITLED_LABEL}>
            {filePath ?? UNTITLED_LABEL}
          </span>
        </div>
      </header>

      <main className="workspace">
        <section className="editor-pane">
          <div className="pane-heading">Source</div>
          <textarea
            className="editor"
            onChange={(event) => setContent(event.target.value)}
            onScroll={() => syncPanes('editor')}
            placeholder="Write your Markdown here..."
            ref={editorRef}
            spellCheck={false}
            value={content}
          />
        </section>

        <section className="preview-pane">
          <div className="pane-heading">Rendered Markdown</div>
          <article
            className="preview"
            onScroll={() => syncPanes('preview')}
            ref={previewRef}
          >
            {content ? (
              <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            ) : (
              <div className="empty-state">
                Start typing on the left to see a live Markdown preview.
              </div>
            )}
          </article>
        </section>
      </main>

      <footer className="status-bar">
        <span>Words: {wordCount}</span>
        <span>Characters: {characterCount}</span>
      </footer>
    </div>
  )
}

export default App
