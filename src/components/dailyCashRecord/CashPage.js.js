// src/components/CashPage.js (përditësuar)
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../services/auth/AuthContext';
import { closeDay, getOpeningBalance, getTotalDebtPaymentsToday, getTotalPurchases, getTotalSales } from '../../services/request/dailyCashRecordService';
const CashPage = () => {
    const { user, loading: authLoading } = useContext(AuthContext);  // Merr user nga context
    const [opening, setOpening] = useState(0);
    const [sales, setSales] = useState(0);
    const [purchases, setPurchases] = useState(0);
    const [loading, setLoading] = useState(true);
    const [debtPayments, setDebtPayments] = useState(0);


    useEffect(() => {
        if (authLoading) return;  // Presa derisa auth të ngarkohet
        if (!user) {
            alert('Duhet të kyçesh për të parë raportin!');
            return;
        }
        fetchData();
    }, [authLoading, user]);  // Shto dependencies

    const fetchData = async () => {
    try {
        setLoading(true);
        const [openingRes, salesRes, purchasesRes, debtPaymentsRes] = await Promise.all([
            getOpeningBalance(),
            getTotalSales(),
            getTotalPurchases(),
            getTotalDebtPaymentsToday()
        ]);

        setOpening(openingRes);
        setSales(salesRes);
        setPurchases(purchasesRes);
        setDebtPayments(debtPaymentsRes);

    } catch (error) {
        console.error('Gabim në të dhëna:', error);
    } finally {
        setLoading(false);
    }
};


    const handleCloseDay = async () => {
        if (!user) {
            alert('Duhet të kyçesh për të mbyllur ditën!');
            return;
        }

        const closingInput = prompt('Fut gjendjen finale të kasës (p.sh. 20000.00):');
        if (!closingInput || isNaN(closingInput)) {
            alert('Input i pavlefshëm!');
            return;
        }
        try {
            const response = await closeDay(closingInput, user.id);  // Dërgo closing dhe user.id
            alert(`Dita u mbyll! Gjendja finale: ${response.closingBalance.toFixed(2)} (për nesër: fillestare)`);
            fetchData();  // Rifresko
        } catch (error) {
            alert('Gabim në mbyllje: ' + error.response?.data?.message || error.message);
        }
    };

    if (authLoading || loading) return <div>Loading...</div>;
    if (!user) return <div>Ju lutemi, kyçuni në sistem.</div>;

    return (
        <div className="cash-page" style={{ padding: '20px' }}>
            <h2>Raporti i Kacës për ditën e sotme  - User: {user.firstName || user.id}</h2>  {/* Opsionale: Shfaq user */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>Elementi</th>
                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>Shuma (€)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>Gjendja Fillestare</td>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{opening.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>Total Shitje</td>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{sales.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>Total Blerje</td>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{purchases.toFixed(2)}</td>
                    </tr>
                    {/* <tr>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>Gjendja aktuale e kacës</td>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{(opening + sales + debtPayments).toFixed(2)}</td>
                    </tr> */}
                    <tr>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>Pagesat e Borgjeve Sot</td>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{debtPayments.toFixed(2)}</td>
                    </tr>

                </tbody>
            </table>
            <button 
                onClick={handleCloseDay} 
                style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Perfundo Diten
            </button>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
                Pas mbylljes, gjendja finale bëhet fillestare për ditën e nesërme.
            </p>
        </div>
    );
};

export default CashPage;