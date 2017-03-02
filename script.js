const droneDeployAPI = new DroneDeploy({ version: 1});

/************************API HELPER FUNCTIONS************************/

const fetchPlan = (api) => {
  return api.Plans.getCurrentlyViewed()
  .then(plan => {
    return { api, plan };
  });
};

const fetchTileData = (apiAndPlan) => {
  let api = apiAndPlan.api;
  const plan = apiAndPlan.plan;

  return api.Tiles.get({ planId: plan.id, layerName: 'ortho', zoom: 19 });
};

const fetchTiles = (tileInformation) => {
  console.log(tileInformation);
  return tileInformation.tiles;
};

/************************PDF HELPER FUNCTIONS************************/

// Uses a proxy server to enable cross-origin requests by adding
// CORS headers to the proxied request.
// Returns an array of image data from the requested resources.
const fetchTileImageData = (tiles) => {
  const tilesDataPromises = tiles.map((tileURL) => {
    return fetch(`https://dd-app-proxy-server.herokuapp.com/${tileURL}`);
  });

  return Promise.all(tilesDataPromises);
};

// Converts the image data to blobs, which are objects that
// allow you to use the blob as if it was a file on the browser.
const convertToBlobs = (tileImageData) => {
  return Promise.all(tileImageData.map(imageData => imageData.blob()));
};

// Converts the blobs to object URLs so that they can be used as 
// sources for HTMLImageElement instances that will be added to 
// the PDF.
const convertToObjectUrls = (blobs) => {
  return Promise.all(blobs.map(blob => URL.createObjectURL(blob)));
};

// Maps the tiles  with the proper coordinates so they do not
// Overlap on the PDF.
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


// Creates and saves the PDF document using the jsPDF library.
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

//Exports the PDF to be downloaded by the user. Woo!
const exportPDF = () => {
  $('#icon-text').empty();
  $('#icon-text').append('Generating...');

  droneDeployAPI
  .then(fetchPlan)
  .then(fetchTileData)
  .then(fetchTiles)
  .then(fetchTileImageData)
  .then(convertToBlobs)
  .then(convertToObjectUrls)
  .then(createPDF);
};

$('document').ready(() => {
  $('.pdf-button').on('click', exportPDF);
});
