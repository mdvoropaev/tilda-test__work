const {
  src,
  dest,
  parallel,
  series,
  watch
} = require("gulp");
const sass = require("gulp-sass");
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const fileInclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const svgSprite = require("gulp-svg-sprite");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const image = require("gulp-image");
const fs = require("fs");
const {
  readFileSync
} = require("fs");
const concat = require("gulp-concat");
const del = require("del");
const gulpif = require("gulp-if");
const rev = require("gulp-rev");
const revRewrite = require("gulp-rev-rewrite");
const revDel = require("gulp-rev-delete-original");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const uglify = require("gulp-uglify-es").default;
const tiny = require("gulp-tinypng-compress");

let isProd = false; // dev by default

const fonts = () => {
  src("./src/resources/fonts/**.ttf")
    .pipe(ttf2woff())
    .pipe(dest("./app/fonts/"));
  return src("./src/resources/fonts/**.ttf")
    .pipe(ttf2woff2())
    .pipe(dest("./app/fonts/"));
};

const checkWeight = fontname => {
  let weight = 400;
  switch (true) {
    case /Thin/.test(fontname):
      weight = 100;
      break;
    case /ExtraLight/.test(fontname):
      weight = 200;
      break;
    case /Light/.test(fontname):
      weight = 300;
      break;
    case /Regular/.test(fontname):
      weight = 400;
      break;
    case /Medium/.test(fontname):
      weight = 500;
      break;
    case /SemiBold/.test(fontname):
      weight = 600;
      break;
    case /Semi/.test(fontname):
      weight = 600;
      break;
    case /Bold/.test(fontname):
      weight = 700;
      break;
    case /ExtraBold/.test(fontname):
      weight = 800;
      break;
    case /Heavy/.test(fontname):
      weight = 700;
      break;
    case /Black/.test(fontname):
      weight = 900;
      break;
    default:
      weight = 400;
  }
  return weight;
};

const cb = () => {};

let srcFonts = "./src/scss/_fonts.scss";
let appFonts = "./app/fonts";

const fontsStyle = done => {
  let file_content = fs.readFileSync(srcFonts);

  fs.writeFile(srcFonts, "", cb);
  fs.readdir(appFonts, function (err, items) {
    if (items) {
      let c_fontname;
      for (let i = 0; i < items.length; i++) {
        let fontname = items[i].split(".");
        fontname = fontname[0];
        let font = fontname.split("-")[0];
        let weight = checkWeight(fontname);

        if (c_fontname != fontname) {
          fs.appendFile(
            srcFonts,
            '@include font-face("' +
            font +
            '", "' +
            "../fonts/" +
            fontname +
            '", ' +
            weight +
            ", 'normal'" +
            ");\r\n",
            cb
          );
        }
        c_fontname = fontname;
      }
    }
  });
  done();
  return del(["./app/fonts/**.ttf"]);
};

const svgSprites = () => {
  return src("./src/img/svg/**.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg"
          }
        }
      })
    )
    .pipe(dest("./app/img"));
};

const styles = () => {
  return src("./src/scss/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "expanded"
      }).on("error", notify.onError())
    )
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(
      cleanCSS({
        level: 2
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(dest("./app/css/"))
    .pipe(browserSync.stream());
};

const htmlInclude = () => {
  return src(["./src/*.html"])
    .pipe(
      fileInclude({
        prefix: "@",
        basepath: "@file"
      })
    )
    .pipe(dest("./app"))
    .pipe(browserSync.stream());
};

const htmlMinify = () => {
  return src("app/**/*.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true
      })
    )
    .pipe(dest("app"));
};

const imgToApp = () => {
  return src(["./src/img/**.jpg", "./src/img/**.png", "./src/img/**.jpeg"])
    .pipe(gulpif(isProd, image()))
    .pipe(dest("./app/img"));
};

const resources = () => {
  return src("./src/resources/**").pipe(dest("./app"));
};

const clean = () => {
  return del(["app/*"]);
};

