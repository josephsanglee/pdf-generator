const droneDeployAPI = new DroneDeploy({ version: 1});

/************************API HELPER FUNCTIONS************************/

const fetchPlan = (api) => {
  return api.Plans.getCurrentlyViewed()
  .then(plan => {
    return { api, plan };
  });
};

const fetchTileDataFromPlan = (apiAndPlan) => {
  let api = apiAndPlan.api;
  const plan = apiAndPlan.plan;

  return api.Tiles.get({ planId: plan.id, layerName: 'ortho', zoom: 19 });
};

const fetchTiles = (tileInformation) => {
  return tileInformation.tiles;
};

/***************************EVENT HANDLERS***************************/

const exportPDF = () => {
  droneDeployAPI
  .then(fetchPlan)
  .then(fetchTileDataFromPlan)
  .then(fetchTiles)
  .then(tiles => {
    console.log(tiles);
  });
};

$('document').ready(() => {
  $('.pdf-button').on('click', exportPDF);
});