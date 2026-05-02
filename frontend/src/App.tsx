import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

// --- Інтерфейси (DTO) ---
interface Flight {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  availableSeats: number;
  price: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  sentAt: string;
}

// Ініціалізуємо сокет (поки без підключення)
const socket: Socket = io('http://localhost:3000', { autoConnect: false });

function App() {
  // Стани для авторизації
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Стани для рейсів
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bookingStatus, setBookingStatus] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Стани для чату
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [receiverId, setReceiverId] = useState(''); // З ким спілкуємось

  // Підключення до WS після логіну
  useEffect(() => {
    if (isLoggedIn) {
      socket.connect();
      socket.emit('register', userId);

      // Слухаємо нові повідомлення
      socket.on('newMessage', (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      // Слухаємо підтвердження наших повідомлень
      socket.on('messageSent', (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socket.off('newMessage');
        socket.off('messageSent');
        socket.disconnect();
      };
    }
  }, [isLoggedIn, userId]);

  // --- Функції API ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) setIsLoggedIn(true);
  };

  const fetchFlights = async () => {
    try {
      // Формуємо query-параметри для URL
      const query = new URLSearchParams();
      if (origin) query.append('origin', origin.trim());
      if (destination) query.append('destination', destination.trim());

      const url = `http://localhost:3000/api/flights/search?${query.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setFlights(data);
    } catch (error) {
      console.error('Помилка пошуку:', error);
    }
  };

  const bookFlight = async (flightId: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, flightId, seatClass: 'ECONOMY', serviceIds: [] }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookingStatus(`Успіх! PNR код: ${data.pnrCode}`);
        fetchFlights(); //оновлюємо список, щоб побачити зміну кількості місць
      } else {
        const err = await res.json();
        setBookingStatus(`Помилка: ${err.error}`);
      }
    } catch (error) {
      setBookingStatus('Помилка з\'єднання з сервером');
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && receiverId.trim()) {
      socket.emit('sendMessage', {
        senderId: userId,
        receiverId: receiverId,
        text: chatInput,
      });
      setChatInput('');
    }
  };

  // Рендер екрану логіну
  if (!isLoggedIn) {
    return (
        <div className="login-screen">
          <h2>Система бронювання</h2>
          <form onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="Введіть свій ID (напр. Tourist1 або Agent1)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <button type="submit">Увійти</button>
          </form>
        </div>
    );
  }

  // Рендер головного екрану (Дашборд)
  return (
      <div className="dashboard">
        <header>
          <h1>Привіт, {userId}!</h1>
        </header>

        <div className="main-content">
          {/* ЛІВА ПАНЕЛЬ: Пошук і бронювання */}
          <section className="booking-section">
            <h2>Пошук авіарейсів</h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                  type="text"
                  placeholder="Звідки (напр. KBP)"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
              />
              <input
                  type="text"
                  placeholder="Куди (напр. LHR)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
              />
              <button onClick={fetchFlights}>Знайти рейси</button>
            </div>

            {bookingStatus && <div className="status-badge">{bookingStatus}</div>}

            <div className="flight-list">
              {flights.map((flight) => (
                  <div key={flight.id} className="flight-card">
                    <h3>{flight.airline}</h3>
                    <p>{flight.origin} ➔ {flight.destination}</p>
                    <p>Ціна: ${flight.price} | Вільних місць: {flight.availableSeats}</p>
                    <button
                        onClick={() => bookFlight(flight.id)}
                        disabled={flight.availableSeats <= 0}
                    >
                      Забронювати
                    </button>
                  </div>
              ))}
            </div>
          </section>

          {/*ПРАВА ПАНЕЛЬ: Чат */}
          <section className="chat-section">
            <h2>Чат з підтримкою</h2>
            <input
                type="text"
                placeholder="ID співрозмовника (напр. Agent1)"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="receiver-input"
            />

            <div className="chat-window">
              {messages.filter(m => m.senderId === receiverId || m.receiverId === receiverId).map((msg, idx) => (
                  <div key={idx} className={`message ${msg.senderId === userId ? 'my-message' : 'their-message'}`}>
                    <strong>{msg.senderId}: </strong> {msg.text}
                  </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="chat-form">
              <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Напишіть повідомлення..."
              />
              <button type="submit">▶</button>
            </form>
          </section>
        </div>
      </div>
  );
}

export default App;