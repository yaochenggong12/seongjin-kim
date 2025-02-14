// Firebase 참조
const auth = firebase.auth();
const db = firebase.firestore();
const todosRef = db.collection('todos');

let currentUser = null;
let tasks = [];

// 인증 상태 관찰자
auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        // 로그인 상태
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('todoSection').style.display = 'block';
        document.getElementById('userEmail').textContent = user.email;
    } else {
        // 로그아웃 상태
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('todoSection').style.display = 'none';
    }
    loadTasks(); // 로그인 상태와 관계없이 할일 목록 로드
});

// Google 로그인
document.getElementById('googleLogin').addEventListener('click', async () => {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        const result = await auth.signInWithPopup(provider);
        console.log("로그인 성공:", result.user.email);
    } catch (error) {
        console.error("로그인 에러:", error);
        alert('로그인 중 오류가 발생했습니다: ' + error.message);
    }
});

// 로그아웃
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("로그아웃 에러:", error);
        alert('로그아웃 중 오류가 발생했습니다.');
    }
});

// 페이지 로드시 할일 목록 표시
window.onload = function() {
    loadTasks();
};

// Firebase에서 할일 목록 가져오기
function loadTasks() {
    todosRef
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            tasks = [];
            snapshot.forEach((doc) => {
                const task = {
                    id: doc.id,
                    ...doc.data(),
                    isOwner: currentUser && doc.data().userId === currentUser.uid
                };
                tasks.push(task);
            });
            displayTasks();
        }, (error) => {
            console.error("할일 목록 로딩 에러:", error);
        });
}

// 할일 추가 함수
async function addTask() {
    if (!currentUser) {
        alert('할일을 추가하려면 로그인이 필요합니다.');
        return;
    }

    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (taskText !== '') {
        try {
            await todosRef.add({
                text: taskText,
                completed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: currentUser.uid,
                userEmail: currentUser.email
            });
            
            taskInput.value = '';
        } catch (error) {
            console.error("할일 추가 에러:", error);
            alert('할일 추가 중 오류가 발생했습니다.');
        }
    }
}

// 할일 표시 함수
function displayTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const userInfo = `
            <small class="text-gray-500 ml-2">
                작성자: ${task.userEmail || '알 수 없음'}
            </small>
        `;
        
        const actionButtons = task.isOwner ? `
            <button class="delete-btn" onclick="deleteTask('${task.id}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        ` : '';
        
        const checkbox = `
            <input type="checkbox" 
                   class="task-checkbox form-check-input" 
                   onchange="toggleTask('${task.id}')" 
                   ${task.completed ? 'checked' : ''}
                   ${task.isOwner ? '' : 'disabled'}>
        `;
        
        li.innerHTML = `
            ${checkbox}
            <div class="flex-1">
                <span class="task-text">${task.text}</span>
                ${userInfo}
            </div>
            ${actionButtons}
        `;
        
        taskList.appendChild(li);
    });
}

// 할일 토글 함수 (완료/미완료)
async function toggleTask(id) {
    if (!currentUser) return;
    
    try {
        const task = tasks.find(t => t.id === id);
        await todosRef.doc(id).update({
            completed: !task.completed
        });
    } catch (error) {
        console.error("할일 상태 변경 에러:", error);
        alert('할일 상태 변경 중 오류가 발생했습니다.');
    }
}

// 할일 삭제 함수
async function deleteTask(id) {
    if (!currentUser) return;

    try {
        await todosRef.doc(id).delete();
    } catch (error) {
        console.error("할일 삭제 에러:", error);
        alert('할일 삭제 중 오류가 발생했습니다.');
    }
}

// Enter 키로 할일 추가
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});
