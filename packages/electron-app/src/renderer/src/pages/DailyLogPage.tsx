import DailyView from '@renderer/components/DailyView/DailyView'

// The "Daily Log" nav destination is just a default entry point into the
// same Daily view used everywhere else (e.g. opening a Daily via Collections) —
// it lands on the most recent Daily rather than a specific one.
function DailyLogPage() {
  return <DailyView />
}

export default DailyLogPage
