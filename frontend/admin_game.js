let currentStep = 1;
let gameDetails = {};

function nextStep(next) {
  if (next > currentStep) {
    if (currentStep === 1) {
      gameDetails.name = document.getElementById('gameName').value;
    } else if (currentStep === 2) {
      gameDetails.startDate = document.getElementById('startDate').value;
      gameDetails.startTime = document.getElementById('startTime').value;
      gameDetails.endDate = document.getElementById('endDate').value;
      gameDetails.endTime = document.getElementById('endTime').value;
    }
    currentStep = next;
    updateFormVisibility();
  }
}

function updateFormVisibility() {
  const formSteps = document.querySelectorAll('.form-step');
  formSteps.forEach((step) => {
    step.style.display = 'none';
  });
  document.getElementById(`step${currentStep}`).style.display = 'block';
}

function submitForm() {
  gameDetails.description = document.getElementById('description').value;
  addGameToList();
  resetForm();
}

function addGameToList() {
  const gamesList = document.getElementById('gamesList');
  const listItem = document.createElement('li');
  listItem.innerHTML = `<strong>${gameDetails.name}</strong><p>Start: ${gameDetails.startDate} ${gameDetails.startTime}</p><p>End: ${gameDetails.endDate} ${gameDetails.endTime}</p><p>${gameDetails.description}</p>`;
  listItem.addEventListener('click', () => {
    // Assuming there's a details page at /game-details.html that takes a query parameter for the game name
    window.location.href = `/game-details.html?name=${encodeURIComponent(gameDetails.name)}`;
  });
  gamesList.appendChild(listItem);
}

function resetForm() {
  currentStep = 1;
  gameDetails = {};
  document.getElementById('gameForm').reset();
  updateFormVisibility();
}
