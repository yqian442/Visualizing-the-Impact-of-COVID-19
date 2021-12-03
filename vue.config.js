module.exports = {
    configureWebpack: {
        devtool: 'source-map'
    },
    publicPath: process.env.NODE_ENV === 'production'
        ? '/project-yyjs/'  //production path
        : '/'  //development path
}