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
	let deptinfo = await getDeptInfo(frm);

	// Get the site URL dynamically
	let siteUrl = window.location.origin;

	// Generate a QR code using the ticket number
	let qrCodeData = `${siteUrl}/ticket/${frm.doc.name}`;
	let qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
		qrCodeData
	)}`;

	let appName = frappe.boot.sysdefaults.qms || "Queue Management System";

	// Open a new print window
	let print_window = window.open("", "Print Ticket");
	print_window.document.write(`
        <html>
            <head>
                <title>${appName} - Print Ticket</title>
                <style>
                    body {
                        font-family: 'Noto Sans Ethiopic', Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f4;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        text-align: center;
                    }
                    .ticket-container {
                        background-color: #fff;
                        border: 2px solid #000;
                        border-radius: 12px;
                        padding: 20px;
                        width: 450px;
                        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
                        text-align: center;
                    }
                    .ticket-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-bottom: 10px;
                        border-bottom: 2px dashed #000;
                        margin-bottom: 15px;
                    }
                    .ticket-header h1 {
                        font-size: 24px;
                        margin: 0;
                    }
                    .logo {
                        width: 50px;
                        height: 50px;
                        background: url('${
							frm.doc.logo || "/path-to-default-logo.png"
						}') no-repeat center;
                        background-size: contain;
                    }
                    .ticket-body {
                        font-size: 20px;
                        text-align: center;
                    }
                    .ticket-body p {
                        margin: 8px 0;
                    }
                    .highlight {
                        font-weight: bold;
                        font-size: 26px;
                        color: #000;
                        text-align: center;
                    }
                    .qr-code {
                        margin-top: 10px;
                        text-align: center;
                    }
                    .qr-code img {
                        width: 120px;
                        height: 120px;
                        border: 1px solid #ddd;
                        padding: 5px;
                        background-color: #fff;
                    }
                    .ticket-footer {
                        margin-top: 15px;
                        padding-top: 10px;
                        border-top: 2px dashed #000;
                        font-size: 14px;
                        color: #333;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="ticket-container">
                    <div class="ticket-header">
                        <h1>አገልግሎት ማስተራረያ</h1>
                        <div class="logo"></div>
                        <h1>ትኬት</h1>
                    </div>
                    <div class="ticket-body">
                        <p><strong>የባለጉዳይ ስም:</strong> ${frm.doc.customer_name || "----"}</p>
                        <p><strong>የሥራ ክፍል:</strong> ${frm.doc.department || "----"}</p>
                        <p><strong>መገኛ:</strong> ${deptinfo || "----"}</p>
                        <p><strong>የወረፋ ቀን:</strong> ${frm.doc.date || "----"}</p>
                        <p><strong>የተቆረጠበት ሰዐት:</strong> ${frm.doc.time || "----"}</p>
                        <p><strong>ከእርስዎ በፊት ያሉ ደንበኞች:</strong> ${peopleAhead}</p>
                    </div>
                    <div class="qr-code">
                        <p class="highlight">${frm.doc.ticket_number || "---"}</p>
                        <img src="${qrCodeUrl}" alt="QR Code">
                    </div>
                    <p>የተራ ቁጥርዎ በቅርቡ ይጠራል ፥ አባክዎ በትዕግስት ይጠብቁ</p>
                    <div class="ticket-footer">
                        <p>ስላገለገልኖት ክብር ይሰማናል!</p>
                    </div>
                </div>
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

async function getDeptInfo(frm) {
	let filters = {
		name: frm.doc.department,
	};

	let dept = await frappe.call({
		method: "frappe.client.get_list",
		args: {
			doctype: "Departmennt",
			filters: filters,
			fields: ["name", "office_number"],
		},
	});

	return dept.message[0].office_number;
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
