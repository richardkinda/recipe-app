const mealsEl = document.getElementById('meals')
const favoriteContainer = document.getElementById('fav-meals')
const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search')
const mealPopup = document.getElementById('meal-popup')
const mealPopupBtn = document.getElementById('popup-close')
const mealInfoEl = document.getElementById('meal-info')

getRandomMeal()
fectchFavMeals()

async function getRandomMeal() {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    const data = await response.json()
    const randomMeal = data.meals[0]

    loadMeal(randomMeal, true)

}

async function getMealById(id) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
    const data = await response.json()
    const meal = data.meals[0]

    return meal
}

async function getMealsBySearch(term) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term)
    const data = await response.json()
    const meal = data.meals

    return meal
}

function checkIfMealExists(id) {
    // const id = '52803'
    let result = false
    const meals = localStorage.getItem('mealIds')
    if (meals) {
        const mealsData = JSON.parse(meals)
        console.log(mealsData)

        mealsData.forEach(meal => {
            if (meal === id) {
                result = true
                return result
            }
        })
    }
    return result
}

function loadMeal(mealData, random = false) {
    // check if the meal already exist in the fav
    const mealId = (mealData.idMeal).toString()
    const result = checkIfMealExists(mealId)

    const meal = document.createElement('div')
    meal.classList.add('meal')

    meal.innerHTML = `

          <div class="meal-header">
           ${random ? `
           <span class="random"> Random Recipe </span>` : ''}
            <img 
              src="${mealData.strMealThumb}"
              alt="${mealData.strMeal}"
            />
          </div>
          <div class="meal-body">
            <h4 class="meal-name">${mealData.strMeal}</h4>
            <button id="fav-btn" class="fav-btn">
              <i class="fas fa-heart"></i>
            </button>
          </div>
    `
    const btn = meal.querySelector('.meal-body .fav-btn')

    if (result === false) {
        btn.classList.remove('active')
    }

    btn.addEventListener('click', () => {
        // if (btn.classList.contains('active')) {
        //     removeMealFromLocalStorage(mealData.idMeal)
        //     btn.classList.remove('active')
        // } else {
        //     addMealToLocalStorage(mealData.idMeal)
        //     btn.classList.add('active')
        // }

        // if meal already in the fav, cant add and have alert saying already exists
        if (result) {
            alert('Already existed in the fav')
        } else {

            addMealToLocalStorage(mealData.idMeal)
            location.reload();
            //alert('we did it')
        }

        // else add and alert saying successfully added to the fav

        fectchFavMeals()
    })

    const name = meal.querySelector('.meal-body .meal-name')
    name.addEventListener('click', () => {
        loadPopupInfo(mealData)
    })

    const img = meal.querySelector('.meal-header img')
    img.addEventListener('click', () => {
        loadPopupInfo(mealData)
    })

    // meal.addEventListener('click', () => {
    //     loadPopupInfo(mealData)
    // })

    mealsEl.appendChild(meal)
}





function addMealToLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage()

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))
}

function removeMealFromLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage()

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id != mealId)))

}

function getMealsFromLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'))

    return mealIds === null ? [] : mealIds
}

async function fectchFavMeals() {

    // clean the container
    favoriteContainer.innerHTML = ''

    const mealIds = getMealsFromLocalStorage()

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i]
        const meal = await getMealById(mealId)
        addMealToFav(meal)
    }

}


function addMealToFav(mealData) {

    const favMeal = document.createElement('li')

    favMeal.innerHTML = `

    <li>
        <img
        class="group1"
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
        />
        <span class="group2">${mealData.strMeal}</span>
        <button class="delete"><i class="fas fa-window-close"></i></button>
    </li>
          
    `

    const btn = favMeal.querySelector('.delete')
    btn.addEventListener('click', () => {
        removeMealFromLocalStorage(mealData.idMeal)
        fectchFavMeals()
        // reload meals
        // loadMeal(mealData)
        location.reload();

    })

    const image = favMeal.querySelector('img')
    image.addEventListener('click', () => {
        loadPopupInfo(mealData)
    })

    const mealTitle = favMeal.querySelector('span')
    mealTitle.addEventListener('click', () => {
        loadPopupInfo(mealData)
    })

    // favMeal.addEventListener('click', () => {
    //     loadPopupInfo(mealData)
    // })

    /////

    // TODO: unclick the fav button

    /////

    favoriteContainer.appendChild(favMeal)
}

searchBtn.addEventListener('click', async () => {

    mealsEl.innerHTML = ''

    const mealName = searchTerm.value
    const meals = await getMealsBySearch(mealName)



    if (meals) {
        meals.forEach(meal => loadMeal(meal))
    }

})


mealPopupBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden')
})


function loadPopupInfo(mealData) {
    // Clean the mealInfoEl
    mealInfoEl.innerHTML = ''

    const ingredients = []

    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredients.push(`${mealData['strIngredient' + i]} -
            ${mealData['strMeasure' + i]}`)
        } else {
            break
        }
    }

    // create the info
    const mealEl = document.createElement('div')

    mealEl.innerHTML = `

        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        />
        <p>
        ${mealData.strInstructions}
        </p>
        <br/>
        <hr/>
        <br/>

        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map(ingredient => `
            <li>${ingredient}</li>
            `).join('')}
        </ul>
        
    `
    // Add info to the parent container
    mealInfoEl.appendChild(mealEl)
    mealPopup.classList.remove('hidden')
}



