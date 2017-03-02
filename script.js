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
  console.log(tileInformation);
  return tileInformation.tiles;
};

/************************PDF HELPER FUNCTIONS************************/

const fetchTileImageData = (tiles) => {
  const tilesDataPromises = tiles.map((tileURL) => {
    return fetch(`https://dd-app-proxy-server.herokuapp.com/${tileURL}`);
  });

  return Promise.all(tilesDataPromises);
};

const convertToBlobs = (tileImageData) => {
  return Promise.all(tileImageData.map(imageData => imageData.blob()));
};

const convertToObjectUrls = (blobs) => {
  return Promise.all(blobs.map(blob => URL.createObjectURL(blob)));
};

const createTileCoordinates = (doc, urls) => {
  const topMargin = 50;
  const imageSize = 35;
  const maxY = (imageSize * 6) + topMargin;
  let curX = -10;
  let curY = topMargin;

  return urls.map(url => {
    let x = curX;
    let y = curY;
    curY += imageSize;

    if (curY >= maxY) {
      curX += imageSize;
      curY = topMargin;
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;

      image.onload = () => {
        doc.addImage(image, 'PNG', x, y, imageSize, imageSize);
        resolve();
      };
    });
  });
};

const createPDF = (objectUrls) => {
  const doc = new jsPDF();

  doc.setFontSize(40);
  doc.text(80, 25, 'A MAP!');

  const tileImages = createTileCoordinates(doc, objectUrls);

  Promise.all(tileImages)
  .then((success) => {
    $('#icon-text').empty();
    $('#icon-text').append('Generate');
    doc.save('map.pdf');
  });
};

/***************************EVENT HANDLERS***************************/

const exportPDF = () => {
  $('#icon-text').empty();
  $('#icon-text').append('Generating...');

  droneDeployAPI
  .then(fetchPlan)
  .then(fetchTileDataFromPlan)
  .then(fetchTiles)
  .then(fetchTileImageData)
  .then(convertToBlobs)
  .then(convertToObjectUrls)
  .then(createPDF);
};

$('document').ready(() => {
  $('.pdf-button').on('click', exportPDF);
});
