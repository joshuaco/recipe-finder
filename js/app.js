import loadFavorites from './favorites.js';

function loadApp() {
  const $select = document.getElementById('categorias');

  if ($select) {
    $select.addEventListener('change', selectCategory);
    fetchCategories();
  }

  const $result = document.getElementById('resultado');
  const modal = new bootstrap.Modal('#modal', {});

  async function fetchCategories() {
    const URL = 'https://www.themealdb.com/api/json/v1/1/categories.php';

    try {
      const response = await fetch(URL);
      const data = await response.json();

      showCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch info from API');
    }
  }

  function showCategories(categories = []) {
    categories.forEach((category) => {
      const $option = document.createElement('option');
      $option.value = category.strCategory;
      $option.textContent = category.strCategory;
      $select.appendChild($option);
    });
  }

  async function selectCategory(e) {
    const category = e.target.value;
    const URL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

    const response = await fetch(URL);
    const data = await response.json();
    showMeals(data.meals);
  }

  function showMeals(meals = []) {
    cleanHtml($result);

    const $title = document.createElement('h2');
    $title.classList.add('mb-3', 'text-center');
    meals.length
      ? ($title.textContent = 'Resultados')
      : ($title.textContent = 'No hay resultados');

    $result.appendChild($title);

    meals.forEach((meal) => {
      const { idMeal, strMeal, strMealThumb } = meal;

      const $mealContainer = document.createElement('div');
      $mealContainer.classList.add('col-md-4');

      const $mealCard = document.createElement('div');
      $mealCard.classList.add('card', 'mb-4');

      const $mealImg = document.createElement('img');
      $mealImg.classList.add('card-img-top');
      $mealImg.alt = `Receta de ${strMeal ?? meal.title}`;
      $mealImg.src = strMealThumb ?? meal.image;

      const $mealCardBody = document.createElement('div');
      $mealCardBody.classList.add('card-body');

      const $mealTitle = document.createElement('h3');
      $mealTitle.classList.add('card-title', 'mb-3');
      $mealTitle.textContent = strMeal ?? meal.title;

      const $mealButton = document.createElement('button');
      $mealButton.classList.add('btn', 'btn-danger', 'w-100');
      $mealButton.textContent = 'Ver receta';
      //$mealButton.dataset.bsTarget = '#modal';
      //$mealButton.dataset.bsToggle = 'modal';
      $mealButton.onclick = () => {
        selectMeal(idMeal ?? meal.id);
      };

      /**
       * Add into HTML
       * .card
       *   img
       *   .card-body
       *      .card-title
       *      .btn
       */

      $mealCardBody.appendChild($mealTitle);
      $mealCardBody.appendChild($mealButton);

      $mealCard.appendChild($mealImg);
      $mealCard.appendChild($mealCardBody);

      $mealContainer.appendChild($mealCard);

      $result.appendChild($mealContainer);
    });
  }

  async function selectMeal(idMeal) {
    const URL = `https://themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`;

    const response = await fetch(URL);
    const data = await response.json();

    showMealModal(data.meals[0]);
  }

  function showMealModal(meal) {
    const { idMeal, strInstructions, strMeal, strMealThumb } = meal;

    // Add content to modal
    const $modalTitle = document.querySelector('.modal-title');
    const $modalBody = document.querySelector('.modal-body');

    $modalTitle.textContent = strMeal;
    $modalBody.innerHTML = `
      <img src="${strMealThumb}" class="img-fluid" alt="${strMeal}" />
      <h3 class="my-3">Instructions</h3>
      <p>${strInstructions}</p>
      <h3 class="my-3">Ingredients and measure</h3>
    `;

    const $listGroup = document.createElement('ul');
    $listGroup.classList.add('list-group');
    // Show ingredients and measure (cantidad)
    for (let i = 1; i <= 20; i++) {
      if (meal[`strIngredient${i}`]) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        const $ingredientLi = document.createElement('li');
        $ingredientLi.classList.add('list-group-item');
        $ingredientLi.textContent = `${ingredient} - ${measure}`;

        $listGroup.appendChild($ingredientLi);
      }
    }

    $modalBody.appendChild($listGroup);

    const $modalFooter = document.querySelector('.modal-footer');
    cleanHtml($modalFooter);

    // Close and favorite buttons
    const $btnFavorite = document.createElement('button');
    $btnFavorite.classList.add('btn', 'btn-danger', 'col');
    $btnFavorite.textContent = existFavorite(idMeal)
      ? 'Eliminar de favoritos'
      : 'Agregar a favoritos';

    // LocalStorage
    $btnFavorite.onclick = () => {
      if (existFavorite(idMeal)) {
        deleteFavorite(idMeal);
        $btnFavorite.textContent = 'Agregar a favoritos';
        showToast('Eliminado de favoritos');
        return;
      }

      addFavorite({
        title: strMeal,
        id: idMeal,
        image: strMealThumb,
      });
      $btnFavorite.textContent = 'Eliminar de favoritos';
      showToast('Agregado a favoritos');
    };

    const $btnClose = document.createElement('button');
    $btnClose.classList.add('btn', 'btn-secondary', 'col');
    $btnClose.textContent = 'Cerrar';
    $btnClose.onclick = () => {
      modal.hide();
    };

    $modalFooter.appendChild($btnFavorite);
    $modalFooter.appendChild($btnClose);

    modal.show();
  }

  function addFavorite(meal) {
    const { idMeal } = meal;
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];

    localStorage.setItem('favorites', JSON.stringify([...favorites, meal]));
  }

  function deleteFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
    const filteredFavorites = favorites.filter((meal) => meal.id !== id);

    localStorage.setItem('favorites', JSON.stringify(filteredFavorites));
  }

  function existFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
    return favorites.some((meal) => meal.id === id);
  }

  function showToast(message) {
    const $toastDiv = document.querySelector('#toast');
    const $toastBody = $toastDiv.querySelector('.toast-body');
    const toast = new bootstrap.Toast($toastDiv);

    $toastBody.textContent = message;

    toast.show();
  }

  // Check if .favoritos exists then app.js is in favorites.html
  if (document.querySelector('.favoritos')) {
    loadFavorites(() =>
      showMeals(JSON.parse(localStorage.getItem('favorites')))
    );
  }

  function cleanHtml(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }
}

document.addEventListener('DOMContentLoaded', loadApp);
