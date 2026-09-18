import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RemoteTerminalPage from './pages/RemoteTerminalPage';
import MessagePage from './pages/MessagePage';
import WordMaintenancePage from './pages/WordMaintenancePage';
import ElementMaintenancePage from './pages/ElementMaintenancePage';
import LookupPage from './pages/LookupPage';
import PDFReportPage from './pages/PDFReportPage';
import PDFImportPage from './pages/PDFImportPage';
import MDBGenerationPage from './pages/MDBGenerationPage';
import DBGenerationPage from './pages/DBGenerationPage';
import type { NavPage } from './types';

export default function App() {
  const [page, setPage] = useState<NavPage>('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'remote-terminal': return <RemoteTerminalPage />;
      case 'message': return <MessagePage />;
      case 'word': return <WordMaintenancePage />;
      case 'element': return <ElementMaintenancePage />;
      case 'lookup': return <LookupPage />;
      case 'pdf-report': return <PDFReportPage />;
      case 'pdf-import': return <PDFImportPage />;
      case 'mdb-generation': return <MDBGenerationPage />;
      case 'db-generation': return <DBGenerationPage />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  );
}
