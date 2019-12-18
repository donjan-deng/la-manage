const express = require('express');

const app = express();
const config = {
    root: __dirname + '/dist',
    port: process.env.PORT || 4200
};

//静态资源
app.use('/', express.static(config.root));

//所有路由都转到index.html
app.all('*', function (req, res) {
    res.sendfile(config.root + '/index.html');
});
app.listen(config.port, () => {
    console.log("running……");
})