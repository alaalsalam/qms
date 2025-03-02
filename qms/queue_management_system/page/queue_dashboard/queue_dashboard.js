frappe.pages["queue_dashboard"].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Queue List",
		single_column: true,
	});

	// Create HTML structure
	$(wrapper).find(".layout-main-section").html(`
        <div id="queue-dashboard" style="padding: 0 15px;">
            <div id="now_serving" style="padding: 15px 0;">
                <h2>Now Serving Ticket Number: <span id="current_ticket"></span></h2>
                <audio id="ticket_audio" controls></audio>
            </div>
            <div id="queue_list" style="padding: 15px 0;">
                <h3>Queue Call List</h3>
                <table class="table table-bordered" style="padding: 5px 0;">
                    <thead>
                        <tr>
                            <th>Ticket Number</th>
                            <th>Assigned Office</th>
                        </tr>
                    </thead>
                    <tbody id="queue_list_body"></tbody>
                </table>
            </div>
        </div>
    `);

	// Fetch initial queue call data
	fetch_queue_call_data();

	// WebSocket listener for real-time updates
	frappe.realtime.on("queue_call", function (data) {
		document.getElementById("current_ticket").innerText = data.ticket_number;
		let audio = document.getElementById("ticket_audio");
		audio.src = data.audio_file;
		audio.play();

		// Update the queue call list dynamically
		let queue_list_body = document.getElementById("queue_list_body");
		queue_list_body.innerHTML += `
            <tr>
                <td>${data.ticket_number}</td>
                <td>${data.assigned_office}</td>
            </tr>
        `;
	});
};

function fetch_queue_call_data() {
	frappe.call({
		method: "frappe.client.get_list",
		args: {
			doctype: "Queue Call",
			fields: ["ticket_number", "assigned_office"],
			order_by: "creation asc",
		},
		callback: function (r) {
			if (r.message) {
				let queue_list_body = document.getElementById("queue_list_body");
				queue_list_body.innerHTML = "";
				r.message.forEach((ticket) => {
					queue_list_body.innerHTML += `
                        <tr>
                            <td>${ticket.ticket_number}</td>
                            <td>${ticket.assigned_office}</td>cle
                        </tr>
                    `;
				});
			}
		},
	});
}
