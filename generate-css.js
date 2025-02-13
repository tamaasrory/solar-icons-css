const fs = require("fs");
const path = require("path");

const rootFolder = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "icons");
const cssFilePath = path.join(__dirname, "dist/style.css");

function getAllSvgFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllSvgFiles(filePath, fileList);
    } else if (path.extname(file) === ".svg") {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const svgFiles = getAllSvgFiles(rootFolder);
const cssContentByType = {};

svgFiles.forEach((file) => {
  const relativePath = path.relative(__dirname, file);
  let relativePathArray = relativePath.toLowerCase().split(path.sep);
  const temp = relativePathArray.pop();
  relativePathArray.pop();
  relativePathArray.push(temp);
  relativePathArray = relativePathArray.filter(v => !['svg', 'icons'].includes(v));
  relativePathArray = relativePathArray.join(path.sep);
  const iconType = relativePathArray.split(path.sep)[0];
  const className = `.si-${relativePathArray
    .replace(/\\/g, "/")
    .replace(/\//g, "-")
    .replace(/\.svg$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")}`;
  const cssRule = `${className} {
    display: block;
    width: 24px;
    height: 24px;
    mask-repeat: no-repeat;
    mask-size: contain;
    mask-image: url("../${relativePath.replace(/\\/g, "/")}");
    background-color: currentColor;
}`;

  if (!cssContentByType[iconType]) {
    cssContentByType[iconType] = [];
  }
  cssContentByType[iconType].push(cssRule);
});

Object.keys(cssContentByType).forEach((iconType) => {
  const cssContent = cssContentByType[iconType].join("\n\n");
  const cssFilePath = path.join(__dirname, `dist/${iconType.replaceAll(' ','-')}.css`);
  fs.writeFile(cssFilePath, cssContent, (err) => {
    if (err) {
      console.error(`Error writing CSS file for ${iconType.replaceAll(' ','-')}:`, err);
    } else {
      console.log(`CSS file for ${iconType.replaceAll(' ','-')} generated successfully.`);

      // Minify CSS content
      const minifiedCssContent = cssContent.replace(/\s+/g, " ").trim();
      const minifiedCssFilePath = path.join(__dirname, `dist/${iconType.replaceAll(' ','-')}.min.css`);
      fs.writeFile(minifiedCssFilePath, minifiedCssContent, (err) => {
        if (err) {
          console.error(`Error writing minified CSS file for ${iconType.replaceAll(' ','-')}:`, err);
        } else {
          console.log(`Minified CSS file for ${iconType.replaceAll(' ','-')} generated successfully.`);
        }
      });
    }
  });
});

const allCssContent = Object.values(cssContentByType).flat().join("\n\n");
const allCssFilePath = path.join(__dirname, "dist/solar-icons.css");
fs.writeFile(allCssFilePath, allCssContent, (err) => {
  if (err) {
    console.error("Error writing solar-icons.css file:", err);
  } else {
    console.log("solar-icons.css file generated successfully.");

    // Minify all CSS content
    const minifiedAllCssContent = allCssContent.replace(/\s+/g, " ").trim();
    const minifiedAllCssFilePath = path.join(__dirname, "dist/solar-icons.min.css");
    fs.writeFile(minifiedAllCssFilePath, minifiedAllCssContent, (err) => {
      if (err) {
        console.error("Error writing solar-icons.min.css file:", err);
      } else {
        console.log("solar-icons.min.css file generated successfully.");
      }
    });
  }
});