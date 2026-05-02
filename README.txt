Технологічний стек
* Frontend: React, TypeScript, Vite
* Backend: Node.js, Express, TypeScript
* Архітектура: Модульний моноліт (імітація мікросервісів)

Переконайтеся, що на вашому комп'ютері встановлено:
* [Node.js](https://nodejs.org/) ( версія 18 або вище)
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

