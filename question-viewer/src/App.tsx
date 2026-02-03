import { useState, useMemo, useEffect } from 'react';
import { QUESTIONS_EN as QUESTIONS } from '../../i18n/questions/en';
import './index.css';

function App() {
  const [allQuestions, setAllQuestions] = useState([...QUESTIONS]);
  const [currentPage, setCurrentPage] = useState(0);
  const [batchText, setBatchText] = useState("");
  const [showToast, setShowToast] = useState(false);
  const pageSize = 20;

  const totalPages = Math.ceil(allQuestions.length / pageSize);

  // Update batch text when page changes or allQuestions is updated
  useEffect(() => {
    const start = currentPage * pageSize;
    const currentQuestions = allQuestions.slice(start, start + pageSize);
    setBatchText(currentQuestions.map(q => JSON.stringify(q, null, 4)).join(',\n'));
  }, [currentPage, allQuestions]);

  const fullContent = useMemo(() => {
    return allQuestions.map(q => JSON.stringify(q, null, 4)).join(',\n');
  }, [allQuestions]);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateBatch = () => {
    try {
      // Wrap in brackets to make it a valid JSON array for parsing
      const parsedBatch = JSON.parse(`[${batchText}]`);
      const updatedList = [...allQuestions];
      const start = currentPage * pageSize;

      // Replace the items in the original list
      updatedList.splice(start, Math.min(pageSize, updatedList.length - start), ...parsedBatch);
      setAllQuestions(updatedList);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (e) {
      alert("Invalid JSON format! Please ensure each object is separated by a comma.");
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const downloadFullList = () => {
    const blob = new Blob([fullContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_questions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Bamboozle Question Exporter</h1>
        <p className="subtitle">Extracted from en.ts • {allQuestions.length} total questions</p>
      </header>

      <div className="controls">
        <div className="pagination">
          <button
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentPage === 0}
          >
            Previous 20
          </button>
          <span className="page-info">
            Batch {currentPage + 1} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
          >
            Next 20
          </button>
        </div>

        <div className="action-group">
          <button className="btn btn-secondary" onClick={() => copyToClipboard(fullContent)}>
            Copy Full List
          </button>
          <button className="btn btn-secondary" onClick={downloadFullList}>
            Download Full
          </button>
          <button className="btn btn-save" onClick={handleUpdateBatch}>
            Save Changes to Batch
          </button>
          <button className="btn" onClick={() => copyToClipboard(batchText)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Batch
          </button>
        </div>
      </div>

      <div className="json-container">
        <div className="preview-label" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Questions {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, allQuestions.length)}
        </div>
        <textarea
          className="json-editor"
          value={batchText}
          onChange={(e) => setBatchText(e.target.value)}
          spellCheck={false}
        />
      </div>

      {showToast && (
        <div className="success-toast">
          Action successful!
        </div>
      )}
    </div>
  );
}

export default App;
