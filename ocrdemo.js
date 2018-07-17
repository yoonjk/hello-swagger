// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
console.log('ocr test')
// Creates a client
const RESOURCES_PATH = './resources/';
const fileName = RESOURCES_PATH + process.argv[2];

console.log('fileName:', fileName)
detectText(fileName);

function detectText(fileName) {
  // [START vision_text_detection]
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();
  client
    .textDetection(fileName)
    .then(results => {
      const detections = results[0].textAnnotations;
      //detections.forEach(text => console.log(text));
      console.log('Detection Text:', detections[0].description);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
// [END vision_text_detection]
}
