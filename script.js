var pdfButton = document.querySelector('.pdf-button');

var fetchTileDataFromPlan = function(api, plan) {
  return api.Tiles.get({ planId: plan.id, layerName: 'ortho', zoom: 17 })
  .then(function(tiles) {
    console.log('this is the return', tiles);
  });
};

var getPDF = function() {
  new DroneDeploy({ version: 1 }).then(function(api) {
    return { 
      api: api,
      plan: api.Plans.getCurrentlyViewed(),
    };
  })
  .then(function(object) {
    return object.plan
    .then(function(plan) {
      return fetchTileDataFromPlan(object.api, plan);
    });
  })
  .then(function(tileInformation) {
    console.log('tile info', tileInformation);
    return tileInformations.tiles;
  })
  .then(function(tiles) {
    console.log(tiles);
  });
};

pdfButton.addEventListener('click', getPDF);