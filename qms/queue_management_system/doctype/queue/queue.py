# Copyright (c) 2025, Samuael Ketema and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Queue(Document):
    def before_insert(self):
        # Set the ticket number
        self.set_ticket_number()

        # Assign an available office that provides the same service
        self.assign_available_office()

    def set_ticket_number(self):
        # Get the last ticket number for the service
        last_ticket = frappe.db.get_value(
            "Queue", 
            {"service": self.service}, 
            "ticket_number", 
            order_by="creation desc"
        )

        # If there is no last ticket, start from 001
        if not last_ticket:
            self.ticket_number = f"{self.service[:3].upper()}-001"
        else:
            # Increment the last ticket number
            self.ticket_number = f"{self.service[:3].upper()}-{(int(last_ticket.split('-')[-1]) + 1):03}"

    def assign_available_office(self):
        # Find offices that provide the same service and are available
        available_offices = frappe.get_all(
            "Office", 
            filters={
                "service": self.service,
                "status": "Available"
            },
            fields=["name"],
            order_by="creation asc",  # Assign the first available office
            limit=1
        )

        if available_offices:
            # Assign the first available office
            self.assigned_office = available_offices[0].name
        else:
            # If no available office is found, leave the field empty or raise an exception
            frappe.throw("No available office found for the selected service.")