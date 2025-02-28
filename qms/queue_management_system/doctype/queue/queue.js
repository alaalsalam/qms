// Copyright (c) 2025, Samuael Ketema and contributors
// For license information, please see license.txt

frappe.ui.form.on("Queue", {
	refresh(frm) {

	},
});

frappe.realtime.on('queue_call', (data) => {
    console.log(data)
    frappe.msgprint(__('data'));

})
