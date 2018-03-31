"use strict";

const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackExternalsPlugin = require("html-webpack-externals-plugin");

const externals = common.externals;
externals.forEach(lib => (lib.entry = lib.dev));
delete common.externals;

module.exports = merge(common, {
    devtool: "source-map",
    plugins: [
        new CopyPlugin(["./src/quiz.json", "./src/new_format.json"]),
        new HtmlWebpackExternalsPlugin({ externals })
    ]
});
