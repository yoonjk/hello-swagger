const i18=require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const langDetector = require('i18next-browser-languagedetector');
console.log('handler');
let Handler = function() {
  this.states={};
};

Handler.prototype.registerLanguages = function(languages) {
    this.languages = languages;
    this.resources = {
        dev: { translation: { "TRY_AGAIN": "test Sorry, please try again later", } },
        en: { translation: { "TRY_AGAIN": "Sorry, please try again later", } },            
        'en-US': { translation: { "TRY_AGAIN": "Sorry, please try again later", } },
        'ko-KR': { translation: {"TRY_AGAIN": "죄송합니다. 나중에 다시 시도해주세요r", }}
      };
    if (this.languages) {
        console.log('language:', this.languages)
        i18.use(langDetector);
        i18.use(sprintf).init({
            //resStore: '../locales/__lng__.json',
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
           // resources: languages

           fallbackLng: { 
            'ko-KR': ['ko-KR'], 
            'en-US': ['en'],
            'default': ['en-US']
        } ,
           resources:  this.languages 
        }, (err, t) => {
            if (err) {
                logger.error(`Failed to register languages: ${err}`);
            }
        });
    }
}

Handler.prototype.t = function (text) {
    if (this.languages) {
        if (Array.isArray(text)) {
            let results = [];
            for (let t of text) {
                results.push(this.t(t));
            }
            console.log('1. handler.t')
            return results;
        } else {
            console.log('2. handler.t')
            return i18.t.apply(i18, arguments);
        }
    }
    return text;
};

module.exports = Handler;
