const fs = require('fs');
const util = require('util');

function getContent(file) {
  return fs.readFileSync(file, {encoding: 'utf-8'});
}

function parse(data, name) {
  let song = {parts: []};
  let temp = data.split('\n[');
  temp.forEach((value, index) => {
    let part = '';
    let tag = '';
    let words = false;
    for (let i=(index===0)?1:0; i<value.length; i++) {
      if (words) part += value[i];
      else if (value[i] === ']') { words = true; i++; }
      else tag += value[i];
    }
    let slides = [];

    part.split('\n\n').forEach(slide => {
      let lines = slide.split('\n');
      let filteredLines = [];
      lines.forEach(line => {
        // Special rule for gender-specific parts
        if (line === '(Lányok)' || line === '(Együtt)') filteredLines.push('');
        if (line !== '') filteredLines.push(line);
      });
      slides.push(filteredLines);
    });

    let onePart = {
      tag,
      slides
    }

    song.parts.push(onePart);
  });
  let temp2 = name.split('/');
  let nameWTXT = temp2[temp2.length-1];
  let title = nameWTXT.split('.')[0];
  song.title = title;

  // The Song JSON is created
  return song;
}

const songs = [];

function main(args) {
  if (args.length === 1) {
    const { execSync } = require('child_process');
    const fileList = execSync('find "../../plain text"')
    let files = fileList.toString().split('\n');
    files.splice(0, 1);
    files.splice(files.length-1, 1);

    // File list acquired
    files.forEach(file => songs.push(parse(getContent(`${__dirname}/${file}`), file)));
  } else {
    // Files passed
    args.forEach((value, index) => {
      if (index > 0) {
          // Get content
          let content = getContent(value);
          songs.push(parse(content));
        }
    });
  }

  console.log(util.inspect(songs, { showHidden: false, depth: null }));
}

main(process.argv.splice(1,process.argv.length-1));