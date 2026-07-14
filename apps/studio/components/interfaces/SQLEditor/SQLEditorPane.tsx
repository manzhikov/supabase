import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { cn } from 'ui'

import type { useSqlEditorDiff, useSqlEditorPrompt } from './hooks'
import type { MonacoEditorProps } from './MonacoEditor'
import { useSQLEditorContext } from './SQLEditorContext'
import type { useSqlEditorAi } from './useSqlEditorAi'
import ResizableAIWidget from '@/components/ui/AIEditor/ResizableAIWidget'

// Load the monaco editor client-side only (does not behave well server-side)
const MonacoEditor = dynamic(
  () => import('./MonacoEditor').then(({ MonacoEditor }) => MonacoEditor),
  { ssr: false }
)
const DiffEditor = dynamic(
  () => import('../../ui/DiffEditor').then(({ DiffEditor }) => DiffEditor),
  { ssr: false }
)

type SQLEditorPaneProps = {
  id: string
  isLoading: boolean
  os: string | undefined
  snippetName: string
  disablePrettyExplain: boolean
  diff: ReturnType<typeof useSqlEditorDiff>
  prompt: ReturnType<typeof useSqlEditorPrompt>
  ai: ReturnType<typeof useSqlEditorAi>
  onMount: MonacoEditorProps['onMount']
  onRunShortcut: () => void
  onRunExplain: () => void
  prettifyQuery: () => void
  onHasSelection: (hasSelection: boolean) => void
}

export const SQLEditorPane = ({
  id,
  isLoading,
  os,
  snippetName,
  disablePrettyExplain,
  diff,
  prompt,
  ai,
  onMount,
  onRunShortcut,
  onRunExplain,
  prettifyQuery,
  onHasSelection,
}: SQLEditorPaneProps) => {
  const { editorRef, monacoRef, diffEditorRef } = useSQLEditorContext()

  const { isDiffOpen, defaultSqlDiff } = diff
  const { promptState, setPromptState, promptInput, setPromptInput, resetPrompt } = prompt
  const {
    showWidget,
    handleDiffEditorMount,
    handlePrompt,
    acceptAiHandler,
    discardAiHandler,
    isCompletionLoading,
  } = ai

  return (
    <div className="grow overflow-y-auto border-b h-full">
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="animate-spin text-brand" />
        </div>
      ) : (
        <>
          {isDiffOpen && (
            <div className="w-full h-full">
              <DiffEditor
                language="pgsql"
                original={defaultSqlDiff.original}
                modified={defaultSqlDiff.modified}
                onMount={handleDiffEditorMount}
              />
              {showWidget && (
                <ResizableAIWidget
                  editor={diffEditorRef.current!}
                  id="ask-ai-diff"
                  value={promptInput}
                  onChange={setPromptInput}
                  onSubmit={(prompt: string) => {
                    handlePrompt(prompt, {
                      beforeSelection: promptState.beforeSelection,
                      selection: promptState.selection || defaultSqlDiff.modified,
                      afterSelection: promptState.afterSelection,
                    })
                  }}
                  onAccept={acceptAiHandler}
                  onReject={discardAiHandler}
                  onCancel={resetPrompt}
                  isDiffVisible={true}
                  isLoading={isCompletionLoading}
                  startLineNumber={Math.max(0, promptState.startLineNumber)}
                  endLineNumber={promptState.endLineNumber}
                />
              )}
            </div>
          )}
          <div key={id} className="w-full h-full relative">
            <MonacoEditor
              autoFocus
              placeholder={
                !promptState.isOpen && !editorRef.current?.getValue()
                  ? 'Hit ' +
                    (os === 'macos' ? 'CMD+SHIFT+K' : `CTRL+SHIFT+K`) +
                    ' to generate query or just start typing'
                  : ''
              }
              id={id}
              snippetName={snippetName}
              className={cn(isDiffOpen && 'hidden')}
              editorRef={editorRef}
              monacoRef={monacoRef}
              executeQuery={onRunShortcut}
              executeExplainQuery={onRunExplain}
              showExplainAction={!disablePrettyExplain}
              prettifyQuery={prettifyQuery}
              onHasSelection={onHasSelection}
              onMount={onMount}
              onPrompt={({
                selection,
                beforeSelection,
                afterSelection,
                startLineNumber,
                endLineNumber,
              }) => {
                setPromptState((prev) => ({
                  ...prev,
                  isOpen: true,
                  selection,
                  beforeSelection,
                  afterSelection,
                  startLineNumber,
                  endLineNumber,
                }))
              }}
            />
            {editorRef.current && promptState.isOpen && !isDiffOpen && (
              <ResizableAIWidget
                editor={editorRef.current}
                id="ask-ai"
                value={promptInput}
                onChange={setPromptInput}
                onSubmit={(prompt: string) => {
                  handlePrompt(prompt, {
                    beforeSelection: promptState.beforeSelection,
                    selection: promptState.selection,
                    afterSelection: promptState.afterSelection,
                  })
                }}
                onCancel={resetPrompt}
                isDiffVisible={false}
                isLoading={isCompletionLoading}
                startLineNumber={Math.max(0, promptState.startLineNumber)}
                endLineNumber={promptState.endLineNumber}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
