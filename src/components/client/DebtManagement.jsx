// src/components/debt/DebtManagement.jsx
import { useEffect, useState } from 'react';
import api from '../../services/axios'; // Importo axios instance (si në shembujt e tu)
import { getAllClients, getClientDebt1, getClientPayments, getTotalDebts } from '../../services/request/clientService'; // Import services

const DebtManagement = () => {
  const [totalDebts, setTotalDebts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDebt, setClientDebt] = useState(0); // Tani kjo do të jetë remainingDebt
  const [totalUnpaid, setTotalUnpaid] = useState(0); // Shtuar: Borxhi fillestar i papaguar
  const [totalPaid, setTotalPaid] = useState(0);
  const [payments, setPayments] = useState([]);
  const [notification, setNotification] = useState(null);

  // Shtesa për modal-in e pagesës
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');

  // Ngarko borxhin total fillimisht
  // useEffect(() => {
  //   fetchTotalDebts();
  // }, []);

  // const fetchTotalDebts = async () => {
  //   try {
  //     const data = await getTotalDebts();
  //     setTotalDebts(data.totalUnpaid || 0);
  //   } catch (error) {
  //     console.error('Gabim gjatë ngarkimit të borxhit total:', error);
  //   }
  // };

  const fetchClients = async (query) => {
    try {
      const data = await getAllClients(query);  // Dërgo search në backend
      setClients(data);
    } catch (error) {
      console.error('Gabim gjatë kërkimit të klientëve:', error);
      showNotification('error', 'Gabim gjatë kërkimit të klientëve');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Kërko kur ndryshon query (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectClient = async (clientId) => {
    try {
      // Përdor endpoint-in e ri: getClientDebt1 (që kthen totalUnpaid, totalPaid, remainingDebt)
      const debtData = await getClientDebt1(clientId);
      setTotalUnpaid(debtData.totalUnpaid || 0);
      setTotalPaid(debtData.totalPaid || 0);
      setClientDebt(debtData.remainingDebt || 0); // Kjo është mbetja e vërtetë

      const paymentsData = await getClientPayments(clientId);
      setPayments(paymentsData.payments || []);

      // Vendos klientin e zgjedhur (nga clients state)
      const selected = clients.find(c => c.id === clientId);
      setSelectedClient(selected);
    } catch (error) {
      console.error('Gabim gjatë ngarkimit të detajeve:', error);
      showNotification('error', 'Gabim gjatë ngarkimit të detajeve të klientit');
    }
  };

  const clearSelection = () => {
    setSelectedClient(null);
    setClientDebt(0);
    setTotalUnpaid(0);
    setTotalPaid(0);
    setPayments([]);
  };

  // Funksion për pagesë (thirret endpoint-in POST)
  const handlePayDebt = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      showNotification('error', 'Futi një shumë të vlefshme!');
      return;
    }
    if (parseFloat(payAmount) > clientDebt) { // Përdor remainingDebt si kufi
      showNotification('error', 'Shuma nuk mund të jetë më e madhe se borxhi i mbetur!');
      return;
    }
    try {
      const response = await api.post(`/clients/${selectedClient.id}/pay`, {
        amount: parseFloat(payAmount),
        paymentMethod: payMethod
      });
      showNotification('success', `Pagesa e ${payAmount} € u krye me sukses!`);
      setShowPayModal(false);
      setPayAmount('');
      setPayMethod('CASH');
      // Rifresko detajet automatikisht duke thirrur sërish getClientDebt1
      handleSelectClient(selectedClient.id);
    } catch (error) {
      console.error('Gabim gjatë pagesës:', error);
      showNotification('error', error.response?.data?.message || 'Gabim gjatë pagesës!');
    }
  };

  // Mbyll modal-in e pagesës
  const closePayModal = () => {
    setShowPayModal(false);
    setPayAmount('');
    setPayMethod('CASH');
  };

  return (
    <div className="debt-management">
      <h2>Menaxho Borgjet</h2>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? '✓' : '✕'} {notification.message}
        </div>
      )}

    
      <input
        type="text"
        placeholder="Kërko klient (emër ose telefon)..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px' }}
      />

      <table className="clients-search-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Emri</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Telefoni</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Veprim</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{client.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{client.phone}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{client.email}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button onClick={() => handleSelectClient(client.id)} style={{ padding: '5px 10px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '3px' }}>
                  Shiko Detaje
                </button>
              </td>
            </tr>
          ))}
          {clients.length === 0 && searchQuery && (
            <tr>
              <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Asnjë klient nuk u gjet.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Detajet e klientit të zgjedhur */}
      {selectedClient && (
        <div className="client-details" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <h3>Detajet për klientin {selectedClient.name}</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Borxhi Total i Papaguar:</strong> <span style={{ color: 'orange' }}>{totalUnpaid.toFixed(2)} €</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Total i Paguar:</strong> {totalPaid.toFixed(2)} €
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Borxhi i Mbetur:</strong> <span style={{ color: 'red' }}>{clientDebt.toFixed(2)} €</span>
          </div>
          <button 
            onClick={() => setShowPayModal(true)} 
            disabled={clientDebt <= 0}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: clientDebt > 0 ? '#4caf50' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              marginBottom: '20px',
              cursor: clientDebt > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            Paguaj Borgj
          </button>
          <button onClick={clearSelection} style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px', marginBottom: '20px' }}>
            Mbyll Detajet
          </button>
          {payments.length > 0 ? (
            <table className="payments-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Data e Pagesës</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Shuma (€)</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Metoda</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.amount.toFixed(2)}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.method || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#999' }}>Nuk ka pagesa ende për këtë klient.</p>
          )}
        </div>
      )}

      {/* Modal-i për pagesë */}
      {showPayModal && selectedClient && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            width: '300px' 
          }}>
            <h4>Paguaj për {selectedClient.name}</h4>
            <p style={{ color: 'red', marginBottom: '10px' }}>Borxhi i mbetur: {clientDebt.toFixed(2)} €</p>
            <input
              type="number"
              placeholder="Shuma (€)"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              step="0.01"
              min="0.01"
              max={clientDebt}
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginBottom: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '5px' 
              }}
            />
            <select 
              value={payMethod} 
              onChange={(e) => setPayMethod(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginBottom: '20px', 
                border: '1px solid #ccc', 
                borderRadius: '5px' 
              }}
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Kartë</option>
              <option value="TRANSFER">Transfertë</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={closePayModal} 
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  backgroundColor: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px' 
                }}
              >
                Anulo
              </button>
              <button 
                onClick={handlePayDebt} 
                disabled={!payAmount || parseFloat(payAmount) <= 0}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  backgroundColor: (!payAmount || parseFloat(payAmount) <= 0) ? '#ccc' : '#4caf50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px' 
                }}
              >
                Paguaj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtManagement;