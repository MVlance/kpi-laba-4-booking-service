Технологічний стек
* Frontend: React, TypeScript, Vite
* Backend: Node.js, Express, TypeScript
* Архітектура: Модульний моноліт (імітація мікросервісів)

Переконайтеся, що на вашому комп'ютері встановлено:
* [Node.js](https://nodejs.org/) (версія 18 або вище)
* Git

розгортання проекту локально:

Відкрийте термінал і виконайте команду:
git clone [https://github.com/ВАШ_НИК_НА_GITHUB/kpi-laba-4-booking-service.git]

щоб запустити проект локально:
cd backend
npm run dev

в окремому терминалі:
cd frontend
npm run dev

і потім відкрити http://localhost:5173/

якщо виникають якісь проблеми з залежностями, зазвичай, команда npm install їх всі вирішує

📦 project-root
 ┣ 📂 backend/         # Node.js + Express сервер (REST API та WebSockets)
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 controllers/ # Обробка HTTPS-запитів
 ┃ ┃ ┣ 📂 modules/     # Тут сервіси
 ┃ ┃ ┣ 📂 services/    # Бізнес-логіка (пошук, бронювання, чат)
 ┃ ┃ ┣ 📂 repositories/# Робота з даними (in-memory/PostgreSQL)
 ┃ ┃ ┗ 📜 index.ts     # Точка входу сервера
 ┃ ┗ 📜 package.json
 ┗ 📂 frontend/        # React SPA
   ┣ 📂 src/
   ┗ 📜 package.json



хардкодед юзери:
Tourist1 password123
Agent1 password123

хардкодед рейси:
{ id: 'f1', airline: 'Ryanair', origin: 'KBP', destination: 'LHR', availableSeats: 42, price: 150.0 },
{ id: 'f2', airline: 'Wizz Air', origin: 'KBP', destination: 'WAW', availableSeats: 12, price: 80.0 },
{ id: 'f3', airline: 'Lufthansa', origin: 'FRA', destination: 'KBP', availableSeats: 0, price: 200.0 }, // 0 seats
{ id: 'f4', airline: 'Turkish Airlines', origin: 'KBP', destination: 'IST', availableSeats: 5, price: 250.0 },
{ id: 'f5', airline: 'British Airways', origin: 'LHR', destination: 'JFK', availableSeats: 150, price: 600.0 },
{ id: 'f6', airline: 'Ryanair', origin: 'WAW', destination: 'BCN', availableSeats: 2, price: 65.0 },
{ id: 'f7', airline: 'LOT', origin: 'WAW', destination: 'JFK', availableSeats: 34, price: 550.0 },
{ id: 'f8', airline: 'Air France', origin: 'KBP', destination: 'CDG', availableSeats: 8, price: 220.0 }