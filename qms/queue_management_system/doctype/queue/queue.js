// Copyright (c) 2025, Samuael Ketema and contributors
// For license information, please see license.txt

frappe.ui.form.on("Queue", {
	refresh(frm) {
		// Add a custom print button
		frm.add_custom_button(__("Print Ticket"), function () {
			// Custom print function
			printTicket(frm);
		}).addClass("btn-primary");
	},
});

async function printTicket(frm) {
	// Fetch the number of people ahead in the queue
	let peopleAhead = await getPeopleAhead(frm);

	// Get the site URL dynamically (replace localhost:8000 with the actual site URL)
	let siteUrl = window.location.origin; // This will get the current site URL (e.g., https://yourdomain.com)

	// Generate a QR code using the site URL and ticket number
	let qrCodeData = `${siteUrl}/ticket/${frm.doc.name}`;
	let qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
		qrCodeData
	)}`;

	let appName = frappe.boot.sysdefaults.qms;

	// Create a custom print format
	let print_format = frappe.render_template("print_ticket", {
		doc: frm.doc,
		data: {
			title: appName || "Queue Managemnt System", // Use the app name from Frappe metadata
			qrCodeUrl: qrCodeUrl, // Pass the QR code URL to the template
			peopleAhead: peopleAhead, // Pass the number of people ahead
		},
	});

	// Open the print dialog
	let print_window = window.open("", "Print Ticket");
	print_window.document.write(`
        <html>
            <head>
                <title>${appName} - Print Ticket</title> <!-- Use the app name in the print title -->
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f4;
                        color: #333;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .ticket-container {
                        background-color: #fff;
                        border: 1px solid #ddd;
                        border-radius: 12px;
                        padding: 30px;
                        width: 400px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        text-align: center;
                    }
                    .ticket-header {
                        border-bottom: 2px solid #eee;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .ticket-header h1 {
                        font-size: 28px;
                        margin: 0;
                        color: #007bff;
                    }
                    .ticket-header h2 {
                        font-size: 20px;
                        margin: 10px 0 0;
                        color: #555;
                    }
                    .ticket-body {
                        text-align: left;
                        margin-bottom: 20px;
                    }
                    .ticket-body p {
                        font-size: 16px;
                        margin: 15px 0;
                    }
                    .ticket-qr {
                        margin: 20px 0;
                    }
                    .ticket-qr img {
                        width: 150px;
                        height: 150px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 5px;
                        background-color: #f9f9f9;
                    }
                    .ticket-footer {
                        margin-top: 20px;
                        padding-top: 20px;
                        border-top: 2px solid #eee;
                        font-size: 14px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                ${print_format}
            </body>
        </html>
    `);
	print_window.document.close();
	print_window.print();
}

// Function to get the number of people ahead in the queue
async function getPeopleAhead(frm) {
	let filters = {
		service: frm.doc.service,
		status: "Waiting",
		date: ["<=", frm.doc.date],
		time: ["<", frm.doc.time],
	};

	let queues = await frappe.call({
		method: "frappe.client.get_list",
		args: {
			doctype: "Queue",
			filters: filters,
			fields: ["name"],
			order_by: "date, time",
		},
	});

	return queues.message.length;
}

// Define the print template
frappe.templates["print_ticket"] = `
    <div class="ticket-container">
        <div class="ticket-header">
            <h1>{{ data.title }}</h1>
        </div>
        <div class="ticket-body">
            <p><strong>Ticket Number:</strong> {{ doc.name }}</p>
            <p><strong>Date:</strong> {{ doc.date }}</p>
            <p><strong>Time:</strong> {{ doc.time }}</p>
            <p><strong>People Ahead:</strong> {{ data.peopleAhead }}</p>
        </div>
        <div class="ticket-qr">
            <img src="{{ data.qrCodeUrl }}" alt="QR Code">
        </div>
    </div>
`;
