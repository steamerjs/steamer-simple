import "./index.less";
import "./index.styl";

const tmpl = require('./toast.handlebars');
$('#pages').html(tmpl({text: 'hello big uncle!'}));
