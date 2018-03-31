"use strict";

const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");
const HtmlWebpackExternalsPlugin = require("html-webpack-externals-plugin");

const externals = common.externals;
externals.forEach(lib => (lib.entry = lib.prod));
delete common.externals;

module.exports = merge(common, {
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        new HtmlWebpackExternalsPlugin({ externals })
    ]
});
