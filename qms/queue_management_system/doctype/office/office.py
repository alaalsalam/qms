import frappe
from frappe.model.document import Document
from gtts import gTTS

class Office(Document):
    pass

@frappe.whitelist()
def call_next(service, name=None):
    next_ticket = frappe.get_all("Queue", filters={"service": service, "status": "Waiting"}, fields=["name", "ticket_number"], order_by="creation asc", limit=1)

    # Create Queue Call
    if next_ticket:
        ticket = next_ticket[0]
        queue_call = frappe.new_doc("Queue Call")
        queue_call.ticket_number = ticket.ticket_number
        queue_call.called_time = frappe.utils.now()
        queue_call.assigned_office = name
        queue_call.save()

        # Update office status
        office = frappe.get_doc("Office", name)
        office.status = "On Service"
        office.save()

        # Update ticket status
        frappe.db.set_value("Queue", ticket.name, "status", "Calling")

        # Generate audio file (use gTTS or other library)
        tts = gTTS(text=f"Ticket number {ticket.ticket_number} please proceed to office number {name}", lang='en')
        audio_path = f"/private/files/{ticket.ticket_number}.mp3"
        tts.save(f"{frappe.utils.get_site_path()}{audio_path}")

        

        # Save audio file path to Queue Call
        queue_call.audio_file = audio_path
        queue_call.is_private = 0
        queue_call.save()

        # Notify via WebSocket
        frappe.publish_realtime(event='queue_call', message={'ticket_number': ticket.ticket_number, 'audio_file': audio_path, 'assigned_office': name})

        return ticket.ticket_number
    else:
        return None