import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { AgentsPage } from './features/agents/AgentsPage'
import { AgentDetailPage } from './features/agents/AgentDetailPage'
import { McpPage } from './features/mcp/McpPage'
import { SessionPage } from './features/sessions/SessionPage'
import { SettingsPage } from './features/settings/SettingsPage'

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:agentId" element={<AgentDetailPage />} />
          <Route path="/mcp" element={<McpPage />} />
          <Route path="/sessions/:sessionId" element={<SessionPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
