import TopBar from '../components/board/TopBar'
import ToolBar from '../components/board/ToolBar'
import PropertiesPanel from '../components/board/PropertiesPanel'
import WhiteboardCanvas from '../components/board/WhiteboardCanvas'

export default function Board() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ToolBar />
        <WhiteboardCanvas />
        <PropertiesPanel />
      </div>
    </div>
  )
}
