// 페이지 로드 시 저장된 데이터 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

// 등록된 데이터를 저장할 객체
let teachers = {};
let attendanceHistory = {};

// 데이터 로드 함수
function loadData() {
    const storedTeachers = localStorage.getItem('teachers');
    const storedHistory = localStorage.getItem('attendanceHistory');
    
    if (storedTeachers) {
        teachers = JSON.parse(storedTeachers);
    }
    if (storedHistory) {
        attendanceHistory = JSON.parse(storedHistory);
    }
}

// 데이터 저장 함수
function saveData() {
    localStorage.setItem('teachers', JSON.stringify(teachers));
    localStorage.setItem('attendanceHistory', JSON.stringify(attendanceHistory));
}

// 등록 버튼 클릭 시 팝업 열기
document.getElementById('registerBtn').addEventListener('click', () => {
    const popup = window.open('', 'registerPopup', 'width=300,height=200');
    popup.document.write(`
        <html>
        <head>
            <title>등록</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                input { margin: 5px; padding: 5px; }
                button { padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
                button:hover { background-color: #45a049; }
            </style>
        </head>
        <body>
            <h2>선생님 등록</h2>
            <input type="text" id="phone" placeholder="전화번호 뒷자리" maxlength="4"><br>
            <input type="text" id="name" placeholder="이름"><br>
            <button id="submitBtn">등록</button>
            <script>
                document.getElementById('submitBtn').addEventListener('click', () => {
                    const phone = document.getElementById('phone').value;
                    const name = document.getElementById('name').value;
                    if (phone && name) {
                        window.opener.registerTeacher(phone, name);
                        setTimeout(() => { window.close(); }, 100); // 저장 후 창 닫기
                    } else {
                        alert('전화번호와 이름을 입력하세요.');
                    }
                });

                // 엔터 키로 등록
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        document.getElementById('submitBtn').click();
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// 선생님 등록 함수
function registerTeacher(phone, name) {
    teachers[phone] = name;
    saveData(); // 데이터 저장
    alert(`${name} 선생님이 등록되었습니다.`); // 알림 표시
}

// 출석 버튼 클릭 시
document.getElementById('attendBtn').addEventListener('click', () => {
    checkAttendance();
});

// 엔터 키로 출석
document.getElementById('phoneInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkAttendance();
    }
});

function checkAttendance() {
    const phone = document.getElementById('phoneInput').value;
    if (teachers[phone]) {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const date = now.toLocaleDateString();
        
        // 출석 현황에 추가 (새로운 항목이 맨 위로)
        const list = document.getElementById('attendanceList');
        const newEntry = `<p>${phone} - ${teachers[phone]} - ${time}</p>`;
        list.innerHTML = newEntry + list.innerHTML;
        
        // 히스토리에 저장
        if (!attendanceHistory[date]) {
            attendanceHistory[date] = [];
        }
        attendanceHistory[date].push(`${phone} - ${teachers[phone]} - ${time}`);
        
        saveData(); // 데이터 저장
        document.getElementById('phoneInput').value = '';
    } else {
        alert('등록되지 않은 번호입니다.');
    }
}

// 히스토리 버튼 클릭 시
document.getElementById('historyBtn').addEventListener('click', () => {
    const historyPopup = window.open('', 'historyPopup', 'width=400,height=300');
    historyPopup.document.write(`
        <html>
        <head>
            <title>출석 히스토리</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                input { margin: 5px; padding: 5px; }
            </style>
        </head>
        <body>
            <h2>출석 히스토리</h2>
            <input type="date" id="datePicker"><br>
            <div id="historyList"></div>
            <script>
                const datePicker = document.getElementById('datePicker');
                datePicker.addEventListener('change', () => {
                    const selectedDate = datePicker.value;
                    const history = window.opener.getHistory(selectedDate);
                    const list = document.getElementById('historyList');
                    list.innerHTML = history.length > 0 ? history.map(item => '<p>' + item + '</p>').join('') : '<p>기록 없음</p>';
                });
            </script>
        </body>
        </html>
    `);
});

// 히스토리 반환 함수
function getHistory(date) {
    const formattedDate = new Date(date).toLocaleDateString();
    return attendanceHistory[formattedDate] || [];
}