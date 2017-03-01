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

  return api.Tiles.get({ planId: plan.id, layerName: 'ortho', zoom: 17 });
};

const fetchTiles = (tileInformation) => {
  console.log(tileInformation);
  return tileInformation.tiles;
};

/***************************EVENT HANDLERS***************************/

const exportPDF = () => {
  droneDeployAPI
  .then(fetchPlan)
  .then(fetchTileDataFromPlan)
  .then(fetchTiles)
  .then(tiles => {
    const doc = new jsPDF();
    // const myImage = new Image();
    const myHeaders = new Headers();
    const myInit = {
      method: 'GET',
      headers: myHeaders,
      mode: 'no-cors',
      cache: 'default',
    };

    fetch(tiles[0], myInit)
    .then(response => console.log(response));

    // myImage.src = tiles[0];
    // myImage.crossOrigin = 'Anonymous';

    // myImage.onload = function() {
    //   doc.addImage(myImage, 'png', 5, 5, 40, 10);

    //   doc.save('map.pdf');
    // };
  });
};

$('document').ready(() => {
  $('.pdf-button').on('click', exportPDF);
});