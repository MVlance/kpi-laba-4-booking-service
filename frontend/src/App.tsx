import { useState, useEffect, useCallback } from 'react';
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

interface Booking {
  id: string;
  pnrCode: string;
  flightId: string;
  status: string;
  totalPrice: number;
  expiresAt: string;
}

// Ініціалізуємо сокет (поки без підключення)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const socket: Socket = io(API_BASE_URL, { autoConnect: false });

function App() {
  // Стани для авторизації
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Стани для рейсів
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bookingStatus, setBookingStatus] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Стани для бронювань
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  // Стани для чату
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [receiverId, setReceiverId] = useState(''); // З ким спілкуємось



  const fetchMyBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings?userId=${userId}`);
      const data = await res.json();
      setMyBookings(data);
    } catch (error) {
      console.error('Помилка завантаження бронювань:', error);
    }
  }, [userId]);

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

  // --- Helper function for authenticated fetch ---
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (options.headers && typeof options.headers === 'object') {
      Object.assign(headers, options.headers);
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, { ...options, headers });
  };

  // --- Функції API ---

  const fetchFlights = async () => {
    try {
      // Формуємо query-параметри для URL
      const query = new URLSearchParams();
      if (origin) query.append('origin', origin.trim());
      if (destination) query.append('destination', destination.trim());

      const url = `${API_BASE_URL}/api/flights/search?${query.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setFlights(data);
      setCurrentPage(1); // Reset to first page on new search
    } catch (error) {
      console.error('Помилка пошуку:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userId, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // Store the token
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
        }
        await fetchMyBookings();
        setIsLoggedIn(true);
      } else {
        const err = await res.json();
        setAuthError(err.error);
      }
    } catch (error) {
      console.error('Помилка логіну:', error);
      setAuthError('Помилка з\'єднання з сервером');
    }
  };

  const bookFlight = async (flightId: string) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        body: JSON.stringify({ userId, flightId, seatClass: 'ECONOMY', serviceIds: [] }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookingStatus(`Успіх! PNR код: ${data.pnrCode}`);
        fetchFlights(); //оновлюємо список, щоб побачити зміну кількості місць
        fetchMyBookings(); // оновлюємо список бронювань
      } else {
        try {
          const err = await res.json();
          setBookingStatus(`Помилка бронювання: ${err.error || 'Невідома помилка'}`);
        } catch {
          setBookingStatus('Помилка бронювання: Невідома помилка');
        }
      }
    } catch (error) {
      console.error('Помилка бронювання:', error);
      setBookingStatus('Помилка з\'єднання з сервером');
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBookingStatus('Бронювання скасовано');
        fetchMyBookings();
      } else {
        const err = await res.json();
        setBookingStatus(`Не вдалося скасувати бронювання: ${err.error || 'Невідома помилка'}`);
      }
    } catch (error) {
      console.error('Помилка скасування бронювання:', error);
      setBookingStatus('Помилка з\'єднання з сервером');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/api/bookings/${bookingId}?force=true`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBookingStatus('Бронювання видалено');
        fetchMyBookings();
      } else {
        const err = await res.json();
        setBookingStatus(`Не вдалося видалити бронювання: ${err.error || 'Невідома помилка'}`);
      }
    } catch (error) {
      console.error('Помилка видалення бронювання:', error);
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
          <form onSubmit={handleLogin}>
            <h2>Вхід у систему</h2>
            <input
                type="text"
                placeholder="Логін (напр. Tourist1)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <input
                type="password"
                placeholder="Пароль (password123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Увійти</button>
            {authError && <p style={{color: '#ef4444', marginTop: '10px'}}>{authError}</p>}
          </form>
        </div>
    );
  }

  // Рендер головного екрану (Дашборд)
  // Pagination calculations
  const totalPages = Math.ceil(flights.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFlights = flights.slice(startIndex, startIndex + itemsPerPage);

  return (
      <div className="dashboard">
        <header>
          <h1>Привіт, {userId}!</h1>
        </header>

        <div className="main-content">
          {/* ЛІВА ПАНЕЛЬ: Пошук і бронювання */}
          <section className="booking-section" style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
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
              {paginatedFlights.map((flight) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  Попередня
                </button>
                <span>Сторінка {currentPage} з {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                >
                  Наступна
                </button>
              </div>
            )}

          </section>

          {/*ПРАВА ПАНЕЛЬ: Чат та бронювання */}
          <section className="right-panel" style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <section className="chat-section" style={{ height: '50%', display: 'flex', flexDirection: 'column' }}>
              <h2>Чат з підтримкою</h2>
              <input
                  type="text"
                  placeholder="ID співрозмовника (напр. Agent1)"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="receiver-input"
              />

              <div className="chat-window" style={{ flex: 1, overflowY: 'auto' }}>
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

            <section className="bookings-section" style={{ height: '50%', display: 'flex', flexDirection: 'column' }}>
              <h2>Мої бронювання</h2>
              <div className="bookings-list" style={{ flex: 1, overflowY: 'auto' }}>
                {myBookings.length === 0 ? (
                  <p>Немає бронювань</p>
                ) : (
                  myBookings.map((booking) => (
                    <div key={booking.id} className="booking-item" style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                      <p><strong>PNR:</strong> {booking.pnrCode}</p>
                      <p><strong>Рейс:</strong> {booking.flightId}</p>
                      <p><strong>Статус:</strong> {booking.status}</p>
                      <p><strong>Ціна:</strong> ${booking.totalPrice}</p>
                      <p><strong>Дійсний до:</strong> {new Date(booking.expiresAt).toLocaleString()}</p>
                      {booking.status !== 'CANCELLED' ? (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          style={{ marginTop: '10px', alignSelf: 'flex-start' }}
                        >
                          Скасувати бронювання
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          style={{ marginTop: '10px', alignSelf: 'flex-start', backgroundColor: '#f87171' }}
                        >
                          Видалити бронювання
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </section>


        </div>
      </div>
  );
}

export default App;