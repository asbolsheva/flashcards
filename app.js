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
    status: null, // 'known' or 'learning' once marked in review
  });
  saveCards(cards);
}

function deleteCard(id) {
  const cards = loadCards().filter(function (c) {
    return c.id !== id;
  });
  saveCards(cards);
}

function setCardStatus(id, status) {
  const cards = loadCards();
  const card = cards.find(function (c) {
    return c.id === id;
  });
  if (card) {
    card.status = status;
    saveCards(cards);
  }
}

// ---- Manage view: add cards and list them ----

const manageView = document.getElementById('manage-view');
const form = document.getElementById('add-card-form');
const questionInput = document.getElementById('question');
const answerInput = document.getElementById('answer');
const cardList = document.getElementById('card-list');
const emptyState = document.getElementById('empty-state');
const startReviewButton = document.getElementById('start-review');
const formError = document.getElementById('form-error');
const cardCount = document.getElementById('card-count');

// e.g. "12 cards in this deck · 5 still learning · 3 new"
// "New" means the card has never been marked in review (status is null).
function renderCardCount(cards) {
  const learningCount = cards.filter(function (c) {
    return c.status === 'learning';
  }).length;
  const newCount = cards.filter(function (c) {
    return !c.status;
  }).length;
  const cardWord = cards.length === 1 ? 'card' : 'cards';
  cardCount.textContent =
    cards.length + ' ' + cardWord + ' in this deck · ' +
    learningCount + ' still learning · ' +
    newCount + ' new';
  cardCount.hidden = cards.length === 0;
}

function renderCards() {
  const cards = loadCards();
  cardList.innerHTML = '';
  emptyState.hidden = cards.length > 0;
  startReviewButton.disabled = cards.length === 0;
  renderCardCount(cards);

  cards.forEach(function (card) {
    const item = document.createElement('li');
    item.className = 'card';

    const content = document.createElement('div');
    content.className = 'card-content';

    const question = document.createElement('p');
    question.className = 'card-question';
    question.textContent = card.question;

    const answer = document.createElement('p');
    answer.className = 'card-answer';
    answer.textContent = card.answer;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', 'Delete card: ' + card.question);
    deleteButton.addEventListener('click', function () {
      deleteCard(card.id);
      renderCards();
    });

    content.appendChild(question);
    content.appendChild(answer);
    item.appendChild(content);
    item.appendChild(deleteButton);
    cardList.appendChild(item);
  });
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function clearFormError() {
  formError.textContent = '';
  formError.hidden = true;
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  // Reject empty or whitespace-only input so blank cards can't be created.
  if (!question || !answer) {
    showFormError('Please fill in both the question and the answer.');
    (question ? answerInput : questionInput).focus();
    return;
  }

  clearFormError();
  addCard(question, answer);
  renderCards();
  form.reset();
  questionInput.focus();
});

questionInput.addEventListener('input', clearFormError);
answerInput.addEventListener('input', clearFormError);

// Shift+Enter in either field adds the card. Plain Enter inserts a new line.
// isComposing skips the Enter that confirms IME input (e.g. Japanese, Chinese).
[questionInput, answerInput].forEach(function (input) {
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
});

// ---- Review view: flip cards and mark them ----

const reviewView = document.getElementById('review-view');
const reviewSession = document.getElementById('review-session');
const reviewCard = document.getElementById('review-card');
const reviewSide = document.getElementById('review-side');
const reviewText = document.getElementById('review-text');
const reviewDone = document.getElementById('review-done');
const exitReviewButton = document.getElementById('exit-review');
const markKnownButton = document.getElementById('mark-known');
const markLearningButton = document.getElementById('mark-learning');

let reviewCards = [];
let reviewIndex = 0;
let showingAnswer = false;

function isReviewing() {
  return !reviewView.hidden;
}

function startReview() {
  reviewCards = loadCards();
  if (reviewCards.length === 0) {
    return;
  }
  reviewIndex = 0;
  manageView.hidden = true;
  reviewView.hidden = false;
  showReviewCard();
}

function exitReview() {
  reviewView.hidden = true;
  manageView.hidden = false;
  renderCards();
}

function showReviewCard() {
  const finished = reviewIndex >= reviewCards.length;
  reviewSession.hidden = finished;
  reviewDone.hidden = !finished;
  if (finished) {
    return;
  }
  showingAnswer = false;
  renderReviewSide();
}

function renderReviewSide() {
  const card = reviewCards[reviewIndex];
  reviewSide.textContent = showingAnswer ? 'Answer' : 'Question';
  reviewText.textContent = showingAnswer ? card.answer : card.question;
  reviewCard.classList.toggle('flipped', showingAnswer);
}

function flipCard() {
  if (reviewIndex >= reviewCards.length) {
    return;
  }
  showingAnswer = !showingAnswer;
  renderReviewSide();
}

function markCard(status) {
  setCardStatus(reviewCards[reviewIndex].id, status);
  reviewIndex++;
  showReviewCard();
}

startReviewButton.addEventListener('click', startReview);
exitReviewButton.addEventListener('click', exitReview);
reviewCard.addEventListener('click', flipCard);
markKnownButton.addEventListener('click', function () {
  markCard('known');
});
markLearningButton.addEventListener('click', function () {
  markCard('learning');
});

// Space flips the card. preventDefault stops the page from scrolling and
// stops a focused button (e.g. "Known") from being pressed again by Space.
document.addEventListener('keydown', function (event) {
  if (!isReviewing() || event.code !== 'Space') {
    return;
  }
  event.preventDefault();
  if (!event.repeat) {
    flipCard();
  }
});

document.addEventListener('keyup', function (event) {
  if (isReviewing() && event.code === 'Space') {
    event.preventDefault();
  }
});

renderCards();
