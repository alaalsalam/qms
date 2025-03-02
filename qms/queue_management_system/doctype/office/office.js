// Copyright (c) 2025, Samuael Ketema and contributors
// For license information, please see license.txt

frappe.ui.form.on("Office", {
	refresh: function (frm) {
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
	},
});
