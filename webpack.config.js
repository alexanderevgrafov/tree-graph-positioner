const webpack               = require( 'webpack' ),
      WebpackNotifierPlugin = require( 'webpack-notifier' ),
      HtmlWebpackPlugin     = require( 'html-webpack-plugin' ),
      path                  = require( 'path' ),
      Clean                 = require( 'clean-webpack-plugin' ),
      InterpolateHtmlPlugin = require( 'interpolate-html-plugin' ),
      package_json          = require( './package.json' ),
      develop               = process.argv.indexOf( '--env.develop' ) >= 0;

process.env.NODE_ENV = develop ? 'development' : 'production';

const dist                 = path.join( __dirname, process.env.WEBPACK_DIST || 'public/build' ),
      lpad                 = x => ('0' + x).substr( -2 ),
      now                  = new Date(),
      build_version        = package_json.version.substr( 0, package_json.version.length - 2 ) + '.' +
                             (now.getFullYear() - 2000) + lpad( now.getMonth() + 1 ) + lpad( now.getDate() ) +
                             lpad( now.getHours() ) + lpad( now.getMinutes() ),
      paths                = require( './paths' ),
      getClientEnvironment = require( './env' ),
      publicPath           = paths.servedPath,
      publicUrl            = publicPath.slice( 0, -1 ),
      env                  = getClientEnvironment( publicUrl ),

      plugins              = [
          new webpack.ProvidePlugin( {
              $        : 'jquery',
              jQuery   : 'jquery',
              jQueryUI : 'jquery-ui',
              _        : 'lodash'
          } )
      ];

if( !develop && env.stringified[ 'process.env' ].NODE_ENV !== '"production"' ) {
    throw new Error( 'Production builds must have NODE_ENV=production.' );
}

console.log( (develop ? 'DEVELOP' : 'PRODUCTION') + ' build configuration. Ver ' + build_version );
console.log( 'My dir name is', __dirname );

process.traceDeprecation = !develop;

plugins.push(
    new HtmlWebpackPlugin( {
        inject   : true,
        filename : '../index.html',
        template : 'src/index.html',
        minify   : !develop ? {
            removeComments                : true,
            collapseWhitespace            : true,
            removeRedundantAttributes     : true,
            useShortDoctype               : true,
            removeEmptyAttributes         : true,
            removeStyleLinkTypeAttributes : true,
            keepClosingSlash              : true,
            minifyJS                      : true,
            minifyCSS                     : true,
            minifyURLs                    : true,
        } : {},
    } ) );

plugins.push(
    new InterpolateHtmlPlugin( env.raw )
);

plugins.push(
    new webpack.DefinePlugin( env.stringified )
);

develop && plugins.push( new WebpackNotifierPlugin( { alwaysNotify : true } ) );
!develop && plugins.push( new Clean( [ dist + '/*.*' ] ) );

let config = {
    mode : develop ? 'development' : 'production',

    entry : {
        app : './src/app.js'
    },

    output : {
        path       : dist,
        publicPath : './build/',
        filename   : 'app_[hash:5].js'
    },

    devtool : develop && 'source-map',

    plugins : plugins,

    resolve : {
        modules    : [ 'node_modules' ],
        alias      : {
            app       : path.resolve( __dirname, 'src', 'js', 'app' ),
            ui        : path.resolve( __dirname, 'src', 'js', 'ui' ),
            models    : path.resolve( __dirname, 'src', 'js', 'models' ),
            lib       : path.resolve( __dirname, 'src', 'js', 'lib' ),
            scss      : path.resolve( __dirname, 'src', 'scss' ),
            templates : path.resolve( __dirname, 'src', 'templates' ),
            server    : path.resolve( __dirname, 'src', 'server' )
        },
        extensions : [ '.ts', '.tsx', '.js', '.jsx' ]
    },

    module : {
        rules : [
            {
                test    : /\.(js|jsx|ts|tsx)?$/,
                exclude : /(node_modules)/,
                loader  : 'ts-loader'
            },
            {
                test   : /\.hbs$/,
                loader : 'handlebars-loader'
            },
            {
                test : /\.scss$/,
                use  : [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    'sass-loader' // compiles Sass to CSS
                ]
            },
            {
                test   : /\.less$/,
                loader : 'style-loader!css-loader!less-loader'
            },
            {
                test   : /\.css$/,
                loader : 'style-loader!css-loader'
            },
            {
                test   : /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader : 'url-loader?limit=10000&minetype=application/font-woff'
            },
            {
                test   : /\.(jpg|png|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader : 'file-loader?name=assets/[name].[hash:5].[ext]'
            }
        ]
    }
};

config.optimization = {
    splitChunks : {
        cacheGroups : {
            vendors : {
                test     : /[\\/]node_modules[\\/]/,
                chunks   : 'all',
                maxSize            : 300000,
                priority : 1
            }
        }
    }
};

module.exports = config;