const scripts = () => {
  src("./src/js/vendor/**.js")
    .pipe(concat("vendor.js"))
    .pipe(gulpif(isProd, uglify().on("error", notify.onError())))
    .pipe(dest("./app/js/"));
  return src([
      "./src/js/functions/**.js",
      "./src/js/components/**.js",
      "./src/js/main.js"
    ])
    .pipe(
      webpackStream({
        mode: "development",
        output: {
          filename: "main.js"
        },
        module: {
          rules: [{
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"]
              }
            }
          }]
        }
      })
    )
    .on("error", function (err) {
      console.error("WEBPACK ERROR", err);
      this.emit("end"); // Don't stop the rest of the task
    })

    .pipe(sourcemaps.init())
    .pipe(uglify().on("error", notify.onError()))
    .pipe(sourcemaps.write("."))
    .pipe(dest("./app/js"))
    .pipe(browserSync.stream());
};

const cache = () => {
  return src("app/**/*.{css,js,svg,png,jpg,jpeg,woff2}", {
      base: "app"
    })
    .pipe(rev())
    .pipe(dest("app"))
    .pipe(revDel())
    .pipe(rev.manifest("rev.json"))
    .pipe(dest("app"));
};

const rewrite = () => {
  const manifest = readFileSync("app/rev.json");

  return src("app/**/*.html")
    .pipe(
      revRewrite({
        manifest
      })
    )
    .pipe(dest("app"));
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./app"
    }
  });

  watch("./src/scss/**/*.scss", styles);
  watch("./src/index.html", htmlInclude);
  watch("./src/img/**.jpg", imgToApp);
  watch("./src/img/**.png", imgToApp);
  watch("./src/img/**.jpeg", imgToApp);
  watch("./src/img/**.svg", svgSprites);
  watch("./src/resources/**", resources);
  watch("./src/fonts/**.ttf", fonts);
  watch("./src/fonts/**.ttf", fontsStyle);
  watch("./src/js/**/*.js", scripts);
};

exports.styles = styles;
exports.watchFiles = watchFiles;
exports.fileinclude = htmlInclude;

exports.default = series(
  clean,
  parallel(htmlInclude, scripts, fonts, resources, imgToApp, svgSprites),
  fontsStyle,
  styles,
  watchFiles
);

const tinypng = () => {
  return src(["./src/img/**.jpg", "./src/img/**.png", "./src/img/**.jpeg"])
    .pipe(
      tiny({
        key: "", //deleted push version
        singFile: "/app/img/.tinypng-sigs",
        parallel: true,
        parallelMax: 50,
        log: true
      })
    )
    .pipe(dest("./app/img/"));
};

const stylesBuild = () => {
  return src("./src/scss/**/*.scss")
    .pipe(
      sass({
        outputStyle: "expanded"
      }).on("error", notify.onError())
    )
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(
      cleanCSS({
        level: 2
      })
    )
    .pipe(dest("./app/css/"));
};

const scriptsBuild = () => {
  src("./src/js/vendor/**.js")
    .pipe(concat("vendor.js"))
    .pipe(gulpif(isProd, uglify().on("error", notify.onError())))
    .pipe(dest("./app/js/"));
  return src([
      "./src/js/functions/**.js",
      "./src/js/components/**.js",
      "./src/js/main.js"
    ])
    .pipe(
      webpackStream({
        mode: "development",
        output: {
          filename: "main.js"
        },
        module: {
          rules: [{
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"]
              }
            }
          }]
        }
      })
    )
    .on("error", function (err) {
      console.error("WEBPACK ERROR", err);
      this.emit("end"); // Don't stop the rest of the task
    })
    .pipe(uglify().on("error", notify.onError()))
    .pipe(dest("./app/js"));
};

exports.build = series(
  clean,
  parallel(htmlInclude, scriptsBuild, fonts, resources, imgToApp, svgSprites),
  fontsStyle,
  stylesBuild,
  htmlMinify,
  tinypng
);

exports.cache = series(cache, rewrite);