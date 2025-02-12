// 로컬 스토리지에서 할일 목록 가져오기
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// 페이지 로드시 할일 목록 표시
window.onload = function() {
    displayTasks();
};

// 할일 추가 함수
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (taskText !== '') {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(task);
        saveTasks();
        displayTasks();
        taskInput.value = '';
    }
}

// 할일 표시 함수
function displayTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" 
                   class="task-checkbox form-check-input" 
                   onchange="toggleTask(${task.id})" 
                   ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        
        taskList.appendChild(li);
    });
}

// 할일 토글 함수 (완료/미완료)
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    displayTasks();
}

// 할일 삭제 함수
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    displayTasks();
}

// 로컬 스토리지에 할일 목록 저장
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Enter 키로 할일 추가
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});
