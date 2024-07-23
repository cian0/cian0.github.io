const fs = require('fs');

function log(message, data = null) {
  console.log(`[LOG] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function jsonToTxt(json) {
  log('Starting JSON to TXT conversion');
  log('Input JSON:', json);

  const { tempo, timeSignature, tracks } = json;
  let txt = `${tempo};${timeSignature.join('/')}\n`;
  log('Generated header:', txt);

  tracks.forEach((track, index) => {
    log(`Processing track ${index + 1}: ${track.name}`);
    const { name, instrument, volume, notes, effects } = track;
    txt += `T:${name};${instrument.type}`;
    log('Track header:', txt);

    if (instrument.options) {
      log('Processing instrument options');
      const options = Object.entries(instrument.options).map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}:${Object.entries(value).map(([k, v]) => `${k},${v}`).join(',')}`;
        }
        return `${key}:${value}`;
      }).join(';');
      txt += `{${options}}`;
      log('Instrument options added:', options);
    }

    if (effects) {
      log('Processing effects');
      effects.forEach(effect => {
        const effectStr = `;${effect.type}{${Object.entries(effect.options).map(([k, v]) => `${k},${v}`).join(';')}}`;
        txt += effectStr;
        log('Effect added:', effectStr);
      });
    }

    txt += `;${volume}\n`;
    log('Track volume added');

    log('Processing notes');
    const notesStr = `N:${notes.map(note => {
      const { pitch, duration, time } = note;
      return `${pitch || 'undefined'},${duration},${time}`;
    }).join(';')}\n`;
    txt += notesStr;
    log('Notes added:', notesStr);
  });

  log('JSON to TXT conversion complete');
  log('Final TXT output:', txt);
  return txt;
}

function txtToJson(txt) {
  log('Starting TXT to JSON conversion');
  log('Input TXT:', txt);

  const lines = txt.trim().split('\n');
  log('Split input into lines:', lines);

  const [tempo, timeSignature] = lines[0].split(';');
  log('Extracted tempo and time signature:', { tempo, timeSignature });

  const tracks = [];
  let currentTrack = null;

  for (let i = 1; i < lines.length; i++) {
    log(`Processing line ${i + 1}: ${lines[i]}`);

    if (lines[i].startsWith('T:')) {
      if (currentTrack) {
        tracks.push(currentTrack);
        log('Added current track to tracks array', currentTrack);
      }
      const [name, ...rest] = lines[i].slice(2).split(';');
      currentTrack = { name, instrument: { type: '', options: {} }, volume: 0, notes: [] };
      log('Created new current track', currentTrack);
      
      rest.forEach(item => {
        if (item.includes('{')) {
          log('Processing item with options:', item);
          const [type, optionsStr] = item.split('{');
          const options = parseOptions(optionsStr.slice(0, -1));
          if (!currentTrack.instrument.type) {
            currentTrack.instrument.type = type;
            currentTrack.instrument.options = options;
            log('Added instrument options', currentTrack.instrument);
          } else {
            if (!currentTrack.effects) currentTrack.effects = [];
            currentTrack.effects.push({ type, options });
            log('Added effect', currentTrack.effects[currentTrack.effects.length - 1]);
          }
        } else if (!isNaN(item)) {
          log('Processing volume:', item);
          currentTrack.volume = parseInt(item);
          log('Set volume', currentTrack.volume);
        }
      });
    } else if (lines[i].startsWith('N:')) {
      log('Processing notes');
      currentTrack.notes = lines[i].slice(2).split(';').map(note => {
        const [pitch, duration, time] = note.split(',');
        return { pitch: pitch !== 'undefined' ? pitch : undefined, duration, time };
      });
      log('Processed notes', currentTrack.notes);
    }
  }
  if (currentTrack) {
    tracks.push(currentTrack);
    log('Added final track to tracks array', currentTrack);
  }

  const result = { tempo: parseInt(tempo), timeSignature: timeSignature.split('/').map(Number), tracks };
  log('TXT to JSON conversion complete');
  log('Final JSON output:', result);
  return result;
}

function parseOptions(optionsStr) {
  log('Parsing options string:', optionsStr);
  const options = {};
  optionsStr.split(';').forEach(option => {
    const [key, value] = option.split(':');
    if (value.includes(',')) {
      options[key] = {};
      value.split(',').forEach((subOption, index, array) => {
        if (index % 2 === 0 && index + 1 < array.length) {
          options[key][subOption] = isNaN(array[index + 1]) ? array[index + 1] : Number(array[index + 1]);
        }
      });
    } else {
      options[key] = isNaN(value) ? value : Number(value);
    }
  });
  log('Parsed options:', options);
  return options;
}

function translate(input, outputFormat) {
  log('Starting translation');
  log('Input:', input);
  log('Output format:', outputFormat);

  let result;
  if (outputFormat === 'txt') {
    const json = typeof input === 'string' ? JSON.parse(input) : input;
    log('Parsed JSON input:', json);
    result = jsonToTxt(json);
  } else {
    const txt = typeof input === 'object' ? jsonToTxt(input) : input;
    log('Parsed TXT input:', txt);
    result = txtToJson(txt);
  }

  log('Translation complete');
  log('Result:', result);
  return result;
}

module.exports = { translate };