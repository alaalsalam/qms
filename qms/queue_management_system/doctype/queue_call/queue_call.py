# Copyright (c) 2025, Samuael Ketema and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document



class QueueCall(Document):
	pass




@frappe.whitelist()
def call_next(service):
    next_ticket = frappe.get_all("Queue", filters={"service": service, "status": "Waiting"}, fields=["name", "ticket_number"], order_by="creation asc", limit=1)
    if next_ticket:
        ticket = next_ticket[0]
        queue_call = frappe.new_doc("Queue Call")
        queue_call.ticket_number = ticket.name
        queue_call.called_time = frappe.utils.now()
        queue_call.save()

        # Update ticket status
        frappe.db.set_value("Queue", ticket.name, "status", "Serving")

        # Generate audio file (use gTTS or other library)
        from gtts import gTTS
        tts = gTTS(text=f"Ticket number {ticket.ticket_number} please proceed to the service counter", lang='en')
        audio_path = f"/private/files/{ticket.ticket_number}.mp3"
        tts.save(f"{frappe.utils.get_site_path()}/public{audio_path}")

        # Save audio file path to Queue Call
        queue_call.audio_file = audio_path
        queue_call.save()

        #Notify via WebSocket
        frappe.publish_realtime(event='queue_call', message={'ticket_number': ticket.ticket_number, 'audio_file': audio_path})

        return ticket.ticket_number
    else:
        return None
