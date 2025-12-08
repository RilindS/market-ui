import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import { getReportsByDate, getReportsByRange, getTodayReports } from '../../services/request/orderService';
import './ReportsPage.scss'; // Import SCSS

const ReportsPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('today');
  const today = new Date().toISOString().split('T')[0]; // Datë dinamike e sotme
  const [singleDate, setSingleDate] = useState(today);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reports, setReports] = useState({ content: [], totalElements: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchReports = async (page = 0) => {
    setLoading(true);
    try {
      let data;
      if (mode === 'today') {
        data = await getTodayReports(page, pageSize);
      } else if (mode === 'single') {
        data = await getReportsByDate(singleDate, page, pageSize);
      } else if (mode === 'range') {
        if (!fromDate || !toDate) return;
        data = await getReportsByRange(fromDate, toDate, page, pageSize);
      }
      setReports(data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Gabim në fetch:', error);
      alert('Gabim në ngarkimin e raporteve.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(0);
  }, [mode, singleDate, fromDate, toDate]);

  const handlePageChange = (event) => {
    fetchReports(event.selected);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setCurrentPage(0);
    if (newMode === 'today') {
      setSingleDate(today);
      setFromDate('');
      setToDate('');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Duke ngarkuar raportet...</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="page-wrapper">
        <h1 className="page-title">Raportet e Shitjeve</h1>

        {/* Zgjedhja e Modës */}
        <div className="mode-section">
          <div className="mode-buttons">
            <button
              onClick={() => handleModeChange('today')}
              className={mode === 'today' ? 'active' : ''}
            >
              Sot
            </button>
            <button
              onClick={() => handleModeChange('single')}
              className={mode === 'single' ? 'active' : ''}
            >
              Datë e Caktuar
            </button>
            <button
              onClick={() => handleModeChange('range')}
              className={mode === 'range' ? 'active' : ''}
            >
              Periudhë
            </button>
          </div>

          {/* Input-et për Datat */}
          {mode === 'single' && (
            <div className="date-inputs">
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
              />
              <button onClick={() => fetchReports(0)}>
                Ngarko
              </button>
            </div>
          )}

          {mode === 'range' && (
            <div className="date-inputs">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <span>deri në</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              <button
                onClick={() => fetchReports(0)}
                disabled={!fromDate || !toDate}
              >
                Ngarko
              </button>
            </div>
          )}
        </div>

        {/* Tabela e Raporteve */}
        {reports.content.length > 0 ? (
          <>
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Datë</th>
                    <th>Status</th>
                    <th>User</th>
                    <th>Total (€)</th>
                    <th>Items</th>
                    <th>Veprim</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.content.map((report) => (
                    <tr key={report.id}>
                      <td>{report.id || 'N/A'}</td>
                      <td>
                        {report.orderDate ? new Date(report.orderDate).toLocaleDateString('sq-AL') : 'N/A'}
                      </td>
                      <td className="status-badge">
                        <span className={
                          report.status === 'COMPLETED' 
                            ? 'completed' 
                            : report.status === 'PENDING' 
                              ? 'pending' 
                              : 'default'
                        }>
                          {report.status || 'N/A'}
                        </span>
                      </td>
                      <td>{report.userName || 'N/A'}</td>
                      <td className="revenue">
                        {report.totalAmount != null ? report.totalAmount.toFixed(2) : '0.00'}
                      </td>
                      <td>
                        <ul>
                          {report.items && report.items.length > 0 ? (
                            report.items.map((item, idx) => (
                              <li key={idx}>
                                <strong>{item.productName || 'N/A'}:</strong> {item.quantity || 0} x{' '}
                                {item.price != null ? item.price.toFixed(2) : '0.00'} ={' '}
                                {item.subtotal != null ? item.subtotal.toFixed(2) : '0.00'} €
                              </li>
                            ))
                          ) : (
                            <li className="text-xs text-gray-500 italic">Asnjë item</li>
                          )}
                        </ul>
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/order/${report.id}`)}
                          className="details-btn"
                        >
                          Shiko Detajet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {reports.totalElements > pageSize && (
              <div className="pagination-container">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="> Next"
                  onPageChange={handlePageChange}
                  pageRangeDisplayed={5}
                  pageCount={Math.ceil(reports.totalElements / pageSize)}
                  previousLabel="Prev <"
                  renderOnZeroPageCount={null}
                  forcePage={currentPage}
                  containerClassName="pagination"
                  pageClassName="page-item"
                  activeClassName="active"
                  disabledClassName="disabled"
                />
              </div>
            )}

            {/* Summary i Shkurtër i Përgjithshëm */}
            <div className="summary-card">
              <h3>Përmbledhje:</h3>
              <div className="summary-grid">
                <div><strong>Total Orders:</strong> {reports.totalElements}</div>
                <div><strong>Total Items:</strong> {reports.content.reduce((sum, r) => sum + (r.items ? r.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0), 0)}</div>
                <div><strong>Total Revenue:</strong> {reports.content.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toFixed(2)} €</div>
                <div><strong>Average per Order:</strong> {(reports.totalElements > 0 ? reports.content.reduce((sum, r) => sum + (r.totalAmount || 0), 0) / reports.totalElements : 0).toFixed(2)} €</div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>Nuk ka të dhëna për këtë periudhë ose datë.</p>
            <p>Provo një datë tjetër ose periudhë më të gjerë.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;