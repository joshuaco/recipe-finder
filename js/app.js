function loadApp() {
  const $select = document.getElementById('categorias');
  $select.addEventListener('change', selectCategory);

  const $result = document.getElementById('resultado');
  const $modal = new bootstrap.Modal('#modal', {});

  fetchCategories();
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
      $mealImg.alt = `Receta de ${strMeal}`;
      $mealImg.src = strMealThumb;

      const $mealCardBody = document.createElement('div');
      $mealCardBody.classList.add('card-body');

      const $mealTitle = document.createElement('h3');
      $mealTitle.classList.add('card-title', 'mb-3');
      $mealTitle.textContent = strMeal;

      const $mealButton = document.createElement('button');
      $mealButton.classList.add('btn', 'btn-danger', 'w-100');
      $mealButton.textContent = 'Ver receta';
      //$mealButton.dataset.bsTarget = '#modal';
      //$mealButton.dataset.bsToggle = 'modal';
      $mealButton.onclick = () => {
        selectMeal(idMeal);
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

    $modal.show();
  }

  function cleanHtml(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }
}

loadApp();
