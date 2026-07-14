import { Loader2 } from 'lucide-react'

import { UtilityPanel } from './UtilityPanel/UtilityPanel'

type SQLEditorResultsProps = {
  isLoading: boolean
  id: string
  isExecuting: boolean
  isExplainExecuting: boolean
  isDisabled: boolean
  executeExplainQuery: () => void
  showExplainTab: boolean
  onDebug: () => void
  buildDebugPrompt: () => string
  activeTab: string
  onActiveTabChange: (tab: string) => void
}

export const SQLEditorResults = ({
  isLoading,
  id,
  isExecuting,
  isExplainExecuting,
  isDisabled,
  executeExplainQuery,
  showExplainTab,
  onDebug,
  buildDebugPrompt,
  activeTab,
  onActiveTabChange,
}: SQLEditorResultsProps) => {
  return isLoading ? (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="animate-spin text-brand" />
    </div>
  ) : (
    <UtilityPanel
      id={id}
      isExecuting={isExecuting}
      isExplainExecuting={isExplainExecuting}
      isDisabled={isDisabled}
      executeExplainQuery={executeExplainQuery}
      showExplainTab={showExplainTab}
      onDebug={onDebug}
      buildDebugPrompt={buildDebugPrompt}
      activeTab={activeTab}
      onActiveTabChange={onActiveTabChange}
    />
  )
}
