import { useEffect, useState } from "react";
import { getCashRecords } from "../../services/request/dailyCashRecordService";

const CashRecordsPage = () => {

    const [records, setRecords] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState("");

    const [loading, setLoading] = useState(true);


    const loadRecords = async () => {
        try {
            setLoading(true);

            const response = await getCashRecords(page, 30, year, month);

            setRecords(response.content);
            setTotalPages(response.totalPages);

        } catch (err) {
            console.error("Gabim:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadRecords();
    }, [page, year, month]);


    return (
        <div style={{ padding: "20px" }}>
            <h2>Raportet Ditore të Kasës</h2>

            {/* FILTERS */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">-- Muaji --</option>
                    <option value="1">Janar</option>
                    <option value="2">Shkurt</option>
                    <option value="3">Mars</option>
                    <option value="4">Prill</option>
                    <option value="5">Maj</option>
                    <option value="6">Qershor</option>
                    <option value="7">Korrik</option>
                    <option value="8">Gusht</option>
                    <option value="9">Shtator</option>
                    <option value="10">Tetor</option>
                    <option value="11">Nëntor</option>
                    <option value="12">Dhjetor</option>
                </select>

                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ width: "100px" }}
                    placeholder="Viti"
                />
            </div>

            {/* TABLE */}
            {loading ? (
                <div>Loading…</div>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f0f0f0" }}>
                            <th style={th}>Data</th>
                            <th style={th}>Fillestare</th>
                            <th style={th}>Shitje</th>
                            <th style={th}>Blerje</th>
                            <th style={th}>Mbyllje</th>
                            <th style={th}>Borgje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r, i) => (
                            <tr key={i}>
                                <td style={td}>{r.date}</td>
                                <td style={td}>{r.openingBalance.toFixed(2)}</td>
                                <td style={td}>{r.totalSales.toFixed(2)}</td>
                                <td style={td}>{r.totalPurchases.toFixed(2)}</td>
                                <td style={td}>{r.closingBalance.toFixed(2)}</td>
                                <td style={td}>{r.debtPayments.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* PAGINATION */}
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                >Previous</button>

                <span>Faqja {page + 1} / {totalPages}</span>

                <button
                    disabled={page + 1 === totalPages}
                    onClick={() => setPage(page + 1)}
                >Next</button>
            </div>

        </div>
    );
};

const th = { border: "1px solid #ddd", padding: "8px" };
const td = { border: "1px solid #ddd", padding: "8px" };

export default CashRecordsPage;
