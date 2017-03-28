import "./index.less";
import "./index.styl";

const tmpl = require('./index.handlebars');
$('#pages').html(tmpl({text: 'hello world!'}));
