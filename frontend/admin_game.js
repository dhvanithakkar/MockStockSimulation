let currentStep = 1;
let gameDetails = {};
const CollegeID = 1;

function nextStep(next) {
  if (next > currentStep) {
    if (currentStep === 1) {
      gameDetails.CompetitionName = document.getElementById('gameName').value;
    } else if (currentStep === 2) {
      formatDateTime();
      gameDetails.CollegeID = CollegeID;
    } else if (currentStep === 3) {

      gameDetails.InitialCash = Number(document.getElementById('initialBudget').value);
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

async function submitForm() {
  gameDetails.Description = document.getElementById('description').value;

  try {
    const response = await fetch('http://localhost:5500/organiser/makeGame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameDetails)
    });

    if (response.ok) {
      addGameToList();
      resetForm();
      await fetchGames(); // Call to fetch games after successful creation
    } else {
      console.error('Error creating game:', await response.text());
      // Handle API errors by displaying an error message to the user
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    // Handle other errors during the fetch request
  }
}


function addGameToList() {
  const gamesList = document.getElementById('gamesList');
  const listItem = document.createElement('li');
  listItem.innerHTML = `<strong>${gameDetails.name}</strong><p>Start: ${gameDetails.startDate} ${gameDetails.startTime}</p><p>End: ${gameDetails.endDate} ${gameDetails.endTime}</p><p>Initial Budget: ${gameDetails.initialBudget}</p><p>${gameDetails.description}</p>`;
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
async function fetchGames() {
  try {
    const response = await fetch('/organiser/displayGames');
    if (response.ok) {
      const games = await response.json();
      displayGames(games);
    } else {
      console.error('Error fetching games:', await response.text());
      // Handle API errors by displaying an error message to the user
    }
  } catch (error) {
    console.error('Error fetching games:', error);
    // Handle other errors during the fetch request
  }
}
function displayGames(games) {
  const gameList = document.getElementById('gameListFetched');
  gameList.innerHTML = ''; // Clear existing content

  games.forEach(game => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<strong>${game.CompetitionName}</strong>
                          <p>Start: ${game.StartDate}</p>
                          <p>End: ${game.EndDate}</p>
                          <p>Initial Budget: ${game.InitialCash}</p>
                          <p>${game.Description}</p>`;
    // Add event listener for details page similar to addGameToList function
    gameList.appendChild(listItem);
  });
}
function formatDateTime() {
  var startDate = document.getElementById('startDate').value;
  var startTime = document.getElementById('startTime').value;
  var endDate = document.getElementById('endDate').value;
  var endTime = document.getElementById('endTime').value;

  var startDateTime = startDate + ' ' + startTime + ':00';
  var endDateTime = endDate + ' ' + endTime + ':00';

  gameDetails.StartDate = startDateTime;
  gameDetails.EndDate = endDateTime;
}