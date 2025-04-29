# Web-Controlled Light Scheduler with WebSocket, MQTT & Arduino

_A streamlined tool to automate your lighting schedule via a web dashboard, using WebSockets for frontend-backend communication and MQTT to relay commands to an Arduino._

## 📁 Repository Layout
```
.
├── arduino/            # Arduino sketch for relay control
│   └── main.ino
├── backend/            # Python WebSocket server
│   └── server.py
├── frontend/           # User interface (HTML, CSS, JS)
│   ├── index.html
│   ├── script.js
│   └── style.css
├── subscriber/         # MQTT listener and Arduino driver (Python)
│   └── subscriber.py
├── requirements.txt    # Python dependencies
└── README.md           # Project overview (this file)
```

## 🔧 How It Works
1. **Frontend** (`frontend/`)
   - Web page where users set “ON” and “OFF” times (HH:MM).
   - Sends schedule over WebSocket to the backend.

2. **WebSocket Server** (`backend/server.py`)
   - Listens for incoming WebSocket connections.
   - Validates schedule data.
   - Publishes a JSON payload to the MQTT topic `relay/set_schedule`.

3. **MQTT Subscriber** (`subscriber/subscriber.py`)
   - Subscribes to `relay/set_schedule`.
   - Saves the latest schedule.
   - Checks the current time and sends `1` (ON) or `0` (OFF) via serial to the Arduino.

4. **Arduino** (`arduino/main.ino`)
   - Reads serial input (`1` or `0`).
   - Activates a relay module on digital pin 7 (LOW = ON, HIGH = OFF).

## 📸 Screenshots
**Web UI**
![Scheduler Interface](./assets/ui.png)

**Backend Logs**
![Server Log](./assets/light-2.png)

**Subscriber Output**
![Subscriber Log](./assets/light-2.png)

## 🚀 Installation & Setup

### Prerequisites
- **Arduino UNO** (or similar) + relay module
- **Python 3.7+**
- **MQTT broker** (default: `157.173.101.159:1883`, or your own Mosquitto instance)
- **Arduino IDE**

### 1. Install Python Packages
```bash
pip install -r requirements.txt
```

### 2. Configure Arduino
1. Wire relay control pin to Arduino digital pin 7.
2. Connect relay COM/NO in series with your lamp (ensure power is off!).
3. Upload `arduino/main.ino` via the Arduino IDE.

### 3. Environment Variables
| Variable               | Default                | Description                     |
|------------------------|------------------------|---------------------------------|
| WEBSOCKET_HOST         | `0.0.0.0`              | WebSocket server host           |
| WEBSOCKET_PORT         | `8765`                 | WebSocket server port           |
| MQTT_BROKER_HOST       | `157.173.101.159`      | MQTT broker address             |
| MQTT_BROKER_PORT       | `1883`                 | MQTT broker port                |
| MQTT_SCHEDULE_TOPIC    | `relay/set_schedule`   | Topic for sending schedules     |
| SERIAL_PORT            | `/dev/ttyUSB0`         | Arduino serial port             |
| BAUD_RATE              | `9600`                 | Serial communication speed      |

Set them before running:
```bash
export MQTT_BROKER_HOST=localhost
export SERIAL_PORT=/dev/ttyACM0
```

## ▶️ Running the System

1. **Start Subscriber**:
   ```bash
   python subscriber/subscriber.py
   ```

2. **Start WebSocket Server**:
   ```bash
   python server/app.py
   ```

3. **Open ui**:
   - Launch ` ui/index.html` in your browser (connects to `ws://localhost:8765`).

4. **Schedule Your Light**:
   - Enter ON/OFF times and hit **Set Schedule**.
   - Backend broadcasts via MQTT; subscriber triggers the Arduino relay.

## ⚠️ Important Notes
- **No Authentication**: Intended for local networks or experiments.
- **Time Sync**: Ensure the subscriber machine clock is accurate.
- **Broker Performance**: For production, host your own MQTT broker to reduce latency.

---
