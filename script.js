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
  $('#icon-text').empty();
  $('#icon-text').append('Generating...');
  droneDeployAPI
  .then(fetchPlan)
  .then(fetchTileDataFromPlan)
  .then(fetchTiles)
  .then(tiles => {
    const doc = new jsPDF();
    
    //
    const tilesPromises = tiles.map((tile) => {
      return fetch(`https://cors-anywhere.herokuapp.com/${tile}`);
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
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.src = url;

          image.onload = () => {
            doc.addImage(image, 'PNG', 15, 40, 180, 160);
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

    console.log('hi');
  });

  console.log('hitting the button');
};

/*fetch('https://cors-anywhere.herokuapp.com/https://public-tiles.dronedeploy.com/1487970337_JOSEPHSANGOPENPIPELINE_ortho_afi/17/30310/51502.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wdWJsaWMtdGlsZXMuZHJvbmVkZXBsb3kuY29tLzE0ODc5NzAzMzdfSk9TRVBIU0FOR09QRU5QSVBFTElORV9vcnRob19hZmkvKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTQ5MDkzMzg3Mn19fV19&Signature=VuBqMmkcDL1HJiLUf1lOPJsAT8KaaEmnHv05YRBgxGfFLEg7dd21FX90PsAhUV3HA1bEd9GZ0tSqcnEP~C0CM3no2fJ360SnGFLsL-y7Iw6hOBZJODtKCys21xSUL~2TsHk-xaHCZqNSOBp7yE7sbZjR5DIVclSMqwrI1D3AEOjWq1DOuma4vLgjS11Hi2RTUJ8N5NP6ZzF0ldbpeKTIUwiWFhfV5xVw4Kodos8pattZfUEfpkBy9UESBem8oDOrXS9~z5M2mgkhbWP9b9HGufXpf3zQVpV2~nCottHCj8AIZ29Cxzdc9pOlnQHZk8x1~LnQPN4N47TLbIt38pCj~Q__&Key-Pair-Id=APKAJXGC45PGQXCMCXSA')
    .then(function(response) {
      return response.blob();
}).then(function(blob) {
  var objectURL = URL.createObjectURL(blob);
  myImage.src = objectURL;
});
*/
$('document').ready(() => {
  $('.pdf-button').on('click', exportPDF);
});
