let restaurants,
  neighborhoods,
  cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  // initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurants();
  addShowMapButton();
  showMap()
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}
// add a show map button
addShowMapButton = () => {
  const container =  document.querySelector('.map-container');
  const button = document.createElement('button');
  button.setAttribute('id', 'show-map');
  button.innerHTML = 'Show Map';
  container.appendChild(button)
}
// show map
showMap = () => {
  const button = document.querySelector("#show-map");
  const parent = button.parentElement;
  const map = button.previousElementSibling;

  button.addEventListener('click', () => {
    parent.removeChild(button);
    map.style.display = 'block';
    const link = document.createElement('link');
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "https://unpkg.com/leaflet@1.3.1/dist/leaflet.css");
    document.head.appendChild(link);

    initMap();
  })
}

// Set neighborhoods HTML.
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

// Fetch all cuisines and set their HTML.
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

// Set cuisines HTML.
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

// Initialize leaflet map, called from HTML.
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoidW1hcnl1c3VmIiwiYSI6ImNqa2pzMzV6bzBzOGQzcHBoZWI4eGZ6Y3IifQ.AbhumTLiRdMM7isvxmlE-w',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

}

// Update page and map for current restaurants.
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
      setFavoritesAction();
    }
  });
}

// Clear current restaurants, their HTML and remove their map markers.
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.querySelector('.restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

// Create all restaurants HTML and add them to the webpage.
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.querySelector('.restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

// Create restaurant HTML.
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imgSrcSetRestaurant(restaurant);
  // add alt attribute to image tag
  image.alt = `image of ${restaurant.name} Restaurant`;
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  const like = document.createElement('button');
  like.setAttribute('data-id', restaurant.id);
  like.innerHTML = "❤️ favourite";
  like.setAttribute("data-favourite", false);
  DBHelper.fetchFavouriteRestaurants()
    .then(res => res.json())
    .then(data => {
      for(favourite of data) {
        if (favourite.id === restaurant.id) {
          like.innerHTML = "❤️ Unfavorite";
          like.setAttribute("data-favourite", true);
        }
      } 
    });
  
  li.append(like);

  return li;
}

// Add markers for current restaurants to the map.
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}
// sets the action for favorite button
setFavoritesAction = () => {
  // add favorite functionalities
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      // get current restaurant id
      const restaurantId = this.getAttribute('data-id');

      if (this.getAttribute("data-favourite") === "true") {
        // unfavourite a restaurant
        DBHelper.unFavouriteRestaurant(restaurantId)
          .then(res => {
            console.log("unfavourite restaurant", res);
            if (res.statusText === "OK") {
              this.innerHTML = "❤️ Favorite";
              this.setAttribute("data-favourite", false);
            }
          })
          .catch(err => console.log(err));

      } else {
        // favourite a restaurant;
        DBHelper.favouriteRestaurant(restaurantId)
          .then((res) => {
            console.log('favourite restaurant', res);
            if(res.statusText === "OK") {
              this.innerHTML = "❤️ Unfavorite";
              this.setAttribute("data-favourite", true);
            }
          })
          .catch(err => console.log(err));
      }
    })
  })
}
