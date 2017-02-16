import "./index.less";
import "./index.styl";

const tmpl = require('./toast.ejs');
$('#pages').html(tmpl({text: 'hello big uncle!'}));
