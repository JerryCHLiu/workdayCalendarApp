document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const monthYearElement = document.getElementById("month-year");
    const calendarElement = document.getElementById("calendar");
    const prevMonthButton = document.getElementById("prev-month");
    const nextMonthButton = document.getElementById("next-month");
    const passportSwitch = document.getElementById("passport-switch");
    const permitSwitch = document.getElementById("permit-switch");
    const urgentSwitch = document.getElementById("urgent-switch");
    const selectedDateInfo = document.getElementById("selected-date-info");
    const returnDates = document.getElementById("return-dates");

    // State
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = null;
    let holidays = [];

    const monthNames = [
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月",
    ];

    // Business Rules
    const PASSPORT_DAYS = 12;
    const PERMIT_DAYS = 8;
    const URGENT_PASSPORT_DAYS = 3;
    const URGENT_PERMIT_DAYS = 4;

    // Fetch holidays from JSON
    async function fetchHolidays() {
        try {
            const response = await fetch("holidays.json");
            const data = await response.json();
            holidays = data;
            renderCalendar(); // Re-render calendar after loading holidays
        } catch (error) {
            console.error("Error loading holidays:", error);
        }
    }

    // Format date to YYYYMMDD string
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}${month}${day}`;
    }

    // Format date to MM/DD string
    function formatDateMMDD(date) {
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${month}/${day}`;
    }

    // Check if a date is a holiday
    function isHoliday(date) {
        const dateString = formatDate(date);
        return holidays.some(
            (h) => h.西元日期 === dateString && h.是否放假 === "2"
        );
    }

    // Check if a date is a weekend
    function isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    // Calculate return date based on working days
    function calculateReturnDate(startDate, workingDays) {
        let date = new Date(startDate);
        let remainingDays = workingDays;

        while (remainingDays > 0) {
            date.setDate(date.getDate() + 1);
            if (!isWeekend(date) && !isHoliday(date)) {
                remainingDays--;
            }
        }

        return date;
    }

    // Update return dates display
    function updateReturnDates() {
        if (!selectedDate) return;

        returnDates.innerHTML = "";

        if (passportSwitch.checked) {
            const passportDate = calculateReturnDate(
                selectedDate,
                PASSPORT_DAYS
            );
            const passportElement = document.createElement("div");
            passportElement.className = "return-date-item passport";
            passportElement.textContent = `護照回件日期：${formatDateMMDD(
                passportDate
            )}`;
            returnDates.appendChild(passportElement);

            if (urgentSwitch.checked) {
                const urgentPassportDate = calculateReturnDate(
                    selectedDate,
                    URGENT_PASSPORT_DAYS
                );
                const urgentElement = document.createElement("div");
                urgentElement.className = "return-date-item passport-urgent";
                urgentElement.textContent = `護照急件回件日期：${formatDateMMDD(
                    urgentPassportDate
                )}`;
                returnDates.appendChild(urgentElement);
            }
        }

        if (permitSwitch.checked) {
            const permitDate = calculateReturnDate(selectedDate, PERMIT_DAYS);
            const permitElement = document.createElement("div");
            permitElement.className = "return-date-item permit";
            permitElement.textContent = `台胞證回件日期：${formatDateMMDD(
                permitDate
            )}`;
            returnDates.appendChild(permitElement);

            if (urgentSwitch.checked) {
                const urgentPermitDate = calculateReturnDate(
                    selectedDate,
                    URGENT_PERMIT_DAYS
                );
                const urgentElement = document.createElement("div");
                urgentElement.className = "return-date-item permit-urgent";
                urgentElement.textContent = `台胞證急件回件日期：${formatDateMMDD(
                    urgentPermitDate
                )}`;
                returnDates.appendChild(urgentElement);
            }
        }
    }

    // Generate calendar
    function generateCalendar(year, month) {
        calendarElement.innerHTML = "";

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = new Date(firstDay);
        startDay.setDate(1 - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDay);
            currentDate.setDate(startDay.getDate() + i);

            const dateDiv = document.createElement("div");
            dateDiv.textContent = currentDate.getDate();

            // Add classes for styling
            if (currentDate.getMonth() !== month) {
                dateDiv.classList.add("other-month");
            }
            if (isWeekend(currentDate)) {
                dateDiv.classList.add("weekend");
            }
            if (isHoliday(currentDate)) {
                dateDiv.classList.add("weekday-holiday");
            }
            if (currentDate.toDateString() === new Date().toDateString()) {
                dateDiv.classList.add("today");
            }
            if (
                selectedDate &&
                currentDate.toDateString() === selectedDate.toDateString()
            ) {
                dateDiv.classList.add("selected");
            }

            // Add return date indicators
            if (selectedDate) {
                if (passportSwitch.checked) {
                    const passportDate = calculateReturnDate(
                        selectedDate,
                        PASSPORT_DAYS
                    );
                    if (
                        currentDate.toDateString() ===
                        passportDate.toDateString()
                    ) {
                        dateDiv.classList.add("passport-return");
                    }
                    if (urgentSwitch.checked) {
                        const urgentPassportDate = calculateReturnDate(
                            selectedDate,
                            URGENT_PASSPORT_DAYS
                        );
                        if (
                            currentDate.toDateString() ===
                            urgentPassportDate.toDateString()
                        ) {
                            dateDiv.classList.add("passport-urgent-return");
                        }
                    }
                }
                if (permitSwitch.checked) {
                    const permitDate = calculateReturnDate(
                        selectedDate,
                        PERMIT_DAYS
                    );
                    if (
                        currentDate.toDateString() === permitDate.toDateString()
                    ) {
                        dateDiv.classList.add("permit-return");
                    }
                    if (urgentSwitch.checked) {
                        const urgentPermitDate = calculateReturnDate(
                            selectedDate,
                            URGENT_PERMIT_DAYS
                        );
                        if (
                            currentDate.toDateString() ===
                            urgentPermitDate.toDateString()
                        ) {
                            dateDiv.classList.add("permit-urgent-return");
                        }
                    }
                }
            }

            // Add click event
            dateDiv.addEventListener("click", () => {
                selectedDate = currentDate;
                selectedDateInfo.textContent = `選擇日期：${formatDateMMDD(
                    selectedDate
                )}`;
                updateReturnDates();
                renderCalendar();
            });

            calendarElement.appendChild(dateDiv);
        }
    }

    // Render calendar
    function renderCalendar() {
        monthYearElement.textContent = `${currentYear}年 ${monthNames[currentMonth]}`;
        generateCalendar(currentYear, currentMonth);
    }

    // Event Listeners
    prevMonthButton.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthButton.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Business type switch event listeners
    passportSwitch.addEventListener("change", () => {
        urgentSwitch.disabled =
            !passportSwitch.checked && !permitSwitch.checked;
        if (!passportSwitch.checked && !permitSwitch.checked) {
            urgentSwitch.checked = false;
        }
        updateReturnDates();
        renderCalendar();
    });

    permitSwitch.addEventListener("change", () => {
        urgentSwitch.disabled =
            !passportSwitch.checked && !permitSwitch.checked;
        if (!passportSwitch.checked && !permitSwitch.checked) {
            urgentSwitch.checked = false;
        }
        updateReturnDates();
        renderCalendar();
    });

    urgentSwitch.addEventListener("change", () => {
        updateReturnDates();
        renderCalendar();
    });

    // Initialize
    fetchHolidays();
});
