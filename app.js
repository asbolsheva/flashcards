const STORAGE_KEY = 'flashcards';

function loadCards() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function addCard(question, answer) {
  const cards = loadCards();
  cards.push({
    id: Date.now().toString(),
    question: question,
    answer: answer,
  });
  saveCards(cards);
}

const form = document.getElementById('add-card-form');
const questionInput = document.getElementById('question');
const answerInput = document.getElementById('answer');
const cardList = document.getElementById('card-list');
const emptyState = document.getElementById('empty-state');

function renderCards() {
  const cards = loadCards();
  cardList.innerHTML = '';
  emptyState.hidden = cards.length > 0;

  cards.forEach(function (card) {
    const item = document.createElement('li');
    item.className = 'card';

    const question = document.createElement('p');
    question.className = 'card-question';
    question.textContent = card.question;

    const answer = document.createElement('p');
    answer.className = 'card-answer';
    answer.textContent = card.answer;

    item.appendChild(question);
    item.appendChild(answer);
    cardList.appendChild(item);
  });
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!question || !answer) {
    return;
  }

  addCard(question, answer);
  renderCards();
  form.reset();
  questionInput.focus();
});

renderCards();
