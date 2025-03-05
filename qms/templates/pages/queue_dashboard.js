// frappe.realtime.on("queue_call", function (message) {
// 	console.log("Received queue update:", message);

// 	if (message.ticket_number) {
// 		// Update the current ticket number
// 		let currentTicketElement = document.querySelector(".current_ticket");
// 		if (currentTicketElement) {
// 			currentTicketElement.textContent = message.ticket_number;
// 		}

// 		// Update and play the audio
// 		let ticketAudioElement = document.querySelector(".ticket_audio");
// 		if (ticketAudioElement && message.audio_file) {
// 			ticketAudioElement.src = message.audio_file;
// 			ticketAudioElement.load();
// 			ticketAudioElement.play().catch((err) => {
// 				console.error("Error playing audio:", err);
// 			});
// 		}
// 	}
// });

// frappe.realtime.on("queue_list", function (message) {
// 	console.log("Received queue list update:", message);

// 	// Update the queue list
// 	let queueItemsContainer = document.querySelector(".queue-items");
// 	if (queueItemsContainer) {
// 		// Clear existing items
// 		queueItemsContainer.innerHTML = "";

// 		// Create a new queue item
// 		let queueItem = document.createElement("div");
// 		queueItem.classList.add("queue-item");

// 		// Add ticket number
// 		let ticketNumber = document.createElement("div");
// 		ticketNumber.classList.add("ticket-number");
// 		ticketNumber.textContent = `Ticket #${message.ticket_number}`;
// 		queueItem.appendChild(ticketNumber);

// 		// Add assigned office
// 		let assignedOffice = document.createElement("div");
// 		assignedOffice.classList.add("assigned-office");
// 		assignedOffice.textContent = `Assigned Office: ${message.assigned_office || "N/A"}`;
// 		queueItem.appendChild(assignedOffice);

// 		// Insert the new item at the top of the list
// 		queueItemsContainer.appendChild(queueItem);

// 		// Add animation class
// 		queueItem.classList.add("animate-in");
// 	}
// });

// // Fetch initial queue list
// frappe.call({
// 	method: "frappe.client.get_list",
// 	args: {
// 		doctype: "Queue Call",
// 		fields: ["ticket_number", "assigned_office", "audio_file"],
// 		order_by: "creation desc",
// 		limit_page_length: 10,
// 	},
// 	callback(r) {
// 		console.log("............", { r });

// 		if (r.message) {
// 			let queueItemsContainer = document.querySelector(".queue-items");
// 			let ticketAudioElement = document.querySelector(".ticket_audio");

// 			if (!queueItemsContainer) {
// 				console.error("Queue items container not found");
// 				return;
// 			}

// 			// Update the current ticket number and audio
// 			if (r.message.length > 0) {
// 				let currentTicketElement = document.querySelector(".current_ticket");
// 				if (currentTicketElement) {
// 					currentTicketElement.textContent = r.message[0].ticket_number;
// 				}

// 				let firstTicketAudio = r.message[0].audio_file;
// 				if (firstTicketAudio) {
// 					ticketAudioElement.src = firstTicketAudio;
// 					ticketAudioElement.load();
// 					ticketAudioElement.play().catch((err) => {
// 						console.error("Error playing audio:", err);
// 					});
// 				}
// 			}

// 			// Populate the queue list
// 			r.message.forEach((ticket) => {
// 				let queueItem = document.createElement("div");
// 				queueItem.classList.add("queue-item");

// 				let ticketNumber = document.createElement("div");
// 				ticketNumber.classList.add("ticket-number");
// 				ticketNumber.textContent = `Ticket #${ticket.ticket_number}`;
// 				queueItem.appendChild(ticketNumber);

// 				let assignedOffice = document.createElement("div");
// 				assignedOffice.classList.add("assigned-office");
// 				assignedOffice.textContent = `Assigned Office: ${ticket.assigned_office}`;
// 				queueItem.appendChild(assignedOffice);

// 				// Add the new queue item to the list
// 				queueItemsContainer.appendChild(queueItem);

// 				// Apply animation
// 				queueItem.classList.add("animate-in");
// 			});
// 		}
// 	},
// });
