"use strict";

const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const externalLibs = [
    {
        module: "react",
        global: "React",
        prod: "umd/react.production.min.js",
        dev: "umd/react.development.js",
        entry: null
    },
    {
        module: "react-dom",
        global: "ReactDOM",
        prod: "umd/react-dom.production.min.js",
        dev: "umd/react-dom.development.js",
        entry: null
    }
];

const extensions = [".ts", ".tsx", ".js", ".less"];
const loaders = {
    rules: [
        { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        {
            test: /\.less$/,
            use: [
                { loader: "style-loader" },
                { loader: "css-loader" },
                { loader: "less-loader" }
            ]
        }
    ]
};

module.exports = {
    entry: "./src/bootstrap.tsx",
    resolve: { extensions },
    module: loaders,
    externals: externalLibs,
    plugins: [
        new CleanWebpackPlugin(["dist"]),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/templates/index.template.ejs",
            title: "Tic-Tac-Toe",
            inject: "body",
            minify: {
                removeComments: true,
                collapseWhitespace: true
            }
        })
    ],
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js"
    }
};
