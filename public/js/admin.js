async function loadStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        document.getElementById('revenueVal').innerText = '₹' + data.revenue;
        document.getElementById('bookingsVal').innerText = data.bookings;
        document.getElementById('centersVal').innerText = data.centers;
    } catch (e) { console.error(e); }
}

async function loadLogs() {
    try {
        const res = await fetch('/api/admin/logs');
        const data = await res.json();
        const container = document.getElementById('chatLogs');
        container.innerHTML = data.logs.map(log => `
            <div class="log-item">
                <span class="log-time">${log.time}</span>
                <div class="log-msg">
                    <strong class="log-type-${log.type}">${log.user}:</strong> ${log.message}
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function cancelBooking(id) {
    if(!confirm('Are you sure you want to cancel this booking?')) return;
    
    await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
    });
    refreshAll();
}

async function loadBookings() {
    const tbody = document.querySelector('#bookingsTable tbody');
    tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

    try {
        const response = await fetch('/api/admin/bookings');
        const data = await response.json();

        tbody.innerHTML = '';
        data.bookings.forEach(booking => {
            const tr = document.createElement('tr');
            const canCancel = booking.status !== 'CANCELLED';
            tr.innerHTML = `
                <td>#${booking.id}</td>
                <td>${booking.user_name || 'Unknown'} <br><small>${booking.user_phone}</small></td>
                <td><strong>${booking.center_name}</strong><br><small>${booking.service_name}</small></td>
                <td>${new Date(booking.booking_time).toLocaleString()}</td>
                <td><span class="status status-${booking.status}">${booking.status}</span></td>
                <td>
                    ${canCancel ? `<button class="action-btn" onclick="cancelBooking(${booking.id})">Cancel</button>` : '-'}
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (data.bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No bookings found.</td></tr>';
        }

    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="color:red">Failed to load data. Ensure server is running.</td></tr>';
    }
}

function refreshAll() {
    loadStats();
    loadBookings();
    loadLogs();
}

// Load on start
refreshAll();
