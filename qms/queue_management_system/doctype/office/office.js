// Copyright (c) 2025, Samuael Ketema and contributors
// For license information, please see license.txt

frappe.ui.form.on("Office", {
	refresh: function (frm) {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Queue",
				filters: { service: frm.doc.service },
				fields: ["name", "status"],
				order_by: "creation asc",
				limit_page_length: 1,
			},
			callback: function (r) {
				let ticket = r.message?.length ? r.message[0] : null;
				console.log({ ticket });

				frm.clear_custom_buttons();

				if (!ticket) {
					frappe.msgprint(__("No tickets in the queue."));
					return;
				}

				// Add "Call Next" button if the ticket is waiting
				if (ticket.status === "Waiting") {
					frm.add_custom_button(__("Call Next"), function () {
						frappe.call({
							method: "qms.queue_management_system.doctype.office.office.call_next",
							args: {
								service: frm.doc.service,
								name: frm.doc.name,
							},
							callback: function (r) {
								if (r.message) {
									frm.reload_doc();
									frappe.msgprint(__("Called Ticket Number {0}", [r.message]));
								} else {
									frappe.msgprint(__("No tickets in the queue."));
								}
							},
						});
					});
				}

				// Add "Call Again" button if the ticket is already called
				if (ticket.status === "Called") {
					frm.add_custom_button(__("Call Again"), function () {
						frappe.call({
							method: "qms.queue_management_system.doctype.office.office.call_again",
							args: {
								ticket_name: ticket.name,
							},
							callback: function (r) {
								frappe.msgprint(r.message);
								frm.reload_doc();
							},
						});
					});
				}

				// Add "Skip Queue" button for tickets that are waiting or already called
				if (ticket.status === "Called") {
					frm.add_custom_button(__("Skip Queue"), function () {
						frappe.call({
							method: "qms.queue_management_system.doctype.office.office.skip",
							args: {
								ticket_name: ticket.name,
							},
							callback: function (r) {
								frappe.msgprint(r.message);
								frm.reload_doc();
							},
						});
					});
				}

				if (ticket.status === "Called") {
					frm.add_custom_button(__("Start"), function () {
						frappe.call({
							method: "qms.queue_management_system.doctype.office.office.start",
							args: {
								ticket_name: ticket.name,
							},
							callback: function (r) {
								frappe.msgprint(r.message);
								frm.reload_doc();
							},
						});
					});
				}

				if (ticket.status === "Being Served") {
					frm.add_custom_button(__("Complete"), function () {
						frappe.prompt([
							{ label: __("Enter Remark"), fieldname: "remark", fieldtype: "Text" }
						], function (values) {
							frappe.call({
								method: "qms.queue_management_system.doctype.office.office.complete",
								args: {
									ticket_name: ticket.name,
									remark: values.remark  // Pass the entered remark to the backend
								},
								callback: function (r) {
									frappe.msgprint(r.message);
									frm.reload_doc();
								},
							});
						}, __("Enter Remark"), __("Complete"));
					});
				}
			},
		});
	},
});
