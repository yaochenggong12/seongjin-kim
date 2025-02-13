// 질문과 답변을 저장할 배열
let questions = [];

// 질문 제출 함수
function submitQuestion() {
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    if (!subject || !title || !content) {
        alert('모든 필드를 입력해주세요!');
        return;
    }

    const question = {
        id: Date.now(),
        subject: subject,
        title: title,
        content: content,
        answers: [],
        timestamp: new Date().toLocaleString(),
        answerCount: 0
    };

    questions.unshift(question);
    updateQuestionsList();
    clearForm();
}

// 질문 목록 업데이트 함수
function updateQuestionsList() {
    const questionsList = document.getElementById('questionsList');
    const filteredQuestions = filterQuestions();
    
    questionsList.innerHTML = '';

    filteredQuestions.forEach(question => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.onclick = () => showQuestionDetail(question.id);
        questionCard.innerHTML = `
            <div class="question-subject">${question.subject}</div>
            <div class="question-title">${question.title}</div>
            <div class="question-content">${truncateText(question.content, 100)}</div>
            <div class="question-meta">
                <span><i class="far fa-clock"></i> ${question.timestamp}</span>
                <span><i class="far fa-comment"></i> 답변 ${question.answers.length}개</span>
            </div>
        `;
        questionsList.appendChild(questionCard);
    });
}

// 텍스트 자르기 함수
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

// 질문 상세보기 표시 함수
function showQuestionDetail(questionId) {
    const question = questions.find(q => q.id === questionId);
    const modal = document.getElementById('questionModal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = `
        <div class="question-subject">${question.subject}</div>
        <h2>${question.title}</h2>
        <p class="question-content">${question.content}</p>
        <small><i class="far fa-clock"></i> ${question.timestamp}</small>
        
        <div class="answers">
            <h3>답변 ${question.answers.length}개</h3>
            ${question.answers.length === 0 ? 
                '<p class="no-answers">아직 답변이 없습니다. 첫 답변을 작성해보세요!</p>' : 
                question.answers.map(answer => `
                    <div class="answer">
                        <p>${answer.content}</p>
                        <small><i class="far fa-clock"></i> ${answer.timestamp}</small>
                    </div>
                `).join('')
            }
            
            <div class="answer-form">
                <input type="text" id="answer-${question.id}" placeholder="답변을 입력하세요">
                <button onclick="submitAnswer(${question.id})">답변하기</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';

    // 모달 닫기 버튼
    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.onclick = () => modal.style.display = 'none';

    // 모달 외부 클릭시 닫기
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// 답변 제출 함수
function submitAnswer(questionId) {
    const answerInput = document.getElementById(`answer-${questionId}`);
    const answerText = answerInput.value;

    if (!answerText) {
        alert('답변을 입력해주세요!');
        return;
    }

    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        questions[questionIndex].answers.push({
            content: answerText,
            timestamp: new Date().toLocaleString()
        });
        showQuestionDetail(questionId); // 상세보기 새로고침
        answerInput.value = '';
    }
}

// 질문 필터링 함수
function filterQuestions() {
    const filterSubject = document.getElementById('filterSubject').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase();

    return questions.filter(question => {
        const subjectMatch = !filterSubject || question.subject === filterSubject;
        const searchMatch = !searchText || 
            question.title.toLowerCase().includes(searchText) || 
            question.content.toLowerCase().includes(searchText);
        return subjectMatch && searchMatch;
    });
}

// 폼 초기화 함수
function clearForm() {
    document.getElementById('subject').value = '';
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
}

// 초기 질문 목록 업데이트
updateQuestionsList();

// 모달 닫기 이벤트 리스너
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.getElementById('questionModal').style.display = 'none';
    }
});
