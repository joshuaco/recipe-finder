const $favoritesDiv = document.querySelector('.favoritos');

function loadFavorites(showMeals) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];

  if (favorites.length) {
    showMeals(favorites);
    return;
  }

  const $p = document.createElement('p');
  $p.textContent = 'No hay favoritos';
  $p.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');

  $favoritesDiv.appendChild($p);
}

export default loadFavorites;
