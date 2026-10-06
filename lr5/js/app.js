document.addEventListener('DOMContentLoaded', () => {
    const sleepForm = document.getElementById('sleep-form');
    const bedtimeInput = document.getElementById('bedtime');
    const waketimeInput = document.getElementById('waketime');
    const qualitySelect = document.getElementById('quality');
    const resultMessage = document.getElementById('result-message');
    const sleepList = document.getElementById('sleep-list');
    const clearBtn = document.getElementById('clear-btn');

    // Ключ для хранения данных в localStorage
    const STORAGE_KEY = 'sleep_tracker_logs';

    // 1. Функция расчета продолжительности сна в минутах
    function calculateSleepDuration(bedtimeStr, waketimeStr) {
        const [bedHours, bedMinutes] = bedtimeStr.split(':').map(Number);
        const [wakeHours, wakeMinutes] = waketimeStr.split(':').map(Number);

        let bedTotalMinutes = bedHours * 60 + bedMinutes;
        let wakeTotalMinutes = wakeHours * 60 + wakeMinutes;

        // Если время пробуждения меньше времени отхода ко сну, значит перешли через полночь
        if (wakeTotalMinutes <= bedTotalMinutes) {
            wakeTotalMinutes += 24 * 60; // Добавляем 24 часа в минутах
        }

        return wakeTotalMinutes - bedTotalMinutes;
    }

    // 2. Форматирование минут в строку "X ч Y мин"
    function formatDuration(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours} ч. ${minutes} мин.`;
    }

    // 3. Получение записей из localStorage
    function getStoredLogs() {
        const logs = localStorage.getItem(STORAGE_KEY);
        return logs ? JSON.parse(logs) : [];
    }

    // 4. Отрисовка списка записей на странице
    function renderLogs() {
        const logs = getStoredLogs();
        sleepList.innerHTML = '';

        if (logs.length === 0) {
            sleepList.innerHTML = '<li style="color: #94a3b8;">Записей пока нет</li>';
            return;
        }

        logs.forEach((log) => {
            const li = document.createElement('li');
            li.style.cssText = `
                background-color: #0f172a;
                padding: 0.75rem;
                border-radius: 0.5rem;
                margin-bottom: 0.5rem;
                display: flex;
                justify-content: space-between;
                font-size: 0.9rem;
            `;
            li.innerHTML = `
                <span><strong>${log.date}</strong>: ${log.bedtime} — ${log.waketime} (${log.durationText})</span>
                <span style="color: #38bdf8;">${log.quality}</span>
            `;
            sleepList.appendChild(li);
        });
    }

    // 5. Обработка отправки формы
    sleepForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const bedtime = bedtimeInput.value;
        const waketime = waketimeInput.value;
        const quality = qualitySelect.value;

        // Расчет длительности
        const durationMinutes = calculateSleepDuration(bedtime, waketime);
        const durationText = formatDuration(durationMinutes);

        // Создание объекта записи
        const newLog = {
            id: Date.now(),
            date: new Date().toLocaleDateString('ru-RU'),
            bedtime,
            waketime,
            durationMinutes,
            durationText,
            quality
        };

        // Сохранение в localStorage
        const logs = getStoredLogs();
        logs.unshift(newLog); // Добавляем новую запись в начало
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));

        // Вывод сообщения
        resultMessage.style.color = '#38bdf8';
        resultMessage.textContent = `Записано! Длительность сна: ${durationText}`;

        // Обновление интерфейса
        renderLogs();
    });

    // 6. Очистка истории
    clearBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите удалить все записи?')) {
            localStorage.removeItem(STORAGE_KEY);
            renderLogs();
            resultMessage.textContent = '';
        }
    });

    // Первоначальная отрисовка при загрузке страницы
    renderLogs();
});