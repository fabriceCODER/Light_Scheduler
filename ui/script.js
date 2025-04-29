(() => {
	// DOM elements
	const onTimeInput = document.getElementById("on-time");
	const offTimeInput = document.getElementById("off-time");
	const submitButton = document.getElementById("submit-schedule");
	const statusDiv = document.getElementById("status");
   
	// WebSocket & reconnect settings
	const HOST = window.location.hostname || "localhost";
	const WS_PORT = 8765;
	const WS_URL = `ws://${HOST}:${WS_PORT}`;
	const RECONNECT_BASE_MS = 2000;
	let ws;
	let reconnectAttempts = 0;
   
	/**
	 * Display a status message with semantic color.
	 * @param {string} text
	 * @param {'default'|'info'|'success'|'warning'|'error'} level
	 */
	function setStatus(text, level = "default") {
	  const colors = {
	    default: "#555",
	    info:   "#2563EB", // blue-600
	    success:"#059669", // green-600
	    warning:"#D97706", // amber-600
	    error:  "#DC2626", // red-600
	  };
	  statusDiv.textContent = text;
	  statusDiv.style.color = colors[level] || colors.default;
	}
   
	/**
	 * Enable or disable the "Set Schedule" button.
	 * @param {boolean} enabled
	 */
	function toggleSubmit(enabled) {
	  submitButton.disabled = !enabled;
	  submitButton.classList.toggle("disabled", !enabled);
	}
   
	/**
	 * Attempt to (re)connect to the WebSocket server.
	 */
	function connect() {
	  if (ws && ws.readyState === WebSocket.OPEN) return;
   
	  setStatus("Connecting to server...", "info");
	  toggleSubmit(false);
   
	  ws = new WebSocket(WS_URL);
   
	  ws.addEventListener("open", () => {
	    reconnectAttempts = 0;
	    setStatus("Connected ✔️", "success");
	    toggleSubmit(true);
	  });
   
	  ws.addEventListener("message", ({ data }) => {
	    console.log("Server >>", data);
	    setStatus(`Server: ${data}`, "info");
	    toggleSubmit(true);
	  });
   
	  ws.addEventListener("error", (evt) => {
	    console.error("WebSocket error", evt);
	    // onclose will handle user feedback
	  });
   
	  ws.addEventListener("close", ({ code, reason }) => {
	    console.warn(`Disconnected (code: ${code})`, reason);
	    setStatus("Disconnected — retrying…", "warning");
	    toggleSubmit(false);
	    scheduleReconnect();
	  });
	}
   
	/**
	 * Calculate next reconnect delay (exponential backoff up to 30s) and retry.
	 */
	function scheduleReconnect() {
	  reconnectAttempts++;
	  const delay = Math.min(
	    RECONNECT_BASE_MS * 2 ** (reconnectAttempts - 1),
	    30000
	  );
	  console.log(`Reconnecting in ${delay}ms (attempt #${reconnectAttempts})`);
	  setTimeout(connect, delay);
	}
   
	/**
	 * Validate times and send the schedule JSON over WebSocket.
	 */
	function sendSchedule() {
	  const onTime  = onTimeInput.value;
	  const offTime = offTimeInput.value;
   
	  // Basic validation
	  if (!onTime || !offTime) {
	    setStatus("Both ON and OFF times are required.", "error");
	    return;
	  }
	  if (onTime === offTime) {
	    setStatus("ON and OFF times cannot be identical.", "error");
	    return;
	  }
	  if (ws?.readyState !== WebSocket.OPEN) {
	    setStatus("Not connected. Trying to reconnect…", "error");
	    connect();
	    return;
	  }
   
	  const payload = { on_time: onTime, off_time: offTime };
	  try {
	    ws.send(JSON.stringify(payload));
	    console.log("Client >>", payload);
	    setStatus(`Sent (ON: ${onTime}, OFF: ${offTime}) — awaiting ack…`, "info");
	    toggleSubmit(false);
	  } catch (err) {
	    console.error("Send failed", err);
	    setStatus("Failed to send schedule. See console.", "error");
	  }
	}
   
	// Attach event listener
	submitButton.addEventListener("click", sendSchedule);
   
	// Kick off initial connection
	connect();
   })();
   