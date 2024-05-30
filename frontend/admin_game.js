let currentStep = 1;
let gameDetails = {};
const CollegeID = 1;
fetchGames();

function nextStep(next) {
  if (next > currentStep) {
    gameDetails.CompetitionName = document.getElementById('gameName').value;
    gameDetails.CollegeID = CollegeID;
    console.log("Initial cash is", document.getElementById('initialBudget').value);
     // Moved outside
    gameDetails.NumberOfParticipants = 100;
    formatDateTime(); // Assuming formatDateTime doesn't rely on previous steps

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
  gameDetails.InitialCash = Number(document.getElementById('initialBudget').value);

  try {
    const response = await fetch('http://localhost:5500/organiser/makeGame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameDetails)
    });

    if (response.ok) {
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


function resetForm() {
  currentStep = 1;
  gameDetails = {};
  document.getElementById('gameForm').reset();
  updateFormVisibility();
}
async function fetchGames() {
  try {
    const response = await fetch('http://localhost:5500/organiser/displayGames');
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
  console.log(games);
  const gameList = document.getElementById('gameListFetched');
  gameList.innerHTML = ''; // Clear existing content

  games.forEach(game => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="admin_detail.html?gameId=${game.GameID}">
                            <strong>${game.CompetitionName}</strong>
                          </a>
                          <p>Start: ${game.StartDate}</p>
                          <p>End: ${game.EndDate}</p>
                          <p>Initial Budget: ${game.InitialCash}</p>
                          <p>${game.Description}</p>`;
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