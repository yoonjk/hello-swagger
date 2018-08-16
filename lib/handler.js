const i18=require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

let Handler = function() {
  this.states={};
};

Handler.prototype.registerLanguages = function(languages) {
    this.languages = languages;
    if (this.languages) {
        i18.use(sprintf).init({
            lng: 'en-US',
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languages
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
            return results;
        } else {
            return i18.t.apply(i18, arguments);
        }
    }
    return text;
};
