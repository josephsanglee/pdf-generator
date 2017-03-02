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

/***************************EVENT HANDLERS***************************/

const exportPDF = () => {
  $('#icon-text').empty();
  $('#icon-text').append('Generating...');

  droneDeployAPI
  .then(fetchPlan)
  .then(fetchTileDataFromPlan)
  .then(fetchTiles)
  .then(tiles => {
    const doc = new jsPDF();
    doc.setFontSize(40);
    doc.text(80, 25, 'A MAP');
    const imgSize = 35;
    let curX = -10;
    let curY = 50;
    
    const tilesPromises = tiles.map((tile) => {
      return fetch(`https://dd-app-proxy-server.herokuapp.com/${tile}`);
    });

    Promise.all(tilesPromises)
    .then((responses) => {
      return Promise.all(responses.map(response => response.blob()));
    })
    .then((blobs) => {
      return Promise.all(blobs.map(blob => URL.createObjectURL(blob)));
    })
    .then((urls) => {
      const urlPromises = urls.map((url) => {
        let x = curX;
        let y = curY;
        curY += imgSize;

        if (curY >= imgSize * 6 + 50) {
          curX += imgSize;
          curY = 50;
        }

        return new Promise((resolve, reject) => {
          const image = new Image();
          image.src = url;

          image.onload = () => {
            doc.addImage(image, 'PNG', x, y, imgSize, imgSize);
            resolve();
          };
        });
      });

      Promise.all(urlPromises)
      .then((success) => {
        $('#icon-text').empty();
        $('#icon-text').append('Generate');
        doc.save('map.pdf');
      });
    });
  });
};

$('document').ready(() => {
  $('.pdf-button').on('click', exportPDF);
});
