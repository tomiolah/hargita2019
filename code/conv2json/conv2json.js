const fs = require('fs');
const util = require('util');
const os = require('os');

const NL = os.EOL;

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

// Save JSON data to file
function saveJSON(json) {
  if (fs.existsSync(`${__dirname}/json`)) {
    fs.unlinkSync(`${__dirname}/json/songs.json`);
    fs.rmdirSync(`${__dirname}/json`);
  }

  fs.mkdirSync(`${__dirname}/json`);
  fs.writeFileSync(`${__dirname}/json/songs.json`, JSON.stringify(json));
}

// Transform tag to EW tag
function transformTag2EW(tag) {
  let end = `${NL}`;
  let num = 0;
  if (/.*[0-9]+/.test(tag)) {
    end = ` ${tag[tag.length-1]}${NL}`;
    num = 1;
  }
  let output = '';
  let tag2 = tag;
  output = `${tag.charAt(0).toUpperCase()}${tag2.slice(1,tag2.length-num)}`;
  return output + end;
}

// Save in EW format, in separate files
function saveEW(songs) {
  fs.mkdirSync(`${__dirname}/ew`);

  songs.forEach(song => {
    console.log(song.title);
    fs.writeFileSync(`${__dirname}/ew/${song.title}.txt`, song.text);
  });
}

// Transform JSON to EW syntax
function JSON2EW(data) {
  let songsEW = [];
  data.forEach(song => {
    let { title } = song;
    let output = '';
    song.parts.forEach(tag => {
      let tagEW = transformTag2EW(tag.tag);
      output += tagEW;
      tag.slides.forEach(slide => {
        output += slide.join(NL) + NL + NL;
      })
    });
    console.log(`${NL}${NL}----------------${NL}${title}${NL}----------------${NL}`);
    console.log(output);
    console.log();
    songsEW.push({
      title,
      text: output,
    });
  });

  return songsEW;
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

  saveJSON(songs);
  let ewsongs = JSON2EW(songs);
  saveEW(ewsongs);
}

main(process.argv.splice(1,process.argv.length-1));