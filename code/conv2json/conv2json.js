const fs = require('fs');
const util = require('util');
const os = require('os');

// const NL = os.EOL;
const NL = '\n';

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

    part.split(/\n[\r]*\n[\r]*/).forEach(slide => {
      let lines = slide.split('\n');
      let filteredLines = [];
      lines.forEach(line => {
        // Special rule for gender-specific parts
        // if (line === '(Lányok)' || line === '(Együtt)') filteredLines.push('');
        let lineMod = line.replace('\r','');
        if (lineMod !== '') filteredLines.push(lineMod);
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



const alphabet = [
  'a', 'b', 'c',
  'd', 'e', 'f',
  'g', 'h', 'i',
  'j', 'k', 'l',
  'm', 'n', 'o',
  'p', 'q', 'r',
  's', 't', 'u',
  'v', 'w', 'x',
  'y', 'z'
];


// OpenLyrics
function transformTag2OL(tag) {
  if (tag==='end') return 'e';
  if (['1','2','3','4','5','6','7','8','9','0'].includes(tag[tag.length-1])) return `${tag[0]}${tag[tag.length-1]}`;
  else return `${tag[0]}`;
}

// Save in OL format, in separate files
function saveOL(songs) {
  fs.mkdirSync(`${__dirname}/openlyrics`);

  songs.forEach(song => {
    console.log(song.title);
    fs.writeFileSync(`${__dirname}/openlyrics/${song.title}.xml`, song.text);
  });
}

function orderOL(song) {
  let output = '';
  song.forEach(tag => {
    if (output !== '') output += ' ';
    let tagOL2 = transformTag2OL(tag.tag);
    if (tag.slides.length === 1) {
      output += tagOL2;
    } else {
      output += `${tagOL2}`;
      // let it = 0;
      // tag.slides.forEach(slide => {
        // if (it > 0) output += ' ';
        // output += `${tagOL2}${alphabet[it]}`;
        // it++;
      // });
    }
  });
  console.log(output);
  return output
}

// Transform Tag to OL syntax
function tag2OL(tag) {
  let output = '';
  let tagOL = transformTag2OL(tag.tag);
  output += ``;

  if (tag.slides.length === 1) {
    output += `<verse name="${tagOL}">`;
    let slideOut = '<lines>';
    tag.slides[0].forEach(line => {
      let temp = line.trim();
      if (temp !== '') slideOut += `${temp}<br/>`;
    });
    output += slideOut;
    output += '</lines></verse>'
  } else {
    let it = 0;
    tag.slides.forEach(slide => {
      output += `<verse name="${tagOL}${alphabet[it]}">`;
      it++;
      let slideOut = '<lines>';
      slide.forEach(line => {
        let temp = line.trim();
        if (temp !== '') slideOut += `${temp}<br/>`;
      });
      output += `${slideOut}</lines>`;
      output += '</verse>'
    });
  }

  return output;
}

// Transform JSON to OL syntax
function JSON2OL(data) {
  let songsOL = [];
  data.forEach(song => {
    let { title } = song;
    let voltTag = [];
    let output = `<?xml version='1.0' encoding='UTF-8'?><song xmlns="http://openlyrics.info/namespace/2009/song" version="0.8" createdIn="OpenLP 1.9.0"><properties><verseOrder>${orderOL(song.parts)}</verseOrder><titles><title>${title}</title></titles></properties><lyrics>`;
    song.parts.forEach(tag => {
      if (!voltTag.includes(tag.tag)) {
        voltTag.push(tag.tag);
        output += tag2OL(tag);
      }
    });
      output += '</lyrics></song>';
      console.log();
      console.log(output);
      console.log();
      songsOL.push({
        title,
        text: output,
      });
  });

  return songsOL;
}



// EASY WORSHIP
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
  let olsongs = JSON2OL(songs);
  saveOL(olsongs);
}

main(process.argv.splice(1,process.argv.length-1));